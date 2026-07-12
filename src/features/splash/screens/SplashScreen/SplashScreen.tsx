import React, { useEffect } from "react";
import { View, Image, TouchableOpacity, Text, useWindowDimensions } from "react-native";
import styles from "./SplashScreen.styles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppDispatch } from '../../../../redux/hooks';
import { setAuthFromStorage } from '../../../auth/state/authSlice';
import { AUTH_STORAGE_KEYS } from '../../../auth/services/authService';
import { useI18n } from '../../../../i18n';

export default function SplashScreen({ navigation }: any) {
  const dispatch = useAppDispatch(); 
  const { t } = useI18n();
  const { width, height } = useWindowDimensions();
  const isCompactHeight = height <= 720;
  const isCompactWidth = width <= 360;
  const topCircleSize = Math.min(360, Math.max(240, width * 0.95));
  const topRadius = topCircleSize / 2;
  const imageSize = Math.min(width * 0.88, isCompactHeight ? 300 : 400);
  const buttonHorizontalPadding = isCompactWidth ? 40 : 72;
  const contentTopPadding = isCompactHeight ? 24 : 0;
  const contentBottomPadding = isCompactHeight ? 24 : 0;
  const imageBottomSpacing = isCompactHeight ? 20 : 32;
  const bottomCircleWidth = Math.min(320, Math.max(220, width * 0.84));
  const bottomCircleHeight = Math.min(300, Math.max(180, height * 0.28));
  const sideCircleWidth = Math.min(300, Math.max(200, width * 0.78));
  const sideCircleHeight = Math.min(220, Math.max(150, height * 0.22));

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const parseBoolean = (value: string | null | undefined, fallback = false) => {
      if (value === 'true') return true;
      if (value === 'false') return false;
      return fallback;
    };

    const init = async () => {
      try {
        const [[, token], [, isFirstLoginRaw], [, rememberMeRaw], [, hasSeenOnboardingRaw]] =
          await AsyncStorage.multiGet([
            AUTH_STORAGE_KEYS.token,
            AUTH_STORAGE_KEYS.isFirstLogin,
            AUTH_STORAGE_KEYS.rememberMe,
            'hasSeenOnboarding',
          ]);

        const shouldRemember = rememberMeRaw === 'true';
        const hasSeenOnboarding = parseBoolean(hasSeenOnboardingRaw, false);
        const isFirstLogin = parseBoolean(isFirstLoginRaw, false);

        if (!token || !shouldRemember) {
          await AsyncStorage.multiRemove([
            AUTH_STORAGE_KEYS.token,
            AUTH_STORAGE_KEYS.isFirstLogin,
            AUTH_STORAGE_KEYS.username,
            AUTH_STORAGE_KEYS.password,
          ]);
        } else {
          dispatch(setAuthFromStorage({ token, isFirstLogin }));
        }

        timeoutId = setTimeout(() => {
          if (cancelled) return;

          if (!token || !shouldRemember) {
            navigation.replace(hasSeenOnboarding ? 'Login' : 'StepOne');
            return;
          }

          if (isFirstLogin) {
            navigation.replace('ConfirmPassword');
            return;
          }

          navigation.replace('MainTabs');
        }, 1200);
      } catch (error) {
        console.warn('Splash bootstrap failed, falling back to onboarding:', error);
        if (!cancelled) {
          navigation.replace('StepOne');
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [dispatch, navigation]);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.topCircle1,
          {
            width: topCircleSize,
            height: topCircleSize,
            borderRadius: topRadius,
            top: -topCircleSize * 0.62,
            left: -topCircleSize * 0.62,
          },
        ]}
      />
      <View
        style={[
          styles.topCircle2,
          {
            width: topCircleSize,
            height: topCircleSize,
            borderRadius: topRadius,
            top: -topCircleSize * 0.72,
            left: -topCircleSize * 0.16,
          },
        ]}
      />
      <View
        style={[
          styles.topCircle3,
          {
            width: topCircleSize,
            height: topCircleSize,
            borderRadius: topRadius,
            top: -topCircleSize * 0.84,
            left: width * 0.38,
          },
        ]}
      />

      <View
        style={[
          styles.content,
          {
            paddingTop: contentTopPadding,
            paddingBottom: contentBottomPadding,
            paddingHorizontal: isCompactWidth ? 20 : 24,
          },
        ]}
      >
        <Image
          source={require("../../../../assets/splash.png")}
          style={[
            styles.image,
            {
              width: imageSize,
              height: imageSize,
              marginBottom: imageBottomSpacing,
            },
          ]}
          resizeMode="contain"
        />

        <TouchableOpacity
          style={[
            styles.button,
            {
              paddingHorizontal: buttonHorizontalPadding,
              paddingVertical: isCompactHeight ? 12 : 14,
            },
          ]}
          onPress={() => navigation.replace("Login")}
          activeOpacity={0.9}
        >
          <Text style={styles.buttonText}>{t('splash.mobile.getStarted', 'Get Started')}</Text>
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.bottomCircle1,
          {
            width: bottomCircleWidth,
            height: bottomCircleHeight,
            borderRadius: bottomCircleWidth / 2,
            bottom: -bottomCircleHeight * 0.82,
            left: width * 0.26,
          },
        ]}
      />
      <View
        style={[
          styles.bottomCircle2,
          {
            width: sideCircleWidth,
            height: sideCircleHeight,
            borderRadius: sideCircleWidth / 2,
            bottom: -sideCircleHeight * 0.55,
            right: -sideCircleWidth * 0.76,
          },
        ]}
      />
    </View>
  );
}
