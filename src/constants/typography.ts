import type { TextStyle } from 'react-native';

export const TYPOGRAPHY = {
    // DEPRECATED — all three keys resolve to the same system face, so any
    // `fontFamily: TYPOGRAPHY.fontFamily.medium` renders at regular weight.
    // Kept only so existing imports keep compiling; use `fontWeight` below
    // for anything that needs to actually look heavier.
    fontFamily:{
        regular:'System',
        medium:'System',
        bold:'System'
    },

    // Real weight scale. These are the values that render.
    // Typed as TextStyle['fontWeight'] so `as const` string literals are
    // assignable to a style object without a cast at every call site.
    fontWeight: {
        regular:  '400',
        medium:   '500',
        semibold: '600',
        bold:     '700',
    } satisfies Record<string, TextStyle['fontWeight']>,

    fontSize:{
        xs:11,
        sm:13,
        md:15,
        lg:17,
        xl:20,
        xxl:24,
        xxxl:30,
    },

    lineHeight:{
        tight:1.2,
        normal:1.5,
        relaxed:1.7,
    },

} as const;