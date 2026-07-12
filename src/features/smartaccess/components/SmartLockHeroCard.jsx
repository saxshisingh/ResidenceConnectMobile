import React, {useEffect, useMemo, useRef, useState} from 'react';
import {ActivityIndicator, Animated, Pressable, StyleSheet, Text, View} from 'react-native';
import Svg, {Circle, Defs, LinearGradient, Path, Rect, Stop} from 'react-native-svg';

const RING = 196;

const IconWifi = ({color}) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M5 12.55a11 11 0 0 1 14.08 0" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M1.42 9a16 16 0 0 1 21.16 0" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M8.53 16.11a6 6 0 0 1 6.95 0" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="12" cy="20" r="1.2" fill={color} />
  </Svg>
);

const LockSVG = ({unlocked, primary, primaryDark}) => (
  <Svg width={84} height={92} viewBox="0 0 80 88" fill="none">
    <Defs>
      <LinearGradient id="ttlockBodyGrad" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0%" stopColor={primary} />
        <Stop offset="100%" stopColor={primaryDark} />
      </LinearGradient>
    </Defs>
    <Path
      d={
        unlocked
          ? 'M24 40 L24 22 Q24 6 40 6 Q56 6 56 22 L56 30'
          : 'M24 42 L24 24 Q24 6 40 6 Q56 6 56 24 L56 42'
      }
      stroke={primary}
      strokeWidth="8"
      strokeLinecap="round"
      fill="none"
    />
    <Rect x="8" y="40" width="64" height="46" rx="12" fill="url(#ttlockBodyGrad)" />
    <Rect x="14" y="44" width="22" height="6" rx="3" fill="rgba(255,255,255,0.15)" />
    <Circle cx="40" cy="62" r="9" fill="rgba(255,255,255,0.15)" />
    <Circle cx="40" cy="62" r="5.5" fill="rgba(255,255,255,0.9)" />
    <Rect x="37" y="65" width="6" height="9" rx="3" fill={primary} />
  </Svg>
);

