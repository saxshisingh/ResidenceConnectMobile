import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../theme/ThemeProvider';

interface EmptyStateProps {
  title: string;
  description?: string;
  illustration?: React.ReactNode;
  compact?: boolean;
}

export default function EmptyState({
  title,
  description,
  illustration,
  compact = false,
}: EmptyStateProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, compact && styles.compact]}>
      {illustration ? <View style={styles.illustrationWrap}>{illustration}</View> : null}
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      {description ? (
        <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  compact: {
    paddingVertical: 16,
  },
  illustrationWrap: {
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    marginTop: 6,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
