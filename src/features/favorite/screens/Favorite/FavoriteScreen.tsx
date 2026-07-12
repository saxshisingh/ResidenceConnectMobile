import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useI18n } from '../../../../i18n';

export default function FavoriteScreen() {
  const { t } = useI18n();
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{t('favorite.mobile.title', 'Favorite Screen')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
  },
});
