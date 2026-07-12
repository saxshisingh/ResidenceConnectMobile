import { StyleSheet } from 'react-native';
import type { ThemeColors } from '../../../../theme/colors';

const horizontalPadding = 20;
const columnGap = 12;

export const createStyles = (
  colors: ThemeColors,
  screenWidth: number,
  screenHeight: number,
) => {
  const isCompactWidth = screenWidth <= 360;
  const isCompactHeight = screenHeight <= 740;
  const isVeryCompactDevice = screenWidth <= 390 && screenHeight <= 760;
  const columns = isCompactWidth || isVeryCompactDevice ? 2 : 3;
  const cardWidth =
    (screenWidth - horizontalPadding * 2 - columnGap * (columns - 1)) / columns;
  const cardHeight = isVeryCompactDevice
    ? Math.max(cardWidth - 28, 118)
    : isCompactHeight
      ? Math.max(cardWidth - 18, 128)
      : cardWidth;

  return (
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: horizontalPadding,
      paddingTop: isCompactHeight ? 4 : 8,
      paddingBottom: isCompactHeight ? 12 : 24,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'flex-start',
      alignContent: 'flex-start',
      paddingBottom: isCompactHeight ? 96 : 28,
    },
    card: {
      width: cardWidth,
      height: cardHeight,
      backgroundColor: colors.surface,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: isCompactHeight ? 12 : 16,
      shadowColor: colors.overlay,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 2,
      paddingHorizontal: 8,
    },
    cardNoRightMargin: {
      marginRight: 0,
    },
    cardWithRightMargin: {
      marginRight: columnGap,
    },
    iconCircle: {
      width: isVeryCompactDevice ? 42 : isCompactHeight ? 46 : 50,
      height: isVeryCompactDevice ? 42 : isCompactHeight ? 46 : 50,
      borderRadius: isVeryCompactDevice ? 21 : isCompactHeight ? 23 : 25,
      backgroundColor: colors.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardLabel: {
      marginTop: isVeryCompactDevice ? 6 : isCompactHeight ? 8 : 10,
      fontSize: isCompactWidth ? 11 : isVeryCompactDevice ? 11.5 : 12,
      lineHeight: isCompactWidth ? 15 : isVeryCompactDevice ? 15.5 : 16,
      fontWeight: '600',
      color: colors.textPrimary,
      textAlign: 'center',
      paddingHorizontal: 2,
    },
  }));
};