export default function SmartLockHeroCard({
  colors,
  isDark,
  title,
  subtitle,
  infoText,
  battery,
  idleHint = 'Tap lock to preview',
  successHint = 'Unlocked successfully',
  lockedHint = 'Tap to unlock',
  unlockedHint = 'Tap again to lock',
  isUnlocked,
  isBusy = false,
  onToggleLock,
}) {
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [localUnlocked, setLocalUnlocked] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const r1s = useRef(new Animated.Value(0.7)).current;
  const r1o = useRef(new Animated.Value(0)).current;
  const r2s = useRef(new Animated.Value(0.7)).current;
  const r2o = useRef(new Animated.Value(0)).current;
  const unlocked = typeof isUnlocked === 'boolean' ? isUnlocked : localUnlocked;
  const batteryValue =
    typeof battery === 'number' && Number.isFinite(battery)
      ? Math.max(0, Math.min(100, battery))
      : null;

  useEffect(() => {
    if (unlocked) {
      ripple();
    }
  }, [unlocked]);

  const ripple = () => {
    r1s.setValue(0.7);
    r1o.setValue(0.45);
    r2s.setValue(0.7);
    r2o.setValue(0.45);
    Animated.stagger(180, [
      Animated.parallel([
        Animated.timing(r1s, {toValue: 1.55, duration: 700, useNativeDriver: true}),
        Animated.timing(r1o, {toValue: 0, duration: 700, useNativeDriver: true}),
      ]),
      Animated.parallel([
        Animated.timing(r2s, {toValue: 1.55, duration: 700, useNativeDriver: true}),
        Animated.timing(r2o, {toValue: 0, duration: 700, useNativeDriver: true}),
      ]),
    ]).start();
  };

  const onPressIn = () => {
    Animated.spring(scale, {toValue: 0.94, useNativeDriver: true}).start();
    Animated.timing(glow, {toValue: 1, duration: 200, useNativeDriver: true}).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {toValue: 1, friction: 4, useNativeDriver: true}).start();
    Animated.timing(glow, {toValue: 0, duration: 300, useNativeDriver: true}).start();
  };

  const onPress = () => {
    if (isBusy) {
      return;
    }
    if (onToggleLock) {
      onToggleLock();
      return;
    }
    ripple();
    setLocalUnlocked(true);
    setTimeout(() => setLocalUnlocked(false), 2200);
  };

  const glowOpacity = glow.interpolate({inputRange: [0, 1], outputRange: [0, 0.25]});

  return (
    <View style={styles.heroCard}>
      <View style={styles.heroCirclePrimary} />
      <View style={styles.heroCircleAccent} />

      <View style={styles.metaRow}>
        <View style={styles.metaTextWrap}>
          <Text style={styles.lockName} numberOfLines={1}>{title}</Text>
          {!!subtitle && <Text style={styles.lockSubText}>{subtitle}</Text>}
        </View>

        <View style={styles.batteryPill}>
          <Text style={styles.batteryText}>
            {batteryValue === null ? '--' : `${batteryValue}%`}
          </Text>
          <View style={styles.batteryShell}>
            <View
              style={[
                styles.batteryFill,
                {width: `${batteryValue === null ? 0 : batteryValue}%`},
              ]}
            />
          </View>
        </View>
      </View>

      {!!infoText && (
        <View style={styles.infoPill}>
          <Text style={styles.infoPillText}>{infoText}</Text>
        </View>
      )}

      <View style={styles.zone}>
        <Animated.View
          style={[
            styles.ripple,
            {width: RING, height: RING, borderRadius: RING / 2, transform: [{scale: r1s}], opacity: r1o},
          ]}
        />
        <Animated.View
          style={[
            styles.ripple,
            {width: RING, height: RING, borderRadius: RING / 2, transform: [{scale: r2s}], opacity: r2o},
          ]}
        />

        <View style={styles.outer}>
          <Animated.View style={[StyleSheet.absoluteFillObject, styles.outerGlow, {opacity: glowOpacity}]} />
          <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress}>
            <Animated.View style={[styles.inner, {transform: [{scale}]}]}>
              {isBusy ? (
                <ActivityIndicator size="large" color={colors.primary} />
              ) : (
                <LockSVG
                  unlocked={unlocked}
                  primary={colors.primary}
                  primaryDark={isDark ? '#D97706' : '#C35F00'}
                />
              )}
            </Animated.View>
          </Pressable>
        </View>

        <View style={styles.badge}>
          <IconWifi color={colors.onPrimary} />
        </View>
      </View>

      <Text style={[styles.hint, unlocked && styles.hintSuccess]}>
        {isBusy
          ? 'Processing...'
          : unlocked
            ? onToggleLock ? unlockedHint : successHint
            : onToggleLock ? lockedHint : idleHint}
      </Text>
    </View>
  );
}

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    heroCard: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 20,
      overflow: 'hidden',
      alignItems: 'center',
      shadowColor: isDark ? '#000' : '#111827',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: isDark ? 0.22 : 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    heroCirclePrimary: {
      position: 'absolute',
      top: -64,
      right: -48,
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: isDark ? 'rgba(245,158,11,0.10)' : 'rgba(243,126,0,0.10)',
    },
    heroCircleAccent: {
      position: 'absolute',
      bottom: -44,
      left: -36,
      width: 130,
      height: 130,
      borderRadius: 65,
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(243,126,0,0.06)',
    },
    metaRow: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 12,
    },
    metaTextWrap: {flex: 1},
    lockName: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.textPrimary,
      marginBottom: 4,
      letterSpacing: -0.3,
    },
    lockSubText: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '500',
    },
    batteryPill: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.backgroundAlt,
      paddingHorizontal: 12,
      paddingVertical: 10,
      minWidth: 82,
    },
    batteryText: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.primary,
      textAlign: 'center',
      marginBottom: 6,
    },
    batteryShell: {
      width: '100%',
      height: 10,
      borderRadius: 999,
      backgroundColor: colors.surfaceMuted,
      overflow: 'hidden',
    },
    batteryFill: {
      height: '100%',
      borderRadius: 999,
      backgroundColor: '#22C55E',
    },
    infoPill: {
      alignSelf: 'flex-start',
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 7,
      backgroundColor: colors.surfaceMuted,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
    },
    infoPillText: {
      fontSize: 11,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    zone: {
      width: RING + 56,
      height: RING + 56,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 4,
      marginBottom: 16,
    },
    ripple: {
      position: 'absolute',
      borderWidth: 2,
      borderColor: colors.primary,
      backgroundColor: 'transparent',
    },
    outer: {
      width: RING,
      height: RING,
      borderRadius: RING / 2,
      backgroundColor: isDark ? 'rgba(245,158,11,0.12)' : '#FFE4C7',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: {width: 0, height: 8},
      shadowOpacity: isDark ? 0.32 : 0.18,
      shadowRadius: 18,
      elevation: 8,
    },
    outerGlow: {
      borderRadius: RING / 2,
      backgroundColor: colors.primary,
    },
    inner: {
      width: RING - 30,
      height: RING - 30,
      borderRadius: (RING - 30) / 2,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: isDark ? 0.25 : 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    badge: {
      position: 'absolute',
      right: 18,
      bottom: 18,
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.24,
      shadowRadius: 8,
      elevation: 5,
    },
    hint: {
      fontSize: 13,
      color: colors.textMuted,
      fontWeight: '500',
      textAlign: 'center',
    },
    hintSuccess: {
      color: '#16A34A',
      fontWeight: '700',
    },
  });
