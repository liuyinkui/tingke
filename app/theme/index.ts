/**
 * 听刻 · Design Tokens
 * 基于 base-guide.md 设计系统
 * 品牌色： #02B47F
 */

import { TextStyle, ViewStyle } from 'react-native';

// —— 颜色 ——

export const colors = {
  brand: '#02B47F',
  brandDark: '#019A6C',
  brandLight: 'rgba(2,180,127,0.06)',
  brandLight2: 'rgba(2,180,127,0.12)',

  secondary: '#F8D9D6',
  success: '#2ECC71',
  successBg: 'rgba(46,204,113,0.06)',
  warning: '#F39C12',
  error: '#E74C3C',
  errorBg: 'rgba(231,76,60,0.06)',
  info: '#3498DB',

  // 文本
  textPrimary: 'rgba(0,0,0,0.85)',
  textSecondary: 'rgba(0,0,0,0.5)',
  textTertiary: 'rgba(0,0,0,0.28)',
  textInverse: '#FFFFFF',

  // 中性色
  neutral1: '#FFFFFF',
  neutral2: '#F1F3F5',
  neutral3: '#F2F4F7',
  neutral4: '#E9ECF0',
  neutral5: '#DCE2E8',
  neutral6: '#BEC5CD',
  neutral7: '#8E9AAB',
  neutral8: '#5A6E8A',
  neutral9: 'rgba(0,0,0,0.9)',
  neutral10: '#000000',

  // 背景
  bg: '#F5F6F8',
  surface: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.5)',

  // 边框
  borderLight: '#F2F4F7',
  borderDefault: '#E9ECF0',
  borderDark: '#DCE2E8',
  divider: '#EFF1F4',
} as const;

// —— 间距 (8px 网格) ——

export const spacing = {
  xs: 2,
  sm: 4,
  md: 8,
  base: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;

// —— 字号 ——

export const fontSize = {
  displayL: 32,
  displayM: 28,
  displayS: 24,
  titleL: 22,
  titleM: 20,
  titleS: 18,
  subtitleL: 18,
  subtitleM: 16,
  subtitleS: 14,
  bodyL: 18,
  bodyM: 16,
  bodyS: 14,
  captionL: 12,
  captionM: 10,
  captionS: 8,
} as const;

// —— 字重 ——

export const fontWeight = {
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
};

// —— 字体家族 ——

export const fontFamily = {
  sans: 'PingFang SC',
  mono: 'SF Mono',
};

// —— 圆角 ——

export const radius = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const;

// —— 阴影 ——

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  } as ViewStyle,
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  } as ViewStyle,
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  } as ViewStyle,
};

// —— 过渡动画时长 ——

export const duration = {
  fast: 150,
  base: 250,
  slow: 350,
} as const;

// —— 组件变量 ——

export const componentButton = {
  height: {
    sm: 28,
    md: 40,
    lg: 48,
    xl: 56,
  },
  paddingHorizontal: spacing.lg,
  borderRadius: radius.md,
  gap: spacing.md,
} as const;

export const componentCard = {
  padding: spacing['2xl'],
  borderRadius: radius.xl,
  shadow: shadows.md,
  borderWidth: 1,
  borderColor: colors.borderDefault,
  backgroundColor: colors.surface,
} as const;

export const componentInput = {
  height: 40,
  borderRadius: radius.md,
  paddingHorizontal: spacing.lg,
  fontSize: fontSize.bodyM,
  fontFamily: fontFamily.sans,
} as const;
