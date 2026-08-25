import { DeviceEventEmitter } from 'react-native';

const DEPOSIT_NOTIFICATION_EVENT = 'zarmani:deposit-notification';

export type DepositNotificationType = 'deposit_approved' | 'deposit_rejected';

export type DepositNotificationDetail = {
    type: DepositNotificationType;
    depositId: string | null;
};

export function dispatchDepositNotification(detail: DepositNotificationDetail) {
    DeviceEventEmitter.emit(DEPOSIT_NOTIFICATION_EVENT, detail);
}

export function listenForDepositNotifications(handler: (detail: DepositNotificationDetail) => void): () => void {
    const subscription = DeviceEventEmitter.addListener(DEPOSIT_NOTIFICATION_EVENT, handler);
    return () => subscription.remove();
}
