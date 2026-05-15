import React from 'react';
import { Platform, StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewProps,
} from 'react-native-keyboard-aware-scroll-view';

type Props = KeyboardAwareScrollViewProps & {
  bottomOffset?: number;
  extraKeyboardSpace?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export default function KeyboardSafeScrollView({
  bottomOffset = 24,
  extraKeyboardSpace,
  contentContainerStyle,
  children,
  ...rest
}: Props) {
  const insets = useSafeAreaInsets();
  const keyboardSpace =
    extraKeyboardSpace ?? (Platform.OS === 'ios' ? 24 : 120);

  return (
    <KeyboardAwareScrollView
      enableOnAndroid
      enableAutomaticScroll
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      showsVerticalScrollIndicator={false}
      extraHeight={keyboardSpace}
      extraScrollHeight={keyboardSpace}
      enableResetScrollToCoords={false}
      contentContainerStyle={[
        { paddingBottom: bottomOffset + insets.bottom },
        contentContainerStyle,
      ]}
      {...rest}
    >
      {children}
    </KeyboardAwareScrollView>
  );
}
