import React, {useEffect, useRef} from 'react';

import {
  View,
  Image,
  Text,
  Animated,
  Easing,
  StatusBar,
  useWindowDimensions,
} from 'react-native';

import styles from './SplashScreen.styles';

import {useI18n} from '../../../../i18n';

export default function SplashScreen() {
  const {t} = useI18n();

  const {width, height} = useWindowDimensions();

  /*
   * ==========================================
   * RESPONSIVE DIMENSIONS
   * ==========================================
   */

  const isCompactHeight = height <= 720;
  const isLargeScreen = width >= 600;

  const logoSize = isLargeScreen
    ? 300
    : Math.min(
        width * 0.68,
        isCompactHeight ? 235 : 285,
      );

  /*
   * ==========================================
   * ANIMATION VALUES
   * ==========================================
   */

  const logoOpacity = useRef(
    new Animated.Value(0),
  ).current;

  const logoScale = useRef(
    new Animated.Value(0.82),
  ).current;

  const logoTranslateY = useRef(
    new Animated.Value(30),
  ).current;

  const brandOpacity = useRef(
    new Animated.Value(0),
  ).current;

  const brandTranslateY = useRef(
    new Animated.Value(18),
  ).current;

  const loadingOpacity = useRef(
    new Animated.Value(0),
  ).current;

  const progress = useRef(
    new Animated.Value(0),
  ).current;

  const floatAnimation = useRef(
    new Animated.Value(0),
  ).current;

  const glowScale = useRef(
    new Animated.Value(0.8),
  ).current;

  const glowOpacity = useRef(
    new Animated.Value(0),
  ).current;

  /*
   * ==========================================
   * ANIMATIONS
   * ==========================================
   */

  useEffect(() => {
    let isMounted = true;

    /*
     * ------------------------------------------
     * Logo entrance
     * ------------------------------------------
     */

    const logoAnimation = Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.spring(logoScale, {
        toValue: 1,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }),

      Animated.timing(logoTranslateY, {
        toValue: 0,
        duration: 750,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    /*
     * ------------------------------------------
     * Brand entrance
     * ------------------------------------------
     */

    const brandAnimation = Animated.parallel([
      Animated.timing(brandOpacity, {
        toValue: 1,
        duration: 600,
        delay: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(brandTranslateY, {
        toValue: 0,
        duration: 600,
        delay: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    /*
     * ------------------------------------------
     * Loading entrance
     * ------------------------------------------
     */

    const loadingAnimation = Animated.timing(
      loadingOpacity,
      {
        toValue: 1,
        duration: 500,
        delay: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      },
    );

    /*
     * ------------------------------------------
     * Progress
     *
     * IMPORTANT:
     * width cannot use native driver.
     * ------------------------------------------
     */

    const progressAnimation = Animated.timing(
      progress,
      {
        toValue: 1,
        duration: 2200,
        delay: 700,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      },
    );

    /*
     * ------------------------------------------
     * Glow
     * ------------------------------------------
     */

    const glowAnimation = Animated.parallel([
      Animated.timing(glowOpacity, {
        toValue: 0.28,
        duration: 1000,
        delay: 300,
        useNativeDriver: true,
      }),

      Animated.timing(glowScale, {
        toValue: 1,
        duration: 1200,
        delay: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    /*
     * ------------------------------------------
     * Floating animation
     * ------------------------------------------
     */

    const floating = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnimation, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(floatAnimation, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    if (isMounted) {
      logoAnimation.start();
      brandAnimation.start();
      loadingAnimation.start();
      progressAnimation.start();
      glowAnimation.start();
      floating.start();
    }

    /*
     * ------------------------------------------
     * Cleanup
     * ------------------------------------------
     */

    return () => {
      isMounted = false;

      logoAnimation.stop();
      brandAnimation.stop();
      loadingAnimation.stop();
      progressAnimation.stop();
      glowAnimation.stop();
      floating.stop();

      logoOpacity.stopAnimation();
      logoScale.stopAnimation();
      logoTranslateY.stopAnimation();

      brandOpacity.stopAnimation();
      brandTranslateY.stopAnimation();

      loadingOpacity.stopAnimation();

      progress.stopAnimation();

      floatAnimation.stopAnimation();

      glowScale.stopAnimation();
      glowOpacity.stopAnimation();
    };
  }, [
    logoOpacity,
    logoScale,
    logoTranslateY,
    brandOpacity,
    brandTranslateY,
    loadingOpacity,
    progress,
    floatAnimation,
    glowScale,
    glowOpacity,
  ]);

  /*
   * ==========================================
   * INTERPOLATIONS
   * ==========================================
   */

  const floatingTranslateY =
    floatAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -7],
    });

  const floatingRotate =
    floatAnimation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [
        '0deg',
        '-0.5deg',
        '0deg',
      ],
    });

  const progressWidth =
    progress.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    });

  /*
   * ==========================================
   * RENDER
   * ==========================================
   */

  return (
    <View style={styles.container}>

      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {/* ======================================
          BACKGROUND
         ====================================== */}

      <View
        pointerEvents="none"
        style={[
          styles.topShape,
          {
            width: width * 1.15,
            height: width * 0.58,
            top: -width * 0.38,
            left: -width * 0.18,
          },
        ]}
      />

      <View
        pointerEvents="none"
        style={[
          styles.topShapeLight,
          {
            width: width * 0.55,
            height: width * 0.30,
            top: -width * 0.02,
            left: -width * 0.20,
          },
        ]}
      />

      <View
        pointerEvents="none"
        style={[
          styles.bottomShape,
          {
            width: width * 0.75,
            height: width * 0.38,
            bottom: -width * 0.22,
            right: -width * 0.15,
          },
        ]}
      />

      <View
        pointerEvents="none"
        style={[
          styles.bottomShapeLight,
          {
            width: width * 0.48,
            height: width * 0.25,
            bottom: -width * 0.03,
            right: -width * 0.10,
          },
        ]}
      />

      {/* ======================================
          CENTER
         ====================================== */}

      <View style={styles.centerContent}>

        {/* LOGO */}

        <Animated.View
          style={[
            styles.logoSection,
            {
              opacity: logoOpacity,

              transform: [
                {
                  translateY: logoTranslateY,
                },
                {
                  translateY: floatingTranslateY,
                },
                {
                  scale: logoScale,
                },
                {
                  rotate: floatingRotate,
                },
              ],
            },
          ]}
        >

          {/* Glow */}

          <Animated.View
            pointerEvents="none"
            style={[
              styles.logoGlow,
              {
                width: logoSize * 0.92,
                height: logoSize * 0.92,
                borderRadius: logoSize,

                opacity: glowOpacity,

                transform: [
                  {
                    scale: glowScale,
                  },
                ],
              },
            ]}
          />

          {/* Logo */}

          <Image
            source={require(
              '../../../../assets/app-logo.png',
            )}
            resizeMode="contain"
            style={[
              styles.logo,
              {
                width: logoSize,
                height: logoSize,
              },
            ]}
          />

        </Animated.View>

        {/* ==================================
            BRAND
           ================================== */}

        <Animated.View
          style={[
            styles.brandSection,
            {
              opacity: brandOpacity,

              transform: [
                {
                  translateY: brandTranslateY,
                },
              ],
            },
          ]}
        >

          <Text style={styles.brandName}>
            ResidenceConnect
          </Text>

          <Text style={styles.brandSubtitle}>
            Smart living. Seamlessly connected.
          </Text>

        </Animated.View>

      </View>

      {/* ======================================
          LOADING
         ====================================== */}

      <Animated.View
        style={[
          styles.loadingSection,
          {
            opacity: loadingOpacity,
          },
        ]}
      >

        <View style={styles.loadingHeader}>

          <Text style={styles.loadingText}>
            {t(
              'splash.mobile.loading',
              'Getting everything ready...',
            )}
          </Text>

          {/*
           * Do NOT render an AnimatedInterpolation
           * directly as Text children.
           *
           * This is intentionally static for iOS
           * stability.
           */}

          <Text style={styles.loadingPercent}>
            Loading
          </Text>

        </View>

        <View style={styles.progressTrack}>

          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressWidth,
              },
            ]}
          />

        </View>

      </Animated.View>

      {/* ======================================
          FOOTER
         ====================================== */}

      <View style={styles.footer}>

        <View style={styles.footerLine} />

        <Text style={styles.footerText}>
          SECURE • CONNECTED • SIMPLE
        </Text>

      </View>

    </View>
  );
}