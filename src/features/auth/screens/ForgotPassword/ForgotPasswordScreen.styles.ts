import { I18nManager, StyleSheet } from 'react-native';
import type { ThemeColors } from '../../../../theme/colors';

const CIRCLE_SIZE = 420;
const RADIUS = CIRCLE_SIZE / 2;

export default function createStyles(colors: ThemeColors) {
  const isRtl = I18nManager.isRTL;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
      overflow: 'hidden',
    },
    decorLayer: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 0,
    },
    keyboardContainer: {
      flex: 1,
      zIndex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingVertical: 28,
    },
    topCircle1: {
      position: 'absolute',
      width: CIRCLE_SIZE,
      height: CIRCLE_SIZE,
      top: -250,
      left: -260,
      borderRadius: RADIUS,
      backgroundColor: 'rgba(243, 126, 0, 0.6)',
    },
    topCircle2: {
      position: 'absolute',
      width: CIRCLE_SIZE,
      height: CIRCLE_SIZE,
      top: -320,
      left: -80,
      borderRadius: RADIUS,
      backgroundColor: 'rgba(243, 126, 0, 0.75)',
    },
    topCircle3: {
      position: 'absolute',
      width: CIRCLE_SIZE,
      height: CIRCLE_SIZE,
      top: -330,
      left: 100,
      borderRadius: RADIUS,
      backgroundColor: 'rgba(243, 126, 0, 0.55)',
    },
    bottomBlob1: {
      position: 'absolute',
      bottom: -90,
      right: -150,
    },
    bottomBlob2: {
      position: 'absolute',
      bottom: -150,
      right: -12,
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: 24,
      justifyContent: 'center',
    },
    backButtonRow: {
      marginBottom: 20,
      alignItems: isRtl ? 'flex-end' : 'flex-start',
    },
    backButtonCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.overlay,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.14,
      shadowRadius: 14,
      elevation: 7,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      padding: 22,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.overlay,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
      elevation: 8,
    },
    badge: {
      alignSelf: isRtl ? 'flex-end' : 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: colors.backgroundAlt,
      marginBottom: 14,
    },
    badgeText: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '700',
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.textPrimary,
      marginBottom: 10,
      textAlign: isRtl ? 'right' : 'left',
    },
    description: {
      color: colors.textMuted,
      fontSize: 15,
      lineHeight: 22,
      marginBottom: 22,
      textAlign: isRtl ? 'right' : 'left',
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 8,
      textAlign: isRtl ? 'right' : 'left',
    },
    input: {
      minHeight: 54,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingHorizontal: 16,
      color: colors.textPrimary,
      backgroundColor: colors.surfaceMuted,
      textAlign: isRtl ? 'right' : 'left',
      marginBottom: 10,
    },
    helper: {
      color: colors.textMuted,
      fontSize: 13,
      lineHeight: 19,
      marginBottom: 22,
      textAlign: isRtl ? 'right' : 'left',
    },
    submitButton: {
      backgroundColor: colors.primary,
      minHeight: 54,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 18,
    },
    submitButtonDisabled: {
      opacity: 0.7,
    },
    submitButtonText: {
      color: colors.onPrimary,
      fontSize: 16,
      fontWeight: '800',
    },
  });
}