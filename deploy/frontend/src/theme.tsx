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
  primary: {
    100: '#d3d4d4',
    200: '#a6a8a8',
    300: '#7a7c7c',
    400: '#4d4f4f',
    500: '#212121',
    600: '#191919',
    700: '#141414',
    800: '#0d0d0d',
    900: '#070707',
  },
  secondary: {
    50: '#f0f0f0',
    100: '#fff6e0',
    200: '#ffedc2',
    300: '#ffe3a3',
    400: '#ffda85',
    500: '#ffd166',
    600: '#cca752',
    700: '#997d3d',
    800: '#665429',
    900: '#332a14',
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
              default: tokensDark.primary[600],
              paper: tokensDark.primary[500],
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
              main: tokensDark.secondary[600],
              light: tokensDark.secondary[700],
            },
            neutral: {
              ...tokensLight.grey,
              main: tokensDark.grey[500],
            },
            background: {
              default: tokensDark.grey[0],
              paper: tokensDark.grey[50],
            },
          }),
    },
    typography: {
      fontFamily: ['Inter', 'sans-serif'].join(','),
      fontSize: 12,
      h1: {
        fontFamily: ['Inter', 'sans-serif'].join(','),
        fontSize: 40,
      },
      h2: {
        fontFamily: ['Inter', 'sans-serif'].join(','),
        fontSize: 32,
      },
      h3: {
        fontFamily: ['Inter', 'sans-serif'].join(','),
        fontSize: 24,
      },
      h4: {
        fontFamily: ['Inter', 'sans-serif'].join(','),
        fontSize: 20,
      },
      h5: {
        fontFamily: ['Inter', 'sans-serif'].join(','),
        fontSize: 16,
      },
      h6: {
        fontFamily: ['Inter', 'sans-serif'].join(','),
        fontSize: 14,
      },
    },
  } as ThemeSettings;
};
