export type SlipRow = { number: string; amount: string; isReverse?: boolean };

/** The one rule for a stake: a whole number of at least 1. `Number()` alone let "500.9" and "1e3" through. */
export const isValidAmount = (amount: string): boolean => /^\d+$/.test(amount.trim()) && Number(amount) >= 1;

/**
 * Sums stakes per number for the bet payload. Keyed on number AND origin:
 * merging on the number alone erased the R flag and folded a reverse leg into a
 * direct one, which the backend then refused on a closed first digit.
 */
export function mergeBetRows(rows: SlipRow[], digits: 2 | 3): { number: string; amount: number; origin: 'direct' | 'reverse' }[] {
    const merged = new Map<string, { number: string; amount: number; origin: 'direct' | 'reverse' }>();
    for (const row of rows) {
        if (row.number.length !== digits || !isValidAmount(row.amount)) continue;
        const origin = row.isReverse === true ? 'reverse' : 'direct';
        const key = `${row.number}|${origin}`;
        const amount = parseInt(row.amount, 10);
        const existing = merged.get(key);
        if (existing) existing.amount += amount;
        else merged.set(key, { number: row.number, amount, origin });
    }
    return [...merged.values()];
}
