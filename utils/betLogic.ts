
export const POWER_PAIRS: [string, string][] = [
    ['05', '50'], ['16', '61'], ['27', '72'], ['38', '83'], ['49', '94']
];

export const NAKKHAT_PAIRS: [string, string][] = [
    ['07', '70'], ['18', '81'], ['24', '42'], ['35', '53'], ['69', '96']
];

export const BROTHER_PAIRS: [string, string][] = [
    ['01', '10'], ['12', '21'], ['23', '32'], ['34', '43'], ['45', '54'],
    ['56', '65'], ['67', '76'], ['78', '87'], ['89', '98'], ['09', '90']
];

export function createEmptyRow() {
    return {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        number: '',
        amount: ''
    };
}

const NON_LETTER = '[^a-zA-Zက-႟฀-๿]';
const R_RE = new RegExp(`\\(r\\)|@|(${NON_LETTER}|^)[rR](${NON_LETTER}|$)`);

export function parsePastedBets(text: string, defaultAmount: string) {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const results: any[] = [];
    const seen = new Set<string>();

    const add = (number: string, amount: string) => {
        const key = `${number}|${amount}`;
        if (!seen.has(key)) {
            seen.add(key);
            results.push({ ...createEmptyRow(), number, amount });
        }
    };

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) continue;

        const numberMatch = line.match(/^(\d{2})\b/);
        if (!numberMatch) continue;

        const number = numberMatch[1] as string; 
        const matchedText = numberMatch[0] as string;
        const afterNumber = line.slice(matchedText.length);
        
        const isReverse = R_RE.test(afterNumber);

        const stripped = afterNumber.replace(/[rR]/g, ' ');
        const amountMatches = stripped.match(/\d{2,}/g) ?? [];

        const amount = amountMatches[0] || defaultAmount;

        add(number, amount);

        if (isReverse) {
            const reverseNumber = number.split('').reverse().join('');
            if (reverseNumber !== number) {
                add(reverseNumber, amount);
            }
        }
    }
    
    return results;
}