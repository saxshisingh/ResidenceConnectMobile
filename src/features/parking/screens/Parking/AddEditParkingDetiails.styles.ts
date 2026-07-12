// AddEditParkingDetiails.styles.ts — Elegantly Redesigned
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
      marginHorizontal: 20,
      marginTop: 12,
      marginBottom: 20,
      borderRadius: 20,
      paddingTop: 16,
      paddingHorizontal: 18,
      paddingBottom: 20,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 6,
    },
    heroCircle1: {
      position: 'absolute', top: -50, right: -40,
      width: 160, height: 160, borderRadius: 80,
      backgroundColor: 'rgba(108,142,245,0.10)',
    },
    heroCircle2: {
      position: 'absolute', bottom: -30, left: -30,
      width: 110, height: 110, borderRadius: 55,
      backgroundColor: 'rgba(124,58,237,0.08)',
    },

    // Car floating inside hero
    carFloatWrap: {
      alignSelf: 'center',
      marginBottom: 14,
      marginTop: 4,
    },

    heroTextRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    heroTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: '#FFFFFF',
      marginBottom: 3,
      letterSpacing: -0.2,
    },
    heroSub: {
      fontSize: 12,
      color: '#94A3B8',
      fontWeight: '500',
    },
    viewChip: {
      backgroundColor: 'rgba(255,255,255,0.12)',
      borderRadius: 50,
      paddingHorizontal: 12,
      paddingVertical: 5,
    },
    viewChipText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#94A3B8',
      letterSpacing: 1,
    },

    // ── Form inputs ───────────────────────────────
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
    readonlyInput: {
      backgroundColor: colors.backgroundAlt,
      color: colors.textPrimary,
    },

    // Dropdown wrapper (ModalSelect container)
    dropdownWrapper: {
      borderRadius: 12,
      borderWidth: 0.5,
      borderColor: colors.border,
      backgroundColor: colors.backgroundAlt,
      overflow: 'hidden',
      minHeight: 46,
      justifyContent: 'center',
    },

    // ── Save / update button ──────────────────────
    saveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      marginHorizontal: 20,
      marginTop: 8,
      height: 54,
      backgroundColor: '#7C3AED',
      borderRadius: 16,
      shadowColor: '#7C3AED',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 5,
    },
    saveButtonText: {
      fontSize: 15,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: 0.3,
    },

    // Parking illustration (view mode)
    parkingIllustrationWrap: {
      alignSelf: 'center',
      marginTop: 12,
      marginBottom: 8,
      alignItems: 'center',
      justifyContent: 'center',
      maxWidth: '100%',
    },

    // ── Legacy kept for safety ────────────────────
    safeArea: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, marginBottom: 20 },
    backBtn: { marginRight: 10 },
    headerTitle: { fontSize: 18, fontWeight: '600', marginLeft: 12 },
    contentWrapper: { paddingTop: 90 },
    detailCard: {
      backgroundColor: colors.surface, marginHorizontal: 20, borderRadius: 20,
      paddingTop: 70, paddingBottom: 40, paddingHorizontal: 20,
      elevation: 5, shadowColor: colors.overlay,
      shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, overflow: 'visible',
    },
    carContainer: { position: 'absolute', top: -50, alignSelf: 'center', width: 100, height: 100, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
    form: { gap: 16 },
    row: { flexDirection: 'row', gap: 12 },
    field: { flex: 1 },
    label: { fontSize: 13, color: colors.textMuted, marginBottom: 8, fontWeight: '500' },
    dropdownLabel: { fontSize: 13, color: colors.textMuted, marginBottom: 4 },
    cardWrapper: { marginHorizontal: 20, position: 'relative' },
    topGlow: {
      position: 'absolute', top: -6, left: 4, right: 4, height: 14,
      backgroundColor: colors.primary, opacity: 0.35,
      borderTopLeftRadius: 22, borderTopRightRadius: 22,
    },
    dropdown: { height: 50, color: colors.textPrimary },
  });
