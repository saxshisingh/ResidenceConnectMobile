import type { ThemeMode } from './ThemeProvider';

export type ThemeColors = {
  primary: string;
  onPrimary: string;
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  overlay: string;
  danger: string;
  tabBarBackground: string;
  gradientTop: string;
  gradientBottom: string;
};

export const THEME_COLORS: Record<ThemeMode, ThemeColors> = {
  light: {
    primary: '#F37E00',
    onPrimary: '#FFFFFF',
    background: 'transparent',
    backgroundAlt: '#FFF3E5',
    surface: '#FFFFFF',
    surfaceMuted: '#F9FAFB',
    border: '#D1D5DB',
    textPrimary: '#111827',
    textSecondary: '#374151',
    textMuted: '#6B7280',
    overlay: 'rgba(0,0,0,0.28)',
    danger: '#DC2626',
    tabBarBackground: '#FFF3E5',
    gradientTop: '#FFFFFF',
    gradientBottom: '#FFF3E5',
  },
  dark: {
    primary: '#F59E0B',
    onPrimary: '#0B0F14',
    background: '#0F172A',
    backgroundAlt: '#111827',
    surface: '#1F2937',
    surfaceMuted: '#273244',
    border: '#334155',
    textPrimary: '#F9FAFB',
    textSecondary: '#E5E7EB',
    textMuted: '#94A3B8',
    overlay: 'rgba(0,0,0,0.6)',
    danger: '#EF4444',
    tabBarBackground: '#111827',
    gradientTop: '#0F172A',
    gradientBottom: '#1E293B',
  },
};

export const APP_COLORS = THEME_COLORS.light;
