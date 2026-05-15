// ProfileSettingsScreen.styles.ts — Elegantly Redesigned
import { StyleSheet } from 'react-native';
import type { ThemeColors } from '../../../../theme/colors';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({

    // ── Hero card ────────────────────────────────
    heroCard: {
      backgroundColor: '#1C2340',
      marginHorizontal: 20, marginTop: 12, marginBottom: 8,
      borderRadius: 20, padding: 18, overflow: 'hidden',
      shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15, shadowRadius: 12, elevation: 6,
    },
    heroCircle1: {
      position: 'absolute', top: -50, right: -40,
      width: 160, height: 160, borderRadius: 80,
      backgroundColor: 'rgba(124,58,237,0.10)',
    },
    heroCircle2: {
      position: 'absolute', bottom: -30, left: -30,
      width: 110, height: 110, borderRadius: 55,
      backgroundColor: 'rgba(37,99,235,0.08)',
    },
    heroContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    heroIconBox: {
      width: 40, height: 40, borderRadius: 10,
      backgroundColor: 'rgba(255,255,255,0.12)',
      alignItems: 'center', justifyContent: 'center',
    },
    heroTitle: {
      fontSize: 18, fontWeight: '800', color: '#FFFFFF',
      marginBottom: 2, letterSpacing: -0.3,
    },
    heroSub: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },

    // ── Section title ─────────────────────────────
    sectionTitle: {
      fontSize: 11, fontWeight: '700', letterSpacing: 1.2,
      color: '#9CA3AF', marginHorizontal: 20,
      marginTop: 16, marginBottom: 10,
    },

    // ── Menu list ────────────────────────────────
    menuList: {
      marginHorizontal: 20, gap: 8,
    },
    menuItem: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 16, borderWidth: 0.5, borderColor: colors.border,
      paddingVertical: 14, paddingHorizontal: 14, gap: 12,
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    },
    menuIconBox: {
      width: 40, height: 40, borderRadius: 11,
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    menuLabel: {
      flex: 1, fontSize: 14, fontWeight: '600',
    },
    dangerMenuItem: {
      borderColor: 'rgba(220,38,38,0.28)',
    },
    dangerIconBox: {
      backgroundColor: 'rgba(220,38,38,0.10)',
    },
    dangerContent: {
      flex: 1,
    },
    dangerLabel: {
      color: colors.danger,
      flex: 0,
    },
    dangerDescription: {
      fontSize: 12,
      lineHeight: 18,
      marginTop: 3,
      fontWeight: '500',
    },
    chevronBox: {
      width: 28, height: 28, borderRadius: 8,
      backgroundColor: colors.backgroundAlt ?? '#F3F4F6',
      alignItems: 'center', justifyContent: 'center',
    },

    // ── About card ────────────────────────────────
    aboutCard: {
      flexDirection: 'row', alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      marginHorizontal: 20,
      borderRadius: 16, borderWidth: 0.5, borderColor: colors.border,
      paddingVertical: 14, paddingHorizontal: 14,
    },
    aboutLabel: {
      fontSize: 14, fontWeight: '600',
    },
    aboutValue: {
      fontSize: 13, fontWeight: '500',
    },

    // ── Legacy kept for safety ────────────────────
    menuLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
    arrow:     { fontSize: 18 },
  });
