// EditProfileScreen.styles.ts — Elegantly Redesigned
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
      flexGrow: 1,
      paddingBottom: 20,
    },

    // ── Avatar hero banner ────────────────────────
    avatarHero: {
      backgroundColor: '#1C2340',
      paddingTop: 32,
      paddingBottom: 28,
      alignItems: 'center',
      overflow: 'hidden',
      marginBottom: 20,
    },
    avatarHeroCircle1: {
      position: 'absolute',
      top: -50,
      right: -40,
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: 'rgba(108,142,245,0.10)',
    },
    avatarHeroCircle2: {
      position: 'absolute',
      bottom: -30,
      left: -30,
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: 'rgba(232,119,34,0.08)',
    },

    // Avatar
    avatarWrap: {
      position: 'relative',
      marginBottom: 12,
    },
    profilePicture: {
      width: 96,
      height: 96,
      borderRadius: 48,
      borderWidth: 3,
      borderColor: 'rgba(255,255,255,0.25)',
    },
    profileFallback: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: '#E87722',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: 'rgba(255,255,255,0.25)',
    },
    initialsContainer: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: '#E87722',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: 'rgba(255,255,255,0.25)',
    },
    profileFallbackText: {
      color: '#FFFFFF',
      fontSize: 30,
      fontWeight: '800',
    },

    // Camera badge on avatar
    editIconButton: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: '#E87722',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#1C2340',
    },

    // Name + sub under avatar
    avatarHeroName: {
      fontSize: 18,
      fontWeight: '800',
      color: '#FFFFFF',
      marginBottom: 4,
      letterSpacing: -0.2,
    },
    avatarHeroSub: {
      fontSize: 12,
      color: '#94A3B8',
      fontWeight: '500',
    },

    // ── Form inputs ───────────────────────────────
    input: {
      height: 46,
      backgroundColor: colors.surfaceMuted,
      borderRadius: 12,
      paddingHorizontal: 14,
      fontSize: 14,
      color: colors.textPrimary,
      borderWidth: 0.5,
      borderColor: colors.border,
      fontWeight: '500',
    },
    inputError: {
      borderColor: '#DC2626',
    },

    pickerWrapper: {
      height: 46,
      backgroundColor: colors.surfaceMuted,
      borderRadius: 12,
      borderWidth: 0.5,
      borderColor: colors.border,
      justifyContent: 'center',
      overflow: 'hidden',
    },
    picker: {
      color: colors.textPrimary,
      fontSize: 14,
    },

    // Date input
    dateInput: {
      height: 46,
      backgroundColor: colors.surfaceMuted,
      borderRadius: 12,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 0.5,
      borderColor: colors.border,
    },
    dateInputText: {
      flex: 1,
      fontSize: 14,
      color: colors.textPrimary,
      fontWeight: '500',
    },
    switchRow: {
      minHeight: 46,
      backgroundColor: colors.surfaceMuted,
      borderRadius: 12,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 0.5,
      borderColor: colors.border,
    },
    switchLabel: {
      fontSize: 14,
      color: colors.textPrimary,
      fontWeight: '500',
    },

    // Phone input
    phoneInput: {
      height: 46,
      backgroundColor: colors.surfaceMuted,
      borderRadius: 12,
      paddingLeft: 6,
      paddingRight: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      borderWidth: 0.5,
      borderColor: colors.border,
    },
    phoneInputError: {
      borderColor: '#DC2626',
    },
    phonePlusBadge: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: '#E87722',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    phoneInputText: {
      flex: 1,
      fontSize: 14,
      color: colors.textPrimary,
      fontWeight: '500',
    },
    errorText: {
      fontSize: 12,
      color: '#DC2626',
      marginTop: 6,
    },
    addButton: {
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
    },

    // ── Save button ───────────────────────────────
    saveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      marginHorizontal: 20,
      marginTop: 8,
      height: 54,
      backgroundColor: '#E87722',
      borderRadius: 16,
      shadowColor: '#E87722',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 5,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: 0.3,
    },

    // ── Legacy kept for safety ────────────────────
    safeArea: { flex: 1, backgroundColor: colors.background },
    header: { marginTop: 16, marginHorizontal: 20, marginBottom: 24, alignSelf: 'flex-start' },
    backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
    contentWrapper: { paddingTop: 50, paddingBottom: 40 },
    profileCard: {
      backgroundColor: colors.surface, marginHorizontal: 20, borderRadius: 20,
      paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20,
      shadowColor: colors.overlay, shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15, shadowRadius: 10, elevation: 5, position: 'relative',
    },
    profilePictureContainer: { position: 'absolute', top: -50, alignSelf: 'center', width: 100, height: 100 },
    formContent: { gap: 16 },
    fieldContainer: { marginBottom: 4 },
    label: { fontSize: 13, color: colors.textMuted, marginBottom: 8, fontWeight: '500' },
    row: { flexDirection: 'row', gap: 12 },
    halfInput: { flex: 1 },
    thirdInput: { flex: 1 },
  });
