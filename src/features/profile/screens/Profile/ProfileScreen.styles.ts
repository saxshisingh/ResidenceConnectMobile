// ProfileScreen.styles.ts — Elegantly Redesigned
import { StyleSheet } from 'react-native';
import type { ThemeColors } from '../../../../theme/colors';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({

    // ── Root ─────────────────────────────────────
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    // ── Hero card ────────────────────────────────
    heroCard: {
      backgroundColor: '#1C2340',
      marginHorizontal: 20,
      marginTop: 12,
      marginBottom: 20,
      borderRadius: 24,
      padding: 20,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.18,
      shadowRadius: 14,
      elevation: 7,
    },
    heroCircle1: {
      position: 'absolute',
      top: -60,
      right: -50,
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: 'rgba(108,142,245,0.10)',
    },
    heroCircle2: {
      position: 'absolute',
      bottom: -40,
      left: -40,
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: 'rgba(232,119,34,0.08)',
    },

    // Avatar
    heroTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 14,
      marginBottom: 18,
    },
    avatarRing: {
      borderRadius: 38,
      borderWidth: 3,
      borderColor: 'rgba(255,255,255,0.18)',
      padding: 2,
    },
    initialsContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    avatarImage: {
      width: 64,
      height: 64,
      borderRadius: 32,
    },
    avatarText: {
      color: '#FFFFFF',
      fontSize: 22,
      fontWeight: '800',
    },

    // Name / email / badge
    heroName: {
      fontSize: 20,
      fontWeight: '800',
      color: '#FFFFFF',
      marginBottom: 3,
      letterSpacing: -0.3,
    },
    heroEmail: {
      fontSize: 12,
      color: '#94A3B8',
      marginBottom: 8,
      fontWeight: '400',
    },
    heroBadge: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 5,
      backgroundColor: 'rgba(255,255,255,0.10)',
      borderRadius: 50,
      paddingHorizontal: 10,
      paddingVertical: 4,
      alignSelf: 'flex-start',
      maxWidth: '100%',
    },
    heroBadgeText: {
      fontSize: 11,
      color: '#94A3B8',
      fontWeight: '500',
      flexShrink: 1,
    },

    // Stats row
    heroStats: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
    },
    heroStat: {
      flex: 1,
      minWidth: 0,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 8,
    },
    heroStatTopRow: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      marginBottom: 8,
      minHeight: 42,
    },
    heroStatIconBox: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: 'rgba(255,255,255,0.16)',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    heroStatNum: {
      fontSize: 22,
      fontWeight: '800',
      color: '#FFFFFF',
      textAlign: 'center',
    },
    heroStatLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: 'rgba(255,255,255,0.65)',
      letterSpacing: 0.2,
      textTransform: 'uppercase',
      lineHeight: 12,
      textAlign: 'center',
    },

    // Edit profile button inside hero
    editBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: '#E87722',
      borderRadius: 14,
      height: 46,
      shadowColor: '#E87722',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 4,
    },
    editBtnText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '700',
      letterSpacing: 0.3,
    },

    // ── Section title ─────────────────────────────
    sectionTitle: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1.2,
      marginHorizontal: 20,
      marginBottom: 12,
      marginTop: 4,
    },

    // ── Utility meters card ───────────────────────
    utilityCard: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: 20,
      borderRadius: 18,
      paddingVertical: 16,
      marginBottom: 16,
      borderWidth: 0.5,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    utilityItem: {
      flex: 1,
      minWidth: 92,
      alignItems: 'center',
      gap: 5,
    },
    utilityIconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 2,
    },
    utilityDivider: {
      width: 0.5,
      marginVertical: 6,
    },
    utilityLabel: {
      fontSize: 10,
      fontWeight: '600',
      letterSpacing: 0.3,
    },
    utilityValue: {
      fontSize: 12,
      fontWeight: '700',
    },

    // ── Contact row ───────────────────────────────
    contactRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginHorizontal: 20,
      marginBottom: 20,
    },
    contactPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      borderRadius: 50,
      borderWidth: 0.5,
      paddingHorizontal: 14,
      paddingVertical: 9,
      flexGrow: 1,
      flexBasis: 180,
    },
    contactText: {
      fontSize: 12,
      fontWeight: '500',
    },

    // ── Account menu ──────────────────────────────
    menuList: {
      marginHorizontal: 20,
      gap: 8,
      marginBottom: 16,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 16,
      borderWidth: 0.5,
      paddingVertical: 14,
      paddingHorizontal: 14,
      gap: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    },
    menuIconBox: {
      width: 40,
      height: 40,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    menuLabel: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
    },
    menuChevron: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: colors.backgroundAlt ?? '#F3F4F6',
      alignItems: 'center',
      justifyContent: 'center',
    },

    // ── Logout ────────────────────────────────────
    logoutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 20,
      borderRadius: 16,
      borderWidth: 0.5,
      borderColor: '#FCA5A5',
      backgroundColor: '#FEF2F2',
      paddingVertical: 14,
      paddingHorizontal: 14,
      gap: 12,
    },
    logoutIconBox: {
      width: 40,
      height: 40,
      borderRadius: 11,
      backgroundColor: '#FEE2E2',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoutText: {
      flex: 1,
      fontSize: 14,
      fontWeight: '700',
      color: '#EF4444',
    },

    // ── Legacy kept for safety ────────────────────
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 60,
      marginBottom: 20,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
      marginLeft: 20,
    },
    avatar: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    name: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    email: {
      fontSize: 13,
      color: colors.textMuted,
      marginBottom: 10,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    infoText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginHorizontal: 4,
    },
    dot: {
      marginHorizontal: 6,
      color: colors.textMuted,
    },
    divider: {
      height: 0.5,
      backgroundColor: colors.border,
      marginHorizontal: 20,
      marginVertical: 16,
    },
    profileRow: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      marginBottom: 16,
      alignItems: 'center',
    },
    profileInfo: {
      marginLeft: 14,
      flex: 1,
    },
    profileCardLarge: {
      marginHorizontal: 20,
      borderRadius: 18,
      padding: 18,
      marginBottom: 24,
      elevation: 3,
    },
    centerInfoRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 24,
      marginVertical: 14,
    },
    centerInfoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    utilityRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 10,
    },
    apartmentRow: {
      flexDirection: 'row',
      marginTop: 6,
    },
    apartmentText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    apartmentCenter: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
      marginTop: 6,
    },
    logoutRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    editText: {
      color: colors.onPrimary,
      fontSize: 12,
      fontWeight: '600',
    },
    ButtonRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 8,
    },
    changeBtn: {
      borderColor: colors.border,
      borderWidth: 1,
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: 8,
      alignSelf: 'flex-start',
      backgroundColor: colors.surfaceMuted,
    },
    editText_Change: {
      color: colors.textPrimary,
      fontSize: 12,
      fontWeight: '600',
    },
    changeContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
  });
