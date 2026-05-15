import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../theme/ThemeProvider';


import BackIcon from '../assets/Icons/BackButton.svg';

type Props = {
  to?: string;      
  color?: string;  
  onPress?: () => void;
};

export default function BackButton({ to, color, onPress }: Props) {
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }

    if (to) {
      navigation.navigate(to);
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs');
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.container}
      activeOpacity={0.7}
    >
      <View style={styles.iconWrap}>
        <BackIcon width={22} height={22} color={color || colors.textPrimary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrap: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
