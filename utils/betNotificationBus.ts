import { DeviceEventEmitter } from 'react-native';

const BET_NOTIFICATION_EVENT = 'zarmani:bet-notification';

export type BetNotificationType = 'bet_won' | 'bet_paid_out' | 'settlement_reverted';

export type BetNotificationDetail = {
    type: BetNotificationType;
    betId: string | null;
};

export function dispatchBetNotification(detail: BetNotificationDetail) {
    DeviceEventEmitter.emit(BET_NOTIFICATION_EVENT, detail);
}

export function listenForBetNotifications(handler: (detail: BetNotificationDetail) => void): () => void {
    const subscription = DeviceEventEmitter.addListener(BET_NOTIFICATION_EVENT, handler);
    return () => subscription.remove();
}
