/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useAppTheme } from '../theme/ThemeProvider';
import type { ThemeColors } from '../theme/colors';

type Props = {
  name: string;
  apartment: string;
  image?: unknown;
};

export default function NeighborCard({ name, apartment, image }: Props) {
  const { colors } = useAppTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const initial = name?.charAt(0).toUpperCase();
  return (
    <View style={styles.card}>
      {image ? (
        // @ts-ignore
        <Image source={{ uri: image }} style={styles.avatar} />
      ) : (
        <View style={styles.avatar}>
          <Text  style={{
    color: colors.primary,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',

  
    lineHeight: 56,    
    includeFontPadding: false, 
    textAlignVertical: 'center', 
  }}>{initial}</Text>
        </View>
      )}
      

      <Text style={styles.name}>{name}</Text>
      <Text style={styles.apartment}>{apartment}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  card: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  apartment: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
