import { useAppStore } from '@/store/useAppStore';
import { dispatchBetNotification, type BetNotificationType } from '@/utils/betNotificationBus';
import { dispatchDepositNotification, type DepositNotificationType } from '@/utils/depositNotificationBus';
import { showAppToast } from '@/utils/toastBridge';
import { dispatchWithdrawalNotification, type WithdrawalNotificationType } from '@/utils/withdrawalNotificationBus';

const DEPOSIT_NOTIFICATION_TYPES: ReadonlySet<string> = new Set(['deposit_approved', 'deposit_rejected']);
const WITHDRAWAL_NOTIFICATION_TYPES: ReadonlySet<string> = new Set(['withdrawal_completed', 'withdrawal_rejected']);
const BET_NOTIFICATION_TYPES: ReadonlySet<string> = new Set(['bet_won', 'bet_paid_out', 'settlement_reverted']);

/** Where a tap on each notification type lands. */
// The deposit-history screen is still hardcoded mock data; the wallet
// transaction ledger is where an approved deposit actually shows up.
const DEPOSIT_ROUTE = '/gambling/transaction-record' as const;
const WITHDRAWAL_ROUTE = '/withdrawal/withdrawal-history' as const;
const BET_ROUTE = '/gambling/gambling-history' as const;
const INBOX_ROUTE = '/noti/notifications' as const;

/** Minimal shape shared by expo-notifications content and a tapped response. */
export type IncomingNotificationContent = {
    title?: string | null;
    body?: string | null;
    data?: Record<string, any> | null;
};

/** FCM stringifies every data value, so nothing here can be trusted as a number. */
function readId(data: Record<string, any> | null | undefined, key: string): string | null {
    const value = data?.[key];
    return value == null ? null : String(value);
}

export function resolveNotificationRoute(content: IncomingNotificationContent): string {
    const notificationType = content.data?.type;

    if (typeof notificationType !== 'string') return INBOX_ROUTE;
    if (DEPOSIT_NOTIFICATION_TYPES.has(notificationType)) return DEPOSIT_ROUTE;
    if (WITHDRAWAL_NOTIFICATION_TYPES.has(notificationType)) return WITHDRAWAL_ROUTE;
    if (BET_NOTIFICATION_TYPES.has(notificationType)) return BET_ROUTE;

    return INBOX_ROUTE;
}

/**
 * Single entry point for an incoming push, whether it arrived in the foreground
 * or was tapped from the tray. Refreshes the bell badge, then fans the payload
 * out to the wallet and the per-domain bus so any open history screen refetches.
 *
 * A tapped notification skips the toast — the OS banner already fired.
 */
export function handleNotificationPayload(
    content: IncomingNotificationContent,
    options: { showToast: boolean },
): void {
    const title = content.title ?? 'Zarmani108';
    const body = content.body;

    if (options.showToast) {
        showAppToast(body != null && body !== '' ? `${title}: ${body}` : title, 'info');
    }

    const { refreshNotifications, refreshWallet } = useAppStore.getState();
    void refreshNotifications();

    const notificationType = content.data?.type;
    if (typeof notificationType !== 'string') return;

    if (DEPOSIT_NOTIFICATION_TYPES.has(notificationType)) {
        void refreshWallet();
        dispatchDepositNotification({
            type: notificationType as DepositNotificationType,
            depositId: readId(content.data, 'deposit_id'),
        });
    } else if (WITHDRAWAL_NOTIFICATION_TYPES.has(notificationType)) {
        void refreshWallet();
        dispatchWithdrawalNotification({
            type: notificationType as WithdrawalNotificationType,
            withdrawalId: readId(content.data, 'withdrawal_id'),
        });
    } else if (BET_NOTIFICATION_TYPES.has(notificationType)) {
        void refreshWallet();
        dispatchBetNotification({
            type: notificationType as BetNotificationType,
            betId: readId(content.data, 'bet_id'),
        });
    }
}
