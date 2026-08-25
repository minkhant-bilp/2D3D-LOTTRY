import { DeviceEventEmitter } from 'react-native';

const SESSION_ENDED_EVENT = 'zarmani:session-ended';

/** Why the session ended, so the login screen can say something useful. */
export type SessionEndedReason = 'expired' | 'banned';

export function dispatchSessionEnded(reason: SessionEndedReason) {
    DeviceEventEmitter.emit(SESSION_ENDED_EVENT, reason);
}

export function listenForSessionEnded(handler: (reason: SessionEndedReason) => void): () => void {
    const subscription = DeviceEventEmitter.addListener(SESSION_ENDED_EVENT, handler);
    return () => subscription.remove();
}
