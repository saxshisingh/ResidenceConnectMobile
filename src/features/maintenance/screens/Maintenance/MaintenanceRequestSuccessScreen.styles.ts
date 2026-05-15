import { StyleSheet } from 'react-native';
import type { ThemeColors } from '../../../../theme/colors';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.32,
    shadowRadius: 14,
    elevation: 8,
  },
  checkText: {
    color: colors.onPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  title: {
    marginTop: 22,
    fontSize: 28,
    textAlign: 'center',
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  });
