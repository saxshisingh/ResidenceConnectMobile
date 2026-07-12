// Documents.styles.ts — Elegantly Redesigned
import { StyleSheet } from 'react-native';
import type { ThemeColors } from '../../../../theme/colors';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({

    // ── Root ─────────────────────────────────────
    safeArea: { flex: 1, backgroundColor: 'transparent' },
    container: { flex: 1 },

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
      backgroundColor: 'rgba(139,92,246,0.12)',
    },
    heroCircle2: {
      position: 'absolute', bottom: -30, left: -30,
      width: 110, height: 110, borderRadius: 55,
      backgroundColor: 'rgba(139,92,246,0.07)',
    },
    heroContent: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
    heroIconBox: {
      width: 40, height: 40, borderRadius: 10,
      backgroundColor: 'rgba(255,255,255,0.12)',
      alignItems: 'center', justifyContent: 'center',
    },
    heroTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginBottom: 2, letterSpacing: -0.3 },
    heroSub:   { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
    heroStats: { flexDirection: 'row', gap: 8 },
    heroStat:  { flex: 1, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
    heroStatNum:   { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
    heroStatLabel: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.65)', marginTop: 2, letterSpacing: 0.5 },

    // ── Section title ─────────────────────────────
    sectionTitle: {
      fontSize: 11, fontWeight: '700', letterSpacing: 1.2,
      color: colors.textMuted, marginHorizontal: 20,
      marginTop: 8, marginBottom: 10,
    },

    // ── List scroll ───────────────────────────────
    listContent: {
      paddingBottom: 40,
    },

    // ── Document card ─────────────────────────────
    card: {
      backgroundColor: colors.surface,
      marginHorizontal: 20, marginBottom: 10,
      borderRadius: 16, borderWidth: 0.5, borderColor: colors.border,
      overflow: 'hidden',
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    },
    cardAccent: {
      height: 3, width: '100%',
    },
    cardMain: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 14, paddingTop: 14, paddingBottom: 12, gap: 12,
    },
    cardIconBox: {
      width: 52, height: 52, borderRadius: 14,
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    cardLeft: { flex: 1 },
    cardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
    cardSubtitle: { fontSize: 12, marginBottom: 5 },
    uploadedBadge: {
      alignSelf: 'flex-start', borderRadius: 50,
      paddingHorizontal: 8, paddingVertical: 3,
    },
    uploadedBadgeText: { fontSize: 11, fontWeight: '700' },
    cardFilesPreview: {
      marginTop: 8,
      fontSize: 12,
      lineHeight: 18,
    },
    chevronBox: {
      width: 26, height: 26, borderRadius: 7,
      backgroundColor: colors.surfaceMuted,
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },

    // ── Loading / empty ───────────────────────────
    centerState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
    stateText:   { marginTop: 10, fontSize: 13 },

    // ── Viewer list ───────────────────────────────
    viewerList: { paddingBottom: 40 },
    viewerContainer: {
      marginHorizontal: 20, marginTop: 16,
      backgroundColor: colors.surface,
      borderRadius: 16, minHeight: 180,
      justifyContent: 'center', alignItems: 'center',
      padding: 20, borderWidth: 0.5, borderColor: colors.border,
    },
    viewerText: { color: colors.textMuted, fontSize: 14 },

    // ── File row (viewer) ─────────────────────────
    fileRow: {
      flexDirection: 'row', alignItems: 'center',
      marginHorizontal: 20, marginBottom: 10,
      borderRadius: 16, borderWidth: 0.5, borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingVertical: 14, paddingRight: 14, paddingLeft: 0,
      overflow: 'hidden',
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    },
    fileRowActive: {
      borderColor: colors.primary,
      borderWidth: 1.2,
    },
    fileAccentBar: {
      width: 4, alignSelf: 'stretch',
      backgroundColor: colors.primary, marginRight: 12,
    },
    fileIconBox: {
      width: 44, height: 44, borderRadius: 12,
      backgroundColor: colors.backgroundAlt,
      alignItems: 'center', justifyContent: 'center',
      marginRight: 12, flexShrink: 0,
    },
    fileName: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
    fileMeta: { fontSize: 12 },
    openBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      backgroundColor: colors.backgroundAlt, borderRadius: 8,
      paddingHorizontal: 9, paddingVertical: 6, flexShrink: 0,
    },
    openBadgeText: { fontSize: 11, fontWeight: '700', color: colors.primary },
    previewCard: {
      borderRadius: 18,
      backgroundColor: colors.surface,
      borderWidth: 0.5,
      borderColor: colors.border,
      padding: 14,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    previewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12,
    },
    previewTitle: {
      fontSize: 15,
      fontWeight: '800',
    },
    previewMeta: {
      fontSize: 12,
      marginTop: 4,
    },
    previewSurface: {
      minHeight: 420,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: colors.backgroundAlt,
      justifyContent: 'center',
      alignItems: 'center',
    },
    previewPdf: {
      width: '100%',
      height: 520,
      backgroundColor: colors.backgroundAlt,
    },
    previewImage: {
      width: '100%',
      height: 420,
      backgroundColor: colors.backgroundAlt,
    },
    previewEmpty: {
      minHeight: 320,
      width: '100%',
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    previewEmptyTitle: {
      marginTop: 14,
      fontSize: 16,
      fontWeight: '800',
      textAlign: 'center',
    },
    previewEmptyText: {
      marginTop: 8,
      fontSize: 13,
      lineHeight: 19,
      textAlign: 'center',
    },
    previewLoading: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.76)',
    },
    previewLoadingText: {
      fontSize: 13,
      fontWeight: '600',
    },

    // ── Legacy ────────────────────────────────────
    header:        { flexDirection: 'row', alignItems: 'center', padding: 16 },
    headerTitle:   { fontSize: 18, fontWeight: '600', marginLeft: 12, color: colors.textPrimary },
    fileLink:      { marginTop: 10, fontSize: 13, fontWeight: '600', color: colors.primary },
  });
