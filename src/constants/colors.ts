// export const COLORS = {
//     // ── BRAND ─────────────────────────────────────────────────────────────────
//   // SkillHub's brand color — professional green (trust, growth, Africa)
//   primary: '#1B7A4E',          // Main CTA, links, active states
//   primaryDark: '#145C3A',      // Pressed state
//   primaryLight: '#E8F5EE',     // Light backgrounds, secondary buttons
 
//   // ── NEUTRALS ──────────────────────────────────────────────────────────────
//   white: '#FFFFFF',
//   black: '#000000',
//   background: '#F7F8FA',       // Screen background
//   surface: '#FFFFFF',          // Card/modal background
//   border: '#E2E6EA',           // Default borders
//   divider: '#F0F2F5',          // List separators
 
//   // ── TEXT ──────────────────────────────────────────────────────────────────
//   textPrimary: '#1A1D23',      // Headings, body
//   textSecondary: '#5A6474',    // Labels, subtitles
//   textTertiary: '#9BA5B4',     // Placeholders, hints
//   textDisabled: '#C5CDD6',     // Disabled text
 
//   // ── INPUT ─────────────────────────────────────────────────────────────────
//   inputBackground: '#F2F4F7',  // Resting state bg
//   inputFocused: '#FFFFFF',     // Focused state bg
 
//   // ── SEMANTIC ──────────────────────────────────────────────────────────────
//   // These carry universal meaning — don't use them for decoration
//   success: '#1B7A4E',          // Same as primary for SkillHub
//   warning: '#F59E0B',          // Caution states
//   danger: '#DC2626',           // Errors, destructive actions
//   info: '#2563EB',             // Informational messages
 
//   // ── STATUS (booking states) ───────────────────────────────────────────────
//   pending: '#F59E0B',
//   accepted: '#2563EB',
//   completed: '#1B7A4E',
//   cancelled: '#DC2626',
// } as const;

// // Type helper — lets you use COLORS keys as a type
// export type ColorKey = keyof typeof COLORS;
// src/constants/colors.ts
// Brand: Blue and white theme with dark mode support

// src/constants/colors.ts
// Brand: Blue and white theme with dark mode support

// export const COLORS = {
//   // ── Brand ────────────────────────────────────────────────────────────────
//   primary: '#1D4ED8',        // Blue 700 — main brand color
//   primaryLight: '#EFF6FF',   // Blue 50  — light backgrounds, chips
//   primaryDark: '#1E3A8A',    // Blue 900 — pressed states, dark elements

//   // ── Semantic ─────────────────────────────────────────────────────────────
//   success: '#16A34A',
//   warning: '#D97706',
//   danger: '#DC2626',
//   info: '#0284C7',

//   // ── Neutral (light mode) ─────────────────────────────────────────────────
//   background: '#F8FAFC',     // Almost white — page background
//   surface: '#FFFFFF',        // Pure white — cards, inputs, bottom bar
//   border: '#CBD5E1',         // Slate 300
//   divider: '#E2E8F0',        // Slate 200
//   inputBackground: '#F1F5F9',// Slate 100

//   // ── Text ─────────────────────────────────────────────────────────────────
//   textPrimary: '#0F172A',    // Slate 900 — headings, body
//   textSecondary: '#475569',  // Slate 600 — subtitles, labels
//   textTertiary: '#94A3B8',   // Slate 400 — hints, placeholders
//   textDisabled: '#CBD5E1',   // Slate 300

//   // ── Utility ──────────────────────────────────────────────────────────────
//   white: '#FFFFFF',
//   black: '#000000',
//   transparent: 'transparent',

//   // ── Dark mode overrides (used when dark mode is active) ──────────────────
//   dark: {
//     primary: '#3B82F6',       // Blue 500 — slightly lighter for dark backgrounds
//     primaryLight: '#1E3A8A',  // Dark blue tint
//     background: '#0F172A',    // Slate 900
//     surface: '#1E293B',       // Slate 800
//     border: '#334155',        // Slate 700
//     divider: '#1E293B',       // Slate 800
//     inputBackground: '#1E293B',
//     textPrimary: '#F8FAFC',   // Slate 50
//     textSecondary: '#94A3B8', // Slate 400
//     textTertiary: '#475569',  // Slate 600
//   },
// };

// src/constants/theme.ts

export const lightColors = {
  primary: '#2563EB',
  primaryLight: '#EFF6FF',
  primaryDark: '#1D4ED8',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  info: '#0284C7',

  // Pure white and light grey — no blue tint
  background: '#F1F5F9',   // Slate 100 — cool light grey, not warm
  surface: '#FFFFFF',       // Pure white cards
  surfaceElevated: '#FFFFFF',
  border: '#E2E8F0',        // Slate 200 — very subtle
  divider: '#F1F5F9',       // Almost invisible dividers
  inputBackground: '#F8FAFC',

  textPrimary: '#0F172A',   // Slate 900 — near black
  textSecondary: '#475569', // Slate 600
  textTertiary: '#94A3B8',  // Slate 400
  textDisabled: '#CBD5E1',  // Slate 300
  textOnPrimary: '#FFFFFF', // White text on blue buttons

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const darkColors = {
  primary: '#3B82F6',       // Blue 500 — slightly lighter for dark backgrounds
  primaryLight: '#1E3A8A',  // Very dark blue for subtle tints only
  primaryDark: '#2563EB',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#38BDF8',

  // KEY FIX: pure grey surfaces — zero blue tint
  background: '#111827',    // Gray 900 — deepest background
  surface: '#1F2937',       // Gray 800 — card surface
  surfaceElevated: '#374151', // Gray 700 — elevated modals, dropdowns
  border: '#374151',        // Gray 700
  divider: '#1F2937',       // Same as surface — subtle
  inputBackground: '#374151', // Gray 700

  textPrimary: '#F9FAFB',   // Gray 50 — near white
  textSecondary: '#9CA3AF', // Gray 400
  textTertiary: '#6B7280',  // Gray 500
  textDisabled: '#4B5563',  // Gray 600
  textOnPrimary: '#FFFFFF',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export type AppColors = typeof lightColors;

// Static alias used by the few files that import COLORS directly (navigation, etc.)
// Always resolves to light colors; themed screens should use useAppTheme() instead.
export const COLORS = lightColors;