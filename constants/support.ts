export type SupportChannelId = 'facebook' | 'telegram' | 'viber';

export type SupportChannel = {
    id: SupportChannelId;
    /** Value shown to the player and copied to the clipboard. */
    value: string;
    /** Deep link / URL opened when the row is tapped. */
    href: string;
};

/**
 * The single source of truth for both the Settings card and the Help Center
 * screen; nothing else should hardcode a support handle.
 * NOTE: the viber number is still a placeholder.
 */
export const SUPPORT_CHANNELS: SupportChannel[] = [
    { id: 'facebook', value: 'fb.com/Zarmani168', href: 'https://www.facebook.com/Zarmani168' },
    { id: 'telegram', value: '@Zarmani108S', href: 'https://t.me/Zarmani108S' },
    { id: 'viber', value: '09-123-456-789', href: 'viber://chat?number=%2B959123456789' },
];
