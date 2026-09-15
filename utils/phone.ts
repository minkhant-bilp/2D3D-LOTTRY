/**
 * Registration accepts mobile numbers from the two markets we serve. The player
 * picks the country code and types the local number (with or without the trunk
 * 0); the API receives E.164. Keep these rules in step with
 * `RegisterRequest::PHONE_REGEX` in stock_app_backend.
 */
export const PHONE_COUNTRIES = {
    MM: {
        dial: '+95',
        // 09 + 7–9 digits locally
        nationalPattern: /^9\d{7,9}$/,
        maxLocalLength: 11,
        placeholder: '09xxxxxxxxx',
    },
    TH: {
        dial: '+66',
        // 06 / 08 / 09 + 8 digits locally
        nationalPattern: /^[689]\d{8}$/,
        maxLocalLength: 10,
        placeholder: '08xxxxxxxx',
    },
} as const;

export type PhoneCountry = keyof typeof PHONE_COUNTRIES;

export const PHONE_COUNTRY_CODES = Object.keys(PHONE_COUNTRIES) as PhoneCountry[];

/** Keeps digits only and caps the length a local number can reach for the country. */
export function sanitizeLocalPhone(country: PhoneCountry, value: string): string {
    return value.replace(/\D/g, '').slice(0, PHONE_COUNTRIES[country].maxLocalLength);
}

/** Strips formatting and the single leading trunk 0. */
export function toNationalNumber(local: string): string {
    return local.replace(/\D/g, '').replace(/^0/, '');
}

export function isValidPhone(country: PhoneCountry, local: string): boolean {
    return PHONE_COUNTRIES[country].nationalPattern.test(toNationalNumber(local));
}

export function toE164(country: PhoneCountry, local: string): string {
    return `${PHONE_COUNTRIES[country].dial}${toNationalNumber(local)}`;
}
