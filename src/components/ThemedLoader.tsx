import React from 'react';
import { ActivityIndicator, ActivityIndicatorProps } from 'react-native';
import { useAppTheme } from '../theme/ThemeProvider';

type LoaderTone = 'primary' | 'onPrimary';

interface ThemedLoaderProps extends ActivityIndicatorProps {
  tone?: LoaderTone;
}

export default function ThemedLoader({
  tone = 'primary',
  color,
  ...rest
}: ThemedLoaderProps) {
  const { colors } = useAppTheme();
  const toneMap: Record<LoaderTone, string> = {
    primary: colors.primary,
    onPrimary: colors.onPrimary,
  };
  return <ActivityIndicator color={color || toneMap[tone]} {...rest} />;
}
