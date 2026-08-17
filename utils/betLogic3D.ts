export function getPermutations3D(num: string): string[] {
    const digits = num.split('');
    const perms = new Set<string>();
    const permute = (remaining: string[], current: string) => {
        if (remaining.length === 0) { perms.add(current); return; }
        for (let i = 0; i < remaining.length; i++) {
            permute([...remaining.slice(0, i), ...remaining.slice(i + 1)], current + remaining[i]);
        }
    };
    permute(digits, '');
    return [...perms];
}

export function getTutNumbers3D(core: string): string[] {
    return getPermutations3D(core).filter((perm) => perm !== core);
}

export function getTriples3D(): string[] {
    return Array.from({ length: 10 }, (_, i) => String(i).repeat(3));
}

export function getThwatNumbers3D(pair: string): string[] {
    if (!/^\d{2}$/.test(pair)) return [];
    return Array.from({ length: 10 }, (_, i) => `${pair[0]}${i}${pair[1]}`);
}

const NON_LETTER = '[^a-zA-Zက-႟฀-๿]';
const BOX_R_RE = new RegExp(`\\(r\\)|@|(${NON_LETTER}|^)[rR](${NON_LETTER}|$)`);

export function parsePastedBets3D(text: string, defaultAmount: string) {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const results: { number: string; amount: string; origin: string; setKey?: string }[] = [];
    const seen = new Set<string>();

    const add = (number: string, amount: string, origin: string, setKey?: string) => {
        const key = `${number}|${amount}`;
        if (!seen.has(key)) {
            seen.add(key);
            results.push({ number, amount, origin, setKey });
        }
    };

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) continue;

        const numberMatch = line.match(/^(\d{3})\b/);
        if (!numberMatch) continue;

        const number = numberMatch[1];
        const afterNumber = line.slice(numberMatch[0].length);
        const isBox = BOX_R_RE.test(afterNumber);

        const stripped = afterNumber.replace(/[rR]/g, ' ');
        const amountMatches = stripped.match(/\d{2,}/g) ?? [];

        let directAmount: string, boxAmount: string | null;

        if (amountMatches.length === 0) {
            directAmount = defaultAmount; boxAmount = isBox ? defaultAmount : null;
        } else if (amountMatches.length === 1) {
            directAmount = amountMatches[0]; boxAmount = isBox ? amountMatches[0] : null;
        } else {
            directAmount = amountMatches[0]; boxAmount = amountMatches[1];
        }

        add(number, directAmount, 'core');

        if (boxAmount !== null) {
            for (const perm of getTutNumbers3D(number)) {
                add(perm, boxAmount, 'set', `ခွေ (${number})`);
            }
        }
    }
    return results;
}