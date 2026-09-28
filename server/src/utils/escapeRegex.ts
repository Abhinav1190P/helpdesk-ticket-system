// Escape user input before using it in a RegExp (prevents ReDoS / regex injection)
export const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
