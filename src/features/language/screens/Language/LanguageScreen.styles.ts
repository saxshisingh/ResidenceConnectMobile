import { StyleSheet } from 'react-native';
import type { ThemeColors } from '../../../../theme/colors';
const CIRCLE_SIZE = 420;
const RADIUS = CIRCLE_SIZE / 2;

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

   topCircle1: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    top: -310,
    left: -150,
    borderRadius: RADIUS,
    backgroundColor: colors.primary,
    opacity: 0.6,
    zIndex: 1,
  },

  topCircle2: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    top: -350,
    left: -80,
    borderRadius: RADIUS,
    backgroundColor: colors.primary,
    opacity: 0.75,
    zIndex: 2,
  },

  topCircle3: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    top: -390,
    left: 100,
    borderRadius: RADIUS,
    backgroundColor: colors.primary,
    opacity: 0.55,
    zIndex: 3,
  },


  topDesign: {
    position: 'absolute',
    top: -40,
    left: -60,
  },

  bottomDesign: {
    position: 'absolute',
    bottom: -60,
    right: -60,
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 120,
    paddingBottom: 30,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  flag: {
    fontSize: 22,
    marginRight: 12,
  },

  language: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },

  check: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '700',
  },

  proceedBtn: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 120,
  },
  proceedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  proceedText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
},
loadingText: {
  marginTop: 12,
  fontSize: 14,
  color: colors.textMuted,
},
errorContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 20,
},
errorText: {
  fontSize: 14,
  color: colors.danger,
  textAlign: 'center',
  marginBottom: 16,
},
retryBtn: {
  backgroundColor: colors.primary,
  paddingHorizontal: 24,
  paddingVertical: 12,
  borderRadius: 8,
},
retryText: {
  color: colors.onPrimary,
  fontSize: 16,
  fontWeight: '600',
},
proceedBtnDisabled: {
  opacity: 0.6,
},
});
