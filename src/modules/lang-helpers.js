// Helper function to get language code - now always returns 'en' since we're English-only

export function langCode() {
    // Always return 'en' since we're English-only
    return 'en';
};

// Mock event listeners since we don't have i18n anymore
export const on = () => {};
export const off = () => {};

export function useLangCode() {
    // Always return 'en' since we're English-only
    return 'en';
}
