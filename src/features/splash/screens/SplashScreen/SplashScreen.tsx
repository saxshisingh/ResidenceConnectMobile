import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';

export default function SplashScreen() {
  return (
    <View style={styles.container}>

      <Image
        source={require('../../../../assets/app-logo.png')}
        resizeMode="contain"
        style={styles.logo}
      />

      <Text style={styles.title}>
        ResidenceConnect
      </Text>

      <Text style={styles.subtitle}>
        Smart living. Seamlessly connected.
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: 220,
    height: 220,
  },

  title: {
    marginTop: 20,
    fontSize: 28,
    fontWeight: '700',
    color: '#222222',
  },

  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#666666',
  },
});