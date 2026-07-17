export const NAKKHAT_PAIRS: [string, string][] = [['07', '70'], ['18', '81'], ['24', '42'], ['35', '53'], ['69', '96']];
export const POWER_PAIRS: [string, string][] = [['05', '50'], ['16', '61'], ['27', '72'], ['38', '83'], ['49', '94']];
export const BROTHER_PAIRS: [string, string][] = [
    ['01', '10'], ['12', '21'], ['23', '32'], ['34', '43'], ['45', '54'],
    ['56', '65'], ['67', '76'], ['78', '87'], ['89', '98'], ['90', '09']
];

export const generateId = () => Math.random().toString(36).substr(2, 9);
export const createEmptyRow = () => ({ id: generateId(), number: '', amount: '' });

export function getPermutations3D(str: string): string[] {
    if (str.length <= 1) return [str];
    const perms = new Set<string>();
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        const remaining = str.slice(0, i) + str.slice(i + 1);
        for (const perm of getPermutations3D(remaining)) {
            perms.add(char + perm);
        }
    }
    return Array.from(perms);
}

export function parsePastedBets(text: string, defaultAmount: string): { id: string; number: string; amount: string }[] {
    return [];
}
export function parsePastedBets3D(text: string, defaultAmount: string): { id: string; number: string; amount: string }[] {

    return [];
}