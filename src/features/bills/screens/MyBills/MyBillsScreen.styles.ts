// MyBillsScreen.styles.ts — Elegantly Redesigned
import { StyleSheet } from 'react-native';
import type { ThemeColors } from '../../../../theme/colors';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({

    // ── Root ─────────────────────────────────────
    root: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1 },

    // ── Hero card ────────────────────────────────
    heroCard: {
      backgroundColor: '#1C2340',
      marginHorizontal: 20, marginTop: 12, marginBottom: 8,
      borderRadius: 20, padding: 16, overflow: 'hidden',
      shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15, shadowRadius: 12, elevation: 6,
    },
    heroCircle1: {
      position: 'absolute', top: -50, right: -40,
      width: 160, height: 160, borderRadius: 80,
      backgroundColor: 'rgba(16,185,129,0.10)',
    },
    heroCircle2: {
      position: 'absolute', bottom: -30, left: -30,
      width: 110, height: 110, borderRadius: 55,
      backgroundColor: 'rgba(16,185,129,0.07)',
    },
    heroContent: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    heroIconBox: {
      width: 40, height: 40, borderRadius: 10,
      backgroundColor: 'rgba(255,255,255,0.12)',
      alignItems: 'center', justifyContent: 'center',
    },
    heroTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginBottom: 2, letterSpacing: -0.3 },
    heroSub:   { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
    heroStats: { flexDirection: 'row', flexWrap: 'nowrap', gap: 6 },
    heroStat:  { flex: 1, minWidth: 0, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center' },
    heroStatNum:   { fontSize: 16, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', lineHeight: 19, alignSelf: 'stretch' },
    heroStatCurrency: { fontSize: 14, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', lineHeight: 17, alignSelf: 'stretch' },
    heroStatAmount: { fontSize: 15, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', lineHeight: 18, alignSelf: 'stretch', paddingHorizontal: 1 },
    heroStatLabel: { fontSize: 8, fontWeight: '700', color: 'rgba(255,255,255,0.65)', marginTop: 2, letterSpacing: 0.4, textAlign: 'center' },

    // ── Tabs ──────────────────────────────────────
    tabsWrapper: {
      paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8,
    },
    tabs: {
      flexDirection: 'row',
      backgroundColor: colors.surfaceMuted,
      borderRadius: 14, padding: 4,
    },
    tab: {
      flex: 1, paddingVertical: 10,
      borderRadius: 11, alignItems: 'center', justifyContent: 'center',
    },
    activeTab: {
      backgroundColor: colors.surface,
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
    },
    tabText:       { fontSize: 14, fontWeight: '600', color: colors.textMuted },
    activeTabText: { color: colors.textPrimary, fontWeight: '700' },

    // ── List ──────────────────────────────────────
    listContent:      { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
    listContentEmpty: { flexGrow: 1 },

    // ── Bill card ─────────────────────────────────
    card: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: colors.surface,
      marginBottom: 10, borderRadius: 16,
      borderWidth: 0.5, borderColor: colors.border,
      paddingVertical: 14, paddingRight: 14, paddingLeft: 0,
      overflow: 'hidden',
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    },
    cardAccentBar: {
      width: 4, alignSelf: 'stretch', marginRight: 12,
    },
    iconContainer: {
      width: 48, height: 48, borderRadius: 13,
      alignItems: 'center', justifyContent: 'center',
      marginRight: 12, flexShrink: 0,
    },
    billInfo: { flex: 1 },
    billType: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 3 },
    billDate: { fontSize: 12, color: colors.textSecondary, marginBottom: 5 },
    statusChip: {
      alignSelf: 'flex-start',
      borderRadius: 50, paddingHorizontal: 8, paddingVertical: 3,
    },
    statusChipText: { fontSize: 11, fontWeight: '700' },
    cardRight: { alignItems: 'center', gap: 8 },
    amount:    { fontSize: 16, fontWeight: '800', textAlign: 'right' },
    amountHint: { fontSize: 12, fontWeight: '700', textAlign: 'right' },
    chevronBox: {
      width: 26, height: 26, borderRadius: 7,
      backgroundColor: colors.surfaceMuted,
      alignItems: 'center', justifyContent: 'center',
    },
    chevron: { fontSize: 24, color: colors.border, fontWeight: '300', marginLeft: 4 },

    // ── Loading ───────────────────────────────────
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    loadingText: { marginTop: 16, fontSize: 15, color: colors.textMuted, fontWeight: '500' },

    // ── Empty ─────────────────────────────────────
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingVertical: 60 },
    emptyIcon:     { fontSize: 64, marginBottom: 16 },
    emptyTitle:    { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: 8, textAlign: 'center' },
    emptySubtitle: { fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },

    // ── Modal ─────────────────────────────────────
    modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
    modalContentFull: {
      flex: 1, backgroundColor: colors.surface,
      borderTopLeftRadius: 28, borderTopRightRadius: 28,
      overflow: 'hidden', maxHeight: '95%',
    },
    handleBar: {
      width: 40, height: 5, backgroundColor: colors.border,
      borderRadius: 3, alignSelf: 'center', marginTop: 8, marginBottom: 12,
    },
    modalHeader: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 20, paddingVertical: 16,
      borderBottomWidth: 0.5, borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    modalTitleContainer: { flex: 1 },
    modalTitle:    { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
    modalSubtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
    modalHeaderActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginLeft: 12,
    },
    downloadButton: {
      width: 38,
      height: 38,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    downloadButtonDisabled: {
      opacity: 0.45,
    },
    closeButton:   { paddingHorizontal: 12, paddingVertical: 6 },
    closeText:     { color: colors.primary, fontSize: 16, fontWeight: '600' },

    // ── PDF ───────────────────────────────────────
    pdfContainer:        { flex: 1, backgroundColor: colors.background },
    pdf:                 { flex: 1, width: '100%', backgroundColor: colors.background },
    documentImage:       { flex: 1, width: '100%', backgroundColor: colors.background },
    pdfLoadingContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
    pdfLoadingText:      { marginTop: 16, fontSize: 15, color: colors.textMuted },
    pdfError:            { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
    pdfErrorTitle:       { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
    pdfErrorText:        { fontSize: 15, color: colors.textMuted, textAlign: 'center' },
    retryButton:         { marginTop: 20, backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    retryButtonText:     { color: colors.onPrimary, fontSize: 16, fontWeight: '600' },
  });
