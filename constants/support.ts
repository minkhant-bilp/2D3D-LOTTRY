export type SupportChannelId = 'facebook' | 'telegram';

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
 */
export const SUPPORT_CHANNELS: SupportChannel[] = [
    { id: 'facebook', value: 'fb.com/Zarmani168', href: 'https://www.facebook.com/Zarmani168' },
    { id: 'telegram', value: '@Zarmani108S', href: 'https://t.me/Zarmani108S' },
];
