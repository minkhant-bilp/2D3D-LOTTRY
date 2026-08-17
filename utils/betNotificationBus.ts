import { DeviceEventEmitter } from 'react-native';

const BET_NOTIFICATION_EVENT = 'zarmani:bet-notification';

export function dispatchBetNotification() {
    DeviceEventEmitter.emit(BET_NOTIFICATION_EVENT);
}

export function listenForBetNotifications(handler: () => void): () => void {
    const subscription = DeviceEventEmitter.addListener(BET_NOTIFICATION_EVENT, handler);
    return () => subscription.remove();
}