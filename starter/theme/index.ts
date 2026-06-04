// 听刻 · 设计Token
// 来源：design-system.md + design-spec.html
// 设计师：若楠

export const colors = {
  // 主色
  primary: '#1E3A5F',
  primaryLight: '#2D5A8E',
  primaryBg: '#E8EDF2',

  // 强调色
  accent: '#FF6B35',
  accentLight: '#FF8C5A',

  // 背景
  bg: '#F5F7FA',
  surface: '#FFFFFF',

  // 文字
  textPrimary: '#2D3436',
  textSecondary: '#636E72',
  textHint: '#B2BEC3',

  // 状态
  success: '#00B894',
  successBg: '#E8F8F5',
  error: '#FF6B6B',
  errorBg: '#FFF5F5',

  // 装饰
  divider: '#DFE6E9',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
} as const;

export const fontSize = {
  hero: 32,
  h1: 24,
  h2: 20,
  h3: 17,
  body: 15,
  caption: 13,
  tag: 11,
} as const;

export const fontWeight = {
  bold: '700' as const,
  semibold: '600' as const,
  medium: '500' as const,
  regular: '400' as const,
};

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
} as const;

export const shadows = {
  card: {
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  button: {
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 4,
  },
};

export const duration = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;
