export type SupportChannelId = 'facebook' | 'telegram' | 'viber';

export type SupportChannel = {
    id: SupportChannelId;
    /** Value shown to the player and copied to the clipboard. */
    value: string;
    /** Deep link / URL opened when the row is tapped. */
    href: string;
};

/**
 * PLACEHOLDER HANDLES — replace with the real support accounts before release.
 * This is the single source of truth for both the Settings card and the
 * Help Center screen; nothing else should hardcode a support handle.
 */
export const SUPPORT_CHANNELS: SupportChannel[] = [
    { id: 'facebook', value: 'fb.com/zarmani108', href: 'https://facebook.com/zarmani108' },
    { id: 'telegram', value: '@zarmani108_support', href: 'https://t.me/zarmani108_support' },
    { id: 'viber', value: '09-123-456-789', href: 'viber://chat?number=%2B959123456789' },
];
