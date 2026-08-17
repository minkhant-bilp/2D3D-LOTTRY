import { DeviceEventEmitter } from 'react-native';

const WITHDRAWAL_NOTIFICATION_EVENT = 'zarmani:withdrawal-notification';

export type WithdrawalNotificationType = 'withdrawal_completed' | 'withdrawal_rejected';

export type WithdrawalNotificationDetail = {
    type: WithdrawalNotificationType;
    withdrawalId: string | null;
};

export function dispatchWithdrawalNotification(detail: WithdrawalNotificationDetail) {
    DeviceEventEmitter.emit(WITHDRAWAL_NOTIFICATION_EVENT, detail);
}

export function listenForWithdrawalNotifications(handler: (detail: WithdrawalNotificationDetail) => void): () => void {
    const subscription = DeviceEventEmitter.addListener(WITHDRAWAL_NOTIFICATION_EVENT, handler);
    return () => subscription.remove();
}