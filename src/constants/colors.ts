export const COLORS = {
    // ── BRAND ─────────────────────────────────────────────────────────────────
  // SkillHub's brand color — professional green (trust, growth, Africa)
  primary: '#1B7A4E',          // Main CTA, links, active states
  primaryDark: '#145C3A',      // Pressed state
  primaryLight: '#E8F5EE',     // Light backgrounds, secondary buttons
 
  // ── NEUTRALS ──────────────────────────────────────────────────────────────
  white: '#FFFFFF',
  black: '#000000',
  background: '#F7F8FA',       // Screen background
  surface: '#FFFFFF',          // Card/modal background
  border: '#E2E6EA',           // Default borders
  divider: '#F0F2F5',          // List separators
 
  // ── TEXT ──────────────────────────────────────────────────────────────────
  textPrimary: '#1A1D23',      // Headings, body
  textSecondary: '#5A6474',    // Labels, subtitles
  textTertiary: '#9BA5B4',     // Placeholders, hints
  textDisabled: '#C5CDD6',     // Disabled text
 
  // ── INPUT ─────────────────────────────────────────────────────────────────
  inputBackground: '#F2F4F7',  // Resting state bg
  inputFocused: '#FFFFFF',     // Focused state bg
 
  // ── SEMANTIC ──────────────────────────────────────────────────────────────
  // These carry universal meaning — don't use them for decoration
  success: '#1B7A4E',          // Same as primary for SkillHub
  warning: '#F59E0B',          // Caution states
  danger: '#DC2626',           // Errors, destructive actions
  info: '#2563EB',             // Informational messages
 
  // ── STATUS (booking states) ───────────────────────────────────────────────
  pending: '#F59E0B',
  accepted: '#2563EB',
  completed: '#1B7A4E',
  cancelled: '#DC2626',
} as const;

// Type helper — lets you use COLORS keys as a type
export type ColorKey = keyof typeof COLORS;