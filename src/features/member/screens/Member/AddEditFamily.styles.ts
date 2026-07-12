// AddEditFamily.styles.ts — Elegantly Redesigned
import { Platform, StyleSheet } from 'react-native';
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
      paddingTop: 20, paddingHorizontal: 18, paddingBottom: 20,
      overflow: 'hidden',
      shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15, shadowRadius: 12, elevation: 6,
    },
    heroCircle1: {
      position: 'absolute', top: -50, right: -40,
      width: 160, height: 160, borderRadius: 80,
      backgroundColor: 'rgba(34,197,94,0.10)',
    },
    heroCircle2: {
      position: 'absolute', bottom: -30, left: -30,
      width: 110, height: 110, borderRadius: 55,
      backgroundColor: 'rgba(34,197,94,0.07)',
    },

    // Avatar inside hero
    heroAvatarWrap: {
      alignSelf: 'center', marginBottom: 14,
    },
    heroAvatar: {
      width: 72, height: 72, borderRadius: 36,
      backgroundColor: '#22C55E',
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 3, borderColor: 'rgba(255,255,255,0.20)',
    },
    heroAvatarText: {
      fontSize: 24, fontWeight: '800', color: '#FFFFFF',
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

    // Picker
    pickerWrapper: {
      backgroundColor: colors.backgroundAlt,
      borderRadius: 12,
      borderWidth: 0.5,
      borderColor: colors.border,
      overflow: Platform.OS === 'ios' ? 'hidden' : 'visible',
      minHeight: 52,
      justifyContent: 'center',
      paddingHorizontal: Platform.OS === 'android' ? 8 : 0,
    },
    dropdownIOS:     { height: 52, color: colors.textPrimary },
    dropdownAndroid: { height: 52, color: colors.textPrimary, marginLeft: 0, marginRight: 0 },
    dropdownItem:    { fontSize: 14 },

    // Access permission chips
    permRow: {
      flexDirection: 'row', gap: 8,
    },
    permChip: {
      flex: 1, height: 44,
      borderRadius: 12, borderWidth: 1,
      alignItems: 'center', justifyContent: 'center',
    },
    permChipText: {
      fontSize: 13, fontWeight: '700',
    },

    // ── Save button ───────────────────────────────
    saveButton: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 10, marginHorizontal: 20, marginTop: 8,
      height: 54, backgroundColor: '#22C55E', borderRadius: 16,
      shadowColor: '#22C55E', shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35, shadowRadius: 10, elevation: 5,
    },
    saveButtonText: {
      fontSize: 15, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.3,
    },

    // ── Legacy kept for safety ────────────────────
    safeArea: { flex: 1, backgroundColor: colors.background },
    header:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16 },
    backBtn:  { marginRight: 10 },
    headerTitle: { fontSize: 18, fontWeight: '600', marginLeft: 12 },
    contentWrapper: { paddingTop: 30 },
    detailCard: {
      backgroundColor: colors.surface, marginHorizontal: 20, borderRadius: 20,
      paddingTop: 30, paddingBottom: 30, paddingHorizontal: 20, elevation: 5,
    },
    carContainer: { position: 'absolute', top: -50, alignSelf: 'center', width: 90, height: 90, justifyContent: 'center', alignItems: 'center' },
    profilePicture: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: colors.surface },
    profileFallback: { width: 90, height: 90, borderRadius: 45, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: colors.surface },
    profileFallbackText: { color: colors.onPrimary, fontSize: 24, fontWeight: '700' },
    imageEditBtn: { position: 'absolute', bottom: -4, right: -4, backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
    imageEditText: { color: colors.onPrimary, fontSize: 11, fontWeight: '700' },
    form: { gap: 16 },
    row:  { flexDirection: 'row', gap: 12 },
    field: { flex: 1 },
    label: { fontSize: 13, color: colors.textMuted, marginBottom: 8, fontWeight: '500' },
    dropdownWrapper: {
      minHeight: 56, backgroundColor: colors.surfaceMuted, borderRadius: 12,
      borderWidth: 1, borderColor: colors.border, justifyContent: 'center',
      overflow: 'hidden', paddingHorizontal: 6,
    },
    dropdownWrapperDisabled: { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
    permissionRow: { flexDirection: 'row', gap: 8 },
    permissionOption: {
      flex: 1, height: 44, borderRadius: 12, borderWidth: 1,
      borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
      backgroundColor: colors.surface,
    },
    permissionOptionActive: { borderColor: colors.primary, backgroundColor: colors.backgroundAlt },
    permissionOptionDisabled: { opacity: 0.7 },
    permissionOptionText: { fontSize: 14, color: colors.textSecondary, fontWeight: '500' },
    permissionOptionTextActive: { color: colors.primary, fontWeight: '700' },
    cardWrapper: { marginHorizontal: 20, position: 'relative' },
  });
