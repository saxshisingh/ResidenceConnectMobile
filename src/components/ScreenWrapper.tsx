import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import BackButton from './BackButton';
import { useAppTheme } from '../theme/ThemeProvider';

interface ScreenWrapperProps {
  children: React.ReactNode;
  title?: string;
  onBackPress?: () => void;
  rightIcon?: React.ReactNode;
  showHeader?: boolean;
  hideBackButton?: boolean;
}

export default function ScreenWrapper({
  children,
  title,
  onBackPress,
  rightIcon,
  showHeader = true,
  hideBackButton = false,
}: ScreenWrapperProps) {
  const { colors } = useAppTheme();
  const navigation = useNavigation<any>();

  const handleBackPress = React.useCallback(() => {
    if (onBackPress) {
      onBackPress();
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('MainTabs');
  }, [navigation, onBackPress]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.gradientTop }]} edges={['top']}>
      <View style={styles.container}>
        <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
          <Defs>
            <LinearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={colors.gradientTop} />
              <Stop offset="100%" stopColor={colors.gradientBottom} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#grad)" />
        </Svg>

        {showHeader && (
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {!hideBackButton ? (
                <BackButton color={colors.textPrimary} onPress={handleBackPress} />
              ) : null}

              {title ? (
                <Text
                  style={[styles.headerTitle, { color: colors.textPrimary }]}
                  numberOfLines={2}
                >
                  {title}
                </Text>
              ) : null}
            </View>

            {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
          </View>
        )}

        <View style={[styles.body, showHeader && styles.bodyWithHeader]}>{children}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    flexShrink: 1,
    lineHeight: 24,
  },

  rightIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 40,
  },
  body: {
    flex: 1,
  },
  bodyWithHeader: {
    paddingTop: 8,
  },
});
