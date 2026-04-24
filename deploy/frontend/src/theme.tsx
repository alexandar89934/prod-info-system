import { ThemeMode } from '@/state/theme/theme.types.ts';

type ColorToken = {
  [key: number]: string;
};

type Tokens = {
  grey: ColorToken;
  primary: ColorToken;
  secondary: ColorToken;
};

export const tokensDark: Tokens = {
  grey: {
    0: '#ffffff',
    10: '#f6f6f6',
    50: '#f0f0f0',
    100: '#e0e0e0',
    200: '#c2c2c2',
    300: '#a3a3a3',
    400: '#858585',
    500: '#666666',
    600: '#525252',
    700: '#3d3d3d',
    800: '#292929',
    900: '#141414',
    1000: '#000000',
  },
  // Slate / navy — used as backgrounds in dark mode
  primary: {
    100: '#cbd5e1',
    200: '#94a3b8',
    300: '#64748b',
    400: '#475569',
    500: '#1e293b',
    600: '#0f172a',
    700: '#0c1322',
    800: '#08101c',
    900: '#040810',
  },
  // Indigo — accent colour in both modes
  secondary: {
    50:  '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  },
};

function reverseTokens(tokens: Tokens): Tokens {
  const reversedTokens: Tokens = { grey: {}, primary: {}, secondary: {} };

  Object.entries(tokens).forEach(([key, val]) => {
    const keys = Object.keys(val).map(Number);
    const values = Object.values(val);
    const { length } = keys;

    const reversedObj: ColorToken = {};
    for (let i = 0; i < length; i += 1) {
      reversedObj[keys[i]] = values[length - i - 1];
    }
    reversedTokens[key as keyof Tokens] = reversedObj;
  });

  return reversedTokens;
}

export const tokensLight: Tokens = reverseTokens(tokensDark);

type Mode = 'light' | 'dark';
type ThemeSettings = {
  palette: {
    mode: Mode;
    primary: ColorToken & { main: string; light: string };
    secondary: ColorToken & { main: string; light?: string };
    neutral: ColorToken & { main: string };
    background: { default: string; paper: string };
  };
  typography: {
    fontFamily: string;
    fontSize: number;
    h1: { fontFamily: string; fontSize: number };
    h2: { fontFamily: string; fontSize: number };
    h3: { fontFamily: string; fontSize: number };
    h4: { fontFamily: string; fontSize: number };
    h5: { fontFamily: string; fontSize: number };
    h6: { fontFamily: string; fontSize: number };
  };
};

export const themeSettings = (mode: ThemeMode): ThemeSettings => {
  return {
    palette: {
      mode,
      ...(mode === 'dark'
        ? {
            primary: {
              ...tokensDark.primary,
              main: tokensDark.primary[400],
              light: tokensDark.primary[400],
            },
            secondary: {
              ...tokensDark.secondary,
              main: tokensDark.secondary[300],
            },
            neutral: {
              ...tokensDark.grey,
              main: tokensDark.grey[500],
            },
            background: {
              default: tokensDark.primary[600],  // #0f172a — deep slate
              paper:   tokensDark.primary[500],  // #1e293b — lighter slate
            },
          }
        : {
            primary: {
              ...tokensLight.primary,
              main: tokensDark.grey[50],
              light: tokensDark.grey[100],
            },
            secondary: {
              ...tokensLight.secondary,
              // Only [300] needs overriding: the reversal would give dark-indigo here
              // which is used as a background (column headers, active sidebar items).
              // Light indigo tint works correctly against dark text on a white bg.
              // [100] and [200] are used as text/icon colours so they stay as the
              // reversed dark-indigo values — readable on the white background.
              300: tokensDark.secondary[300],   // #a5b4fc — column headers, active bg
              main: tokensDark.secondary[600],  // #4f46e5 — buttons, icons
              light: tokensDark.secondary[400], // #818cf8 — hover states
            },
            neutral: {
              ...tokensLight.grey,
              main: tokensDark.grey[500],
            },
            background: {
              default: tokensDark.grey[0],   // #ffffff
              paper:   tokensDark.grey[10],  // #f6f6f6
            },
          }),
    },
    typography: {
      fontFamily: ['Inter', 'sans-serif'].join(','),
      fontSize: 12,
      h1: { fontFamily: ['Inter', 'sans-serif'].join(','), fontSize: 40 },
      h2: { fontFamily: ['Inter', 'sans-serif'].join(','), fontSize: 32 },
      h3: { fontFamily: ['Inter', 'sans-serif'].join(','), fontSize: 24 },
      h4: { fontFamily: ['Inter', 'sans-serif'].join(','), fontSize: 20 },
      h5: { fontFamily: ['Inter', 'sans-serif'].join(','), fontSize: 16 },
      h6: { fontFamily: ['Inter', 'sans-serif'].join(','), fontSize: 14 },
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
      },
    },
  } as ThemeSettings;
};