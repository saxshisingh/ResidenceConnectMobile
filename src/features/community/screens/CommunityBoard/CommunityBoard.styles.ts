import { StyleSheet } from 'react-native';
import type { ThemeColors } from '../../../../theme/colors';

export const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({

    // ─── Screen ────────────────────────────────────────────────────────────────
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    boardWrap: {
      flex: 1,
      position: 'relative',
    },

    scrollContent: {
      paddingHorizontal: 16,
      paddingBottom: 40,
    },

    // ─── Header add button ─────────────────────────────────────────────────────
    addButton: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: isDark ? colors.surfaceMuted : '#1E293B',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: isDark ? 1 : 0,
      borderColor: isDark ? 'rgba(255,255,255,0.26)' : 'transparent',
      shadowColor: isDark ? '#FFFFFF' : 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: isDark ? 0.18 : 0,
      shadowRadius: isDark ? 10 : 0,
      elevation: isDark ? 4 : 0,
    },

    // ─── Search Row ────────────────────────────────────────────────────────────
    searchRow: {
      marginTop: 14,
      marginBottom: 10,
    },
    searchInput: {
      height: 44,
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 14,
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: '500',
      borderWidth: 1,
      borderColor: colors.border,
    },

    // ─── Tabs ──────────────────────────────────────────────────────────────────
    tabsWrap: {
      paddingBottom: 12,
      gap: 8,
    },
    tab: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 6,
      backgroundColor: colors.surface,
    },
    tabActive: {
      backgroundColor: isDark ? colors.surfaceMuted : '#1E293B',
      borderColor: isDark ? 'rgba(255,255,255,0.28)' : '#1E293B',
      shadowColor: isDark ? '#FFFFFF' : 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: isDark ? 0.16 : 0,
      shadowRadius: isDark ? 10 : 0,
      elevation: isDark ? 4 : 0,
    },
    tabText: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    tabTextActive: {
      color: isDark ? colors.textPrimary : '#FFFFFF',
      fontWeight: '700',
      textShadowColor: isDark ? 'rgba(255,255,255,0.22)' : 'transparent',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: isDark ? 8 : 0,
    },

    // ─── Post Card ─────────────────────────────────────────────────────────────
    postCard: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 16,
      marginBottom: 14,
      shadowColor: '#94A3B8',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 3,
    },
    postHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },

    postUser: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
    },

    userInfo: {
      flex: 1,
    },

    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
    },

    avatarPlaceholder: {
      backgroundColor: '#E0E7FF',
      alignItems: 'center',
      justifyContent: 'center',
    },

    avatarText: {
      color: '#4338CA',
      fontSize: 14,
      fontWeight: '800',
    },

    author: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
    },

    badge: {
      marginTop: 2,
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: '600',
    },

    moreButton: {
      padding: 6,
    },

    inlineMenu: {
      position: 'absolute',
      top: 28,
      right: 0,
      backgroundColor: colors.surface,
      borderRadius: 12,
      elevation: 8,
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      paddingVertical: 6,
      minWidth: 148,
      maxWidth: 190,
      alignItems: 'stretch',
      zIndex: 40,
      borderWidth: 1,
      borderColor: colors.border,
    },

    inlineMenuItem: {
      minHeight: 40,
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 14,
    },

    inlineMenuText: {
      fontSize: 13,
      color: colors.danger,
      fontWeight: '700',
      includeFontPadding: false,
      flexShrink: 1,
      width: '100%',
    },
    actionMenuOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      paddingHorizontal: 20,
      paddingBottom: 28,
    },
    actionMenuBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(15,23,42,0.22)',
    },
    actionMenuCard: {
      alignSelf: 'stretch',
      backgroundColor: colors.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 8,
      shadowColor: '#000',
      shadowOpacity: 0.14,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 10,
    },
    actionMenuItem: {
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    actionMenuItemText: {
      fontSize: 14,
      color: colors.danger,
      fontWeight: '700',
    },

    // Post type pill (shown on each post)
    postTypePill: {
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      marginBottom: 8,
    },
    postTypePillText: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.4,
    },

    postTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.textPrimary,
      marginBottom: 5,
      letterSpacing: -0.2,
      lineHeight: 22,
      textShadowColor: isDark ? 'rgba(255,255,255,0.16)' : 'transparent',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: isDark ? 6 : 0,
    },

    postText: {
      fontSize: 14,
      lineHeight: 21,
      color: colors.textSecondary,
      fontWeight: '500',
    },

    postImage: {
      width: '100%',
      height: 200,
      borderRadius: 14,
      marginTop: 12,
    },

    imagePreviewOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(2, 6, 23, 0.92)',
      paddingHorizontal: 16,
      paddingVertical: 24,
    },

    imagePreviewBackdrop: {
      ...StyleSheet.absoluteFillObject,
    },

    imagePreviewFrame: {
      width: '100%',
      maxWidth: 520,
      maxHeight: '88%',
      borderRadius: 22,
      overflow: 'hidden',
      backgroundColor: isDark ? colors.surfaceMuted : '#0F172A',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.08)',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 52,
      paddingBottom: 18,
      paddingHorizontal: 12,
    },

    imagePreviewClose: {
      position: 'absolute',
      top: 12,
      right: 12,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.16)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.18)',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2,
    },

    imagePreviewCloseText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
    },

    imagePreviewImage: {
      width: '100%',
      height: '100%',
      minHeight: 220,
    },

    // ─── Post Actions (like/comment/save) ──────────────────────────────────────
    actions: {
      marginTop: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },

    leftActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 18,
    },

    action: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },

    actionText: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: '600',
    },

    // ─── Loading / Empty ───────────────────────────────────────────────────────
    loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 48,
      gap: 10,
    },

    loadingText: {
      color: colors.textMuted,
      fontSize: 13,
      fontWeight: '500',
    },

    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
    },

    emptyTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 6,
    },

    emptyText: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
    },

    // ─── Overlay (modals) ──────────────────────────────────────────────────────
    overlayDim: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(15,23,42,0.5)',
    },

    commentModalCenter: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'flex-end',
      paddingHorizontal: 0,
      paddingBottom: 0,
      marginBottom: 0,
    },

    // ─── Comment Sheet ─────────────────────────────────────────────────────────
    commentCard: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      alignSelf: 'stretch',
      backgroundColor: colors.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingTop: 14,
      paddingHorizontal: 18,
      paddingBottom: 24,
      maxHeight: '86%',
      minHeight: '48%',
      marginBottom: 0,
      shadowColor: '#0F172A',
      shadowOpacity: 0.18,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: -6 },
      elevation: 18,
    },

    commentHandle: {
      width: 52,
      height: 5,
      backgroundColor: colors.border,
      borderRadius: 999,
      alignSelf: 'center',
      marginBottom: 16,
    },

    commentTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.textPrimary,
      marginBottom: 4,
      letterSpacing: -0.3,
      textAlign: 'center',
      textShadowColor: isDark ? 'rgba(255,255,255,0.18)' : 'transparent',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: isDark ? 8 : 0,
    },

    commentSubtitle: {
      marginTop: 0,
      fontSize: 12,
      color: colors.textMuted,
      marginBottom: 14,
      fontWeight: '500',
      textAlign: 'center',
    },

    commentsList: {
      width: '100%',
      maxHeight: 260,
      marginBottom: 12,
    },

    commentsLoadingWrap: {
      paddingVertical: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },

    commentItem: {
      padding: 14,
      borderRadius: 14,
      backgroundColor: colors.backgroundAlt,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },

    commentAuthor1: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 4,
    },

    commentText1: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
      fontWeight: '500',
    },

    noCommentsText: {
      textAlign: 'center',
      color: colors.textMuted,
      fontSize: 13,
      paddingVertical: 16,
    },

    // ─── Comment Input ─────────────────────────────────────────────────────────
    commentBox: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      padding: 14,
      backgroundColor: colors.backgroundAlt,
      width: '100%',
      alignSelf: 'stretch',
    },

    commentHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 10,
    },

    commentAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#E0E7FF',
      alignItems: 'center',
      justifyContent: 'center',
    },

    commentAvatarText: {
      color: '#4338CA',
      fontSize: 11,
      fontWeight: '800',
    },

    commentAuthor: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textPrimary,
    },

    commentTextInput: {
      minHeight: 84,
      maxHeight: 132,
      fontSize: 14,
      color: colors.textPrimary,
      width: '100%',
      textAlignVertical: 'top',
      fontWeight: '500',
      lineHeight: 20,
      paddingTop: 0,
      paddingHorizontal: 0,
    },

    commentToolbar: {
      marginTop: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 10,
      width: '100%',
    },

    formatIcons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },

    formatIcon: {
      color: '#94A3B8',
      fontWeight: '700',
    },

    commentBtn: {
      backgroundColor: isDark ? colors.surfaceMuted : '#1E293B',
      flex: 1,
      minHeight: 50,
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: isDark ? 1 : 0,
      borderColor: isDark ? 'rgba(255,255,255,0.26)' : 'transparent',
      shadowColor: isDark ? '#FFFFFF' : '#1E293B',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: isDark ? 0.2 : 0.25,
      shadowRadius: isDark ? 10 : 10,
      elevation: isDark ? 5 : 5,
    },

    reportBtn: {
      backgroundColor: '#EF4444',
    },

    commentBtnDisabled: {
      opacity: 0.4,
    },

    commentBtnText: {
      color: isDark ? colors.textPrimary : '#FFFFFF',
      fontSize: 13,
      fontWeight: '700',
      textAlign: 'center',
      textShadowColor: isDark ? 'rgba(255,255,255,0.22)' : 'transparent',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: isDark ? 8 : 0,
    },

    modalSecondaryBtn: {
      flex: 1,
      minHeight: 50,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },

    modalSecondaryBtnText: {
      color: colors.textSecondary,
      fontWeight: '700',
      fontSize: 14,
      textAlign: 'center',
    },

    // ─── Create Post form (reused) ─────────────────────────────────────────────
    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 18,
      marginTop: 12,
      marginBottom: 20,
      shadowColor: '#94A3B8',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.1,
      shadowRadius: 14,
      elevation: 4,
    },

    field: {
      marginBottom: 18,
    },

    label: {
      fontSize: 11,
      color: '#64748B',
      marginBottom: 8,
      fontWeight: '800',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },

    input: {
      height: 48,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      fontSize: 14,
      color: colors.textPrimary,
      backgroundColor: colors.backgroundAlt,
      fontWeight: '500',
    },

    textArea: {
      height: 110,
      textAlignVertical: 'top',
      paddingTop: 12,
    },

    uploadBox: {
      height: 48,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      justifyContent: 'center',
      paddingHorizontal: 14,
      backgroundColor: colors.backgroundAlt,
      borderStyle: 'dashed',
    },

    uploadText: {
      fontSize: 13,
      color: '#94A3B8',
      fontWeight: '600',
      flex: 1,
      flexShrink: 1,
    },

    // Type chips (create post)
    typeRow: {
      flexDirection: 'row',
      gap: 8,
    },

    typeChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.backgroundAlt,
    },

    typeChipActive: {
      backgroundColor: '#1E293B',
      borderColor: '#1E293B',
    },

    typeText: {
      fontSize: 12,
      color: '#64748B',
      fontWeight: '600',
    },

    typeTextActive: {
      color: '#FFFFFF',
      fontWeight: '700',
    },

    // ─── Action Buttons ────────────────────────────────────────────────────────
    actionRow: {
      flexDirection: 'row',
      gap: 12,
      flexWrap: 'wrap',
      marginBottom: 12,
    },

    postBtn: {
      flexGrow: 2,
      flexBasis: 180,
      backgroundColor: isDark ? colors.surfaceMuted : '#1E293B',
      height: 52,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: isDark ? 1 : 0,
      borderColor: isDark ? 'rgba(255,255,255,0.26)' : 'transparent',
      shadowColor: isDark ? '#FFFFFF' : '#1E293B',
      shadowOpacity: isDark ? 0.2 : 0.25,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: isDark ? 0 : 4 },
      elevation: 5,
    },

    postText1: {
      color: isDark ? colors.textPrimary : '#FFFFFF',
      fontWeight: '800',
      fontSize: 15,
      letterSpacing: 0.2,
      textShadowColor: isDark ? 'rgba(255,255,255,0.22)' : 'transparent',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: isDark ? 8 : 0,
    },

    cancelBtn: {
      flexGrow: 1,
      flexBasis: 120,
      height: 52,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },

    cancelText: {
      color: colors.textSecondary,
      fontWeight: '700',
      fontSize: 14,
    },
  });
