// AddEditVehicle.styles.ts — Elegantly Redesigned
import { StyleSheet } from 'react-native';
import type { ThemeColors } from '../../../../theme/colors';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({

    // ── Root ─────────────────────────────────────
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingBottom: 40,
    },

    // ── Hero card ────────────────────────────────
    heroCard: {
      backgroundColor: '#1C2340',
      marginHorizontal: 20, marginTop: 12, marginBottom: 20,
      borderRadius: 20,
      paddingTop: 16, paddingHorizontal: 18, paddingBottom: 20,
      overflow: 'hidden',
      shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15, shadowRadius: 12, elevation: 6,
    },
    heroCircle1: {
      position: 'absolute', top: -50, right: -40,
      width: 160, height: 160, borderRadius: 80,
      backgroundColor: 'rgba(245,158,11,0.10)',
    },
    heroCircle2: {
      position: 'absolute', bottom: -30, left: -30,
      width: 110, height: 110, borderRadius: 55,
      backgroundColor: 'rgba(245,158,11,0.07)',
    },
    carFloatWrap: {
      alignSelf: 'center', marginBottom: 14, marginTop: 4,
    },
    heroTextRow: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    },
    heroTitle: {
      fontSize: 17, fontWeight: '800', color: '#FFFFFF',
      marginBottom: 3, letterSpacing: -0.2,
    },
    heroSub: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
    viewChip: {
      backgroundColor: 'rgba(255,255,255,0.12)',
      borderRadius: 50, paddingHorizontal: 12, paddingVertical: 5,
    },
    viewChipText: {
      fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 1,
    },

    // ── Inputs ───────────────────────────────────
    input: {
      height: 46,
      backgroundColor: colors.backgroundAlt,
      borderRadius: 12,
      paddingHorizontal: 14,
      fontSize: 14,
      color: colors.textPrimary,
      borderWidth: 0.5,
      borderColor: colors.border,
      fontWeight: '500',
    },
    inputView: {
      backgroundColor: colors.surfaceMuted,
      color: colors.textMuted,
    },

    // Number plate — styled distinctly
    plateInput: {
      height: 52,
      backgroundColor: colors.backgroundAlt,
      borderRadius: 12,
      paddingHorizontal: 16,
      fontSize: 18,
      fontWeight: '800',
      color: colors.textPrimary,
      borderWidth: 1,
      borderColor: colors.border,
      letterSpacing: 2,
      textAlign: 'center',
    },

    // Upload RC field
    uploadField: {
      minHeight: 46,
      backgroundColor: colors.backgroundAlt,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderWidth: 0.5,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
    uploadFieldText: {
      flex: 1, fontSize: 14,
      color: colors.textPrimary, fontWeight: '500',
    },
    uploadBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      backgroundColor: '#FEF3C7',
      borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
    },
    uploadBadgeText: {
      fontSize: 12, fontWeight: '700', color: '#92400E',
    },

    // ── Save button ───────────────────────────────
    saveButton: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 10, marginHorizontal: 20, marginTop: 8,
      height: 54, backgroundColor: '#F59E0B', borderRadius: 16,
      shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35, shadowRadius: 10, elevation: 5,
    },
    saveButtonText: {
      fontSize: 15, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.3,
    },

    // ── Legacy kept for safety ────────────────────
    safeArea:       { flex: 1, backgroundColor: colors.background },
    header:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16 },
    backBtn:        { marginRight: 10 },
    headerTitle:    { fontSize: 18, fontWeight: '600', marginLeft: 12 },
    scrollContentLegacy: { paddingBottom: 40 },
    contentWrapper: { paddingTop: 90 },
    detailCard: {
      backgroundColor: colors.surface, marginHorizontal: 20, borderRadius: 20,
      paddingTop: 70, paddingBottom: 30, paddingHorizontal: 20, elevation: 5,
    },
    carContainer: {
      position: 'absolute', top: -50, alignSelf: 'center',
      width: 90, height: 90, justifyContent: 'center', alignItems: 'center',
    },
    form:       { gap: 16 },
    row:        { flexDirection: 'row', gap: 12 },
    field:      { flex: 1 },
    label:      { fontSize: 13, color: colors.textMuted, marginBottom: 8, fontWeight: '500' },
    cardWrapper:{ marginHorizontal: 20, position: 'relative' },
    topGlow: {
      position: 'absolute', top: -6, left: 4, right: 4, height: 14,
      backgroundColor: colors.primary, opacity: 0.35,
      borderTopLeftRadius: 22, borderTopRightRadius: 22,
    },
  });
