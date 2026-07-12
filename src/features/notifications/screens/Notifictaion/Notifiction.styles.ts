// Notifiction.styles.ts — Elegantly Redesigned
import { StyleSheet, Dimensions } from 'react-native';
import type { ThemeColors } from '../../../../theme/colors';

const { width } = Dimensions.get('window');

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({

    // ── Root ─────────────────────────────────────
    safeArea: {
      flex: 1,
      backgroundColor: colors.backgroundAlt,
    },

    // ── Scroll container ─────────────────────────
    scroll: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 48,
    },

    // ── Hero card (notifications list header) ────
    heroCard: {
      backgroundColor: '#1C2340',
      marginHorizontal: 20,
      marginBottom: 16,
      borderRadius: 20,
      padding: 18,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 6,
    },
    heroCircle1: {
      position: 'absolute',
      top: -50,
      right: -40,
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: 'rgba(108,142,245,0.10)',
    },
    heroCircle2: {
      position: 'absolute',
      bottom: -30,
      left: -30,
      width: 110,
      height: 110,
      borderRadius: 55,
      backgroundColor: 'rgba(232,119,34,0.08)',
    },
    heroContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 14,
    },
    heroIconBox: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: 'rgba(255,255,255,0.12)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: '#FFFFFF',
      marginBottom: 2,
      letterSpacing: -0.3,
    },
    heroSub: {
      fontSize: 12,
      color: '#94A3B8',
      fontWeight: '500',
    },
    heroStats: {
      flexDirection: 'row',
      gap: 8,
    },
    heroStat: {
      flex: 1,
      borderRadius: 12,
      paddingVertical: 10,
      alignItems: 'center',
    },
    heroStatNum: {
      fontSize: 22,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    heroStatLabel: {
      fontSize: 9,
      fontWeight: '700',
      color: 'rgba(255,255,255,0.65)',
      marginTop: 2,
      letterSpacing: 0.5,
    },

    // ── Section title ─────────────────────────────
    sectionTitle: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1.2,
      marginBottom: 12,
    },

    // ── Notification list card ────────────────────
    notificationCard: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 16,
      padding: 14,
      marginBottom: 10,
      borderWidth: 0.5,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
      overflow: 'hidden',
      position: 'relative',
    },
    notificationCardUnread: {
      borderLeftWidth: 3,
      borderLeftColor: '#E87722',
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
    },
    unreadBar: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 3,
      backgroundColor: '#E87722',
    },

    iconCircle: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      flexShrink: 0,
    },

    notificationContent: {
      flex: 1,
    },
    notificationImage: {
      width: '100%',
      height: 150,
      borderRadius: 14,
      marginTop: 10,
      marginBottom: 10,
      backgroundColor: colors.backgroundAlt,
    },
    notificationTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
    },
    notificationTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textPrimary,
      flex: 1,
    },
    notificationTitleUnread: {
      fontWeight: '700',
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#E87722',
      flexShrink: 0,
    },
    notificationDesc: {
      fontSize: 12,
      color: colors.textSecondary,
      lineHeight: 17,
      marginBottom: 5,
    },
    time: {
      fontSize: 10,
      color: colors.textMuted,
      fontWeight: '500',
    },
    chevron: {
      fontSize: 22,
      color: colors.textMuted,
      fontWeight: '300',
      marginLeft: 6,
    },

    // ── Empty state ───────────────────────────────
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
      paddingVertical: 40,
    },
    emptyIllustration: {
      marginBottom: 28,
      opacity: 0.9,
    },
    emptyImage: {
      width: 220,
      height: 220,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: 10,
      lineHeight: 28,
      letterSpacing: -0.3,
    },
    emptyDesc: {
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 21,
      fontWeight: '400',
    },

    // ── Loading / error ───────────────────────────
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 15,
      color: colors.textMuted,
    },
    errorText: {
      fontSize: 16,
      color: colors.textMuted,
      marginBottom: 20,
      textAlign: 'center',
    },

    // ── Detail: content card ──────────────────────
    contentCard: {
      borderRadius: 20,
      padding: 24,
      borderWidth: 0.5,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },

    // Large icon circle (detail screen)
    iconSection: {
      alignItems: 'center',
      marginBottom: 20,
      gap: 10,
    },
    largeIconCircle: {
      width: 76,
      height: 76,
      borderRadius: 38,
      backgroundColor: '#FFF0E0',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: '#FFE0B8',
    },

    // Title (detail screen)
    title: {
      fontSize: 22,
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: 14,
      lineHeight: 30,
      letterSpacing: -0.4,
    },

    // Date pill (detail screen)
    metaRow: {
      alignItems: 'center',
      marginBottom: 20,
    },
    datePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.backgroundAlt,
      borderRadius: 50,
      paddingHorizontal: 14,
      paddingVertical: 7,
    },
    datePillIcon: {
      fontSize: 13,
    },
    date: {
      fontSize: 13,
      fontWeight: '500',
    },

    // Divider
    divider: {
      height: 0.5,
      marginBottom: 20,
    },

    // Message label
    contentLabel: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1.2,
      marginBottom: 10,
    },

    // Message body
    content: {
      fontSize: 15,
      lineHeight: 25,
      fontWeight: '400',
    },
    detailImage: {
      width: '100%',
      height: Math.min(width * 0.72, 280),
      borderRadius: 18,
      marginBottom: 20,
      backgroundColor: colors.backgroundAlt,
    },
    imagePreviewOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.92)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    imagePreviewBackdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    imagePreviewFrame: {
      width: '92%',
      height: '82%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    imagePreviewImage: {
      width: '100%',
      height: '100%',
    },
    imagePreviewClose: {
      position: 'absolute',
      top: 8,
      right: 8,
      zIndex: 2,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255,255,255,0.16)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    imagePreviewCloseText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },

    // Seen badge
    seenBadge: {
      backgroundColor: '#F0FDF4',
      borderRadius: 50,
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: '#BBF7D0',
    },
    seenText: {
      color: '#22C55E',
      fontSize: 12,
      fontWeight: '700',
    },

    // ── Buttons ───────────────────────────────────
    actionButtons: {
      gap: 12,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 14,
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOpacity: 0.3,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    primaryButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.onPrimary,
    },
    secondaryButton: {
      backgroundColor: colors.surface,
      paddingVertical: 16,
      borderRadius: 14,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textMuted,
    },

    // ── Legacy styles (kept for safety) ──────────
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginLeft: 14,
      color: colors.textPrimary,
    },
    rightSection: {
      alignItems: 'flex-end',
      marginLeft: 8,
    },
    badge: {
      backgroundColor: colors.backgroundAlt,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary,
    },
    dot: {
      fontSize: 16,
      color: colors.border,
      marginHorizontal: 8,
    },
    infoGrid: {
      flexDirection: 'row',
      marginBottom: 20,
      gap: 16,
    },
    infoItem: {
      flex: 1,
      backgroundColor: colors.backgroundAlt,
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    infoLabel: {
      fontSize: 11,
      color: colors.textMuted,
      marginBottom: 6,
      fontWeight: '500',
    },
    infoValue: {
      fontSize: 14,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    referenceBox: {
      backgroundColor: colors.backgroundAlt,
      padding: 12,
      borderRadius: 10,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
    },
    referenceLabel: {
      fontSize: 11,
      color: colors.textMuted,
      marginBottom: 4,
      fontWeight: '500',
    },
    referenceId: {
      fontSize: 12,
      color: colors.textPrimary,
      fontFamily: 'monospace',
    },
  });
