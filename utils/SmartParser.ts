const NAKKHAT_NUMS = ['07', '70', '18', '81', '24', '42', '35', '53', '69', '96'];
const POWER_NUMS = ['05', '50', '16', '61', '27', '72', '38', '83', '49', '94'];
const BROTHER_NUMS = [
    '01', '10', '12', '21', '23', '32', '34', '43', '45', '54',
    '56', '65', '67', '76', '78', '87', '89', '98', '90', '09',
];

function reverseNum(n: string): string {
    return n[1] + n[0];
}

function generateInclude(digit: string): string[] {
    const nums: string[] = [];
    for (let i = 0; i <= 9; i++) {
        const a = `${digit}${i}`;
        const b = `${i}${digit}`;
        if (!nums.includes(a)) nums.push(a);
        if (b !== a && !nums.includes(b)) nums.push(b);
    }
    return nums;
}

function generatePat(digit: string): string[] {
    return Array.from({ length: 10 }, (_, i) => `${i}${digit}`);
}

function generateBreak(target: string): string[] {
    const t = parseInt(target, 10);
    const results: string[] = [];
    for (let i = 0; i < 100; i++) {
        const n = i.toString().padStart(2, '0');
        if ((parseInt(n[0], 10) + parseInt(n[1], 10)) % 10 === t) results.push(n);
    }
    return results;
}

const NON_LETTER_BOUNDARY = '[^a-zA-Z\u1000-\u109F\u0E00-\u0E7F]';
const REVERSE_RE = new RegExp(`\\(r\\)|@|(${NON_LETTER_BOUNDARY}|^)r(${NON_LETTER_BOUNDARY}|$)`, 'i');

function hasReverseMarker(line: string): boolean {
    return REVERSE_RE.test(line);
}

function stripReverseMarkers(line: string): string {
    let s = line.replace(/\(r\)/gi, ' ').replace(/@/g, ' ');
    const NLB = NON_LETTER_BOUNDARY;
    s = s.replace(new RegExp(`(${NLB}|^)r(\\d)`, 'gi'), '$1 $2');
    s = s.replace(new RegExp(`(\\d)r(${NLB}|$)`, 'gi'), '$1 $2');
    s = s.replace(new RegExp(`(${NLB}|^)r(${NLB}|$)`, 'gi'), '$1 $2');
    return s;
}

export function parsePastedBetsMobile(text: string): string[] {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const results: string[] = [];
    const seen = new Set<string>();

    const add = (number: string) => {
        if (!seen.has(number)) {
            seen.add(number);
            results.push(number);
        }
    };

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) continue;

        if (/ပါဝါ|power/i.test(line)) {
            for (const n of POWER_NUMS) add(n);
            continue;
        }
        if (/နက္ခတ်|နက်ခတ်|နက်ခက်|နတ်ခတ်|\bN\b/i.test(line)) {
            for (const n of NAKKHAT_NUMS) add(n);
            continue;
        }
        if (/ညီကို|ညီအစ်ကို/.test(line)) {
            for (const n of BROTHER_NUMS) add(n);
            continue;
        }

        const breakMatch = line.match(/(\d)\s*(?:ဘရိတ်|ဘရိပ်)/u) ?? line.match(/(\d)\s*(?:break|bk|b)(?:[^a-zA-Z]|$)/i);
        if (breakMatch != null) {
            for (const n of generateBreak(breakMatch[1])) add(n);
            continue;
        }

        const patMatch = line.match(/(\d)\s*(?:ပတ်|ပိတ်|ပါတ်)/u) ?? line.match(/(\d)\s*pat(?:[^a-zA-Z]|$)/i);
        if (patMatch != null) {
            for (const n of generatePat(patMatch[1])) add(n);
            continue;
        }

        const includeMatch = line.match(/(\d)\s*(?:အပါ|ပါ)/u) ?? line.match(/(\d)\s*p(?!ower)(?:[^a-zA-Z]|$)/i);
        if (includeMatch != null) {
            for (const n of generateInclude(includeMatch[1])) add(n);
            continue;
        }

        const isReverse = hasReverseMarker(line);
        const cleaned = stripReverseMarkers(line);
        const nums = [...new Set(cleaned.match(/\b\d{2}\b/g) ?? [])];

        for (const num of nums) {
            add(num);
            if (isReverse) {
                const rev = reverseNum(num);
                if (rev !== num) add(rev);
            }
        }
    }

    return results;
}