/**
 * A bet the backend rejected because some of its numbers are closed ("break")
 * or already at their sales limit. The 422 carries the exact numbers in `data`
 * so the player can be told which ones to take off the slip.
 */
export const BET_NUMBERS_UNAVAILABLE_CODE = 'BET_NUMBERS_UNAVAILABLE';

/**
 * Why a 'closed' entry was refused, when the backend knows something more
 * specific than "an admin shut this number". Additive and optional: an older
 * backend omits it and the entry still renders as a plain closed number.
 */
export type UnavailableBlockedBy = 'amount_mismatch' | 'reverse_unpaired';

export type UnavailableNumber = {
    /** Zero-padded: 2 digits for 2D, 3 for 3D. */
    number: string;
    reason: 'closed' | 'limit_reached';
    /** Amount still sellable on a limited number, e.g. "500.00"; null when closed. */
    remaining: string | null;
    blockedBy?: UnavailableBlockedBy;
};

function isUnavailableNumber(value: unknown): value is UnavailableNumber {
    if (value == null || typeof value !== 'object') return false;
    const entry = value as Record<string, unknown>;
    return (
        typeof entry.number === 'string' &&
        (entry.reason === 'closed' || entry.reason === 'limit_reached') &&
        (entry.remaining === null || typeof entry.remaining === 'string')
    );
}

/** The unavailable numbers carried by a rejected bet (an axios error), or null for any other error. */
export function readUnavailableNumbers(error: any): UnavailableNumber[] | null {
    const data = error?.response?.data?.data;
    if (data?.code !== BET_NUMBERS_UNAVAILABLE_CODE || !Array.isArray(data.unavailable_numbers)) return null;

    const numbers = data.unavailable_numbers.filter(isUnavailableNumber).map((entry: any) => {
        const blockedBy = entry.blocked_by;
        return blockedBy === 'amount_mismatch' || blockedBy === 'reverse_unpaired'
            ? { ...entry, blockedBy }
            : entry;
    });
    return numbers.length > 0 ? numbers : null;
}

function padBetNumber(number: string, betType: '2D' | '3D'): string {
    return number.trim().padStart(betType === '3D' ? 3 : 2, '0');
}

export function isUnavailableRow(rowNumber: string, unavailable: UnavailableNumber[], betType: '2D' | '3D'): boolean {
    const padded = padBetNumber(rowNumber, betType);
    return unavailable.some((entry) => padBetNumber(entry.number, betType) === padded);
}

/** True when a limited number has nothing left to sell. */
export function isSoldOut(entry: UnavailableNumber): boolean {
    return entry.remaining != null && Number(entry.remaining) <= 0;
}
