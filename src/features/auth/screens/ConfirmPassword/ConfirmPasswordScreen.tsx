/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, {   Circle, Ellipse, Path } from 'react-native-svg';
import styles from '../Login/LoginScreen.styles';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { confirmPasswordThunk } from '../../state/authSlice';
import { resetPasswordState } from '../../state/authSlice';
import { AUTH_STORAGE_KEYS } from '../../services/authService';
import { useAppTheme } from '../../../../theme/ThemeProvider';
import { useI18n } from '../../../../i18n';
import {
  trimValue,
} from '../../../../shared/validation/formValidation';




export default function ConfirmPasswordScreen() {
     const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { colors } = useAppTheme();
  const { t } = useI18n();

  const {  passwordUpdated, loading, token, isFirstLogin } = useAppSelector(
    state => state.auth
  );
  const wasFirstLoginRef = useRef(isFirstLogin);

  const [secure, setSecure] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 32, 520);
useEffect(() => {
  console.log('[ConfirmPassword] screen mounted', {
    hasReduxToken: Boolean(token),
    isFirstLogin,
    loading,
  });
}, []);

useEffect(() => {
  console.log('[ConfirmPassword] resetPasswordState on mount');
  dispatch(resetPasswordState());
}, [dispatch]);

useEffect(() => {
  console.log('[ConfirmPassword] passwordUpdated changed', { passwordUpdated, isFirstLogin });
  if (passwordUpdated) {
    Alert.alert(
      t('common.success', 'Success'),
      t('auth.mobile.passwordUpdated', 'Password updated successfully')
    );
    dispatch(resetPasswordState());
    if (wasFirstLoginRef.current) {
      navigation.replace('Language');
    } else {
      navigation.goBack();
    }
  }
}, [passwordUpdated, dispatch, navigation, isFirstLogin, t]);

  const handleConfirm = async () => {
    console.log('[ConfirmPassword] handleConfirm start', {
      newPasswordLength: newPassword.length,
      confirmPasswordLength: confirmPassword.length,
      loading,
    });
    const newPasswordValue = trimValue(newPassword);
    const confirmPasswordValue = trimValue(confirmPassword);

    if (!newPasswordValue || !confirmPasswordValue) {
      console.log('[ConfirmPassword] validation failed: empty fields');
      Alert.alert(t('common.error', 'Error'), t('auth.mobile.fillAllFields', 'Please fill all fields'));
      return;
    }

    if (newPasswordValue !== confirmPasswordValue) {
      console.log('[ConfirmPassword] validation failed: mismatch');
      Alert.alert(t('common.error', 'Error'), t('auth.mobile.passwordMismatch', 'Passwords do not match'));
      return;
    }

    const storedToken = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.token);
    console.log('[ConfirmPassword] submit pressed', {
      hasReduxToken: Boolean(token),
      hasStoredToken: Boolean(storedToken),
      isFirstLogin,
      newPasswordLength: newPasswordValue.length,
    });

    if (!token && !storedToken) {
      console.log('[ConfirmPassword] aborting: no token found');
      Alert.alert(
        t('common.error', 'Error'),
        t('auth.mobile.sessionExpired', 'Your session has expired. Please log in again.'),
      );
      return;
    }

    try {
      console.log('[ConfirmPassword] dispatching confirmPasswordThunk');
      const result = await dispatch(
        confirmPasswordThunk({ newPassword: newPasswordValue, confirmPassword: confirmPasswordValue })
      ).unwrap();
      console.log('[ConfirmPassword] submit success:', result);
    } catch (submitError: any) {
      console.log('[ConfirmPassword] submit failed:', submitError);
      Alert.alert(
        t('common.error', 'Error'),
        String(submitError || t('settings.resetPassword.error', 'Failed to update password')),
      );
    }
  };
  return (
    <View style={styles.container}>
      <View pointerEvents="none" style={styles.decorLayer}>
        <View style={styles.topCircle1} />
        <View style={styles.topCircle2} />
        <View style={styles.topCircle3} />

        <View style={styles.bottomBlob1}>
          <Svg width={320} height={260} viewBox="0 0 320 260">
            <Ellipse cx="240" cy="200" rx="180" ry="150" fill={colors.primary} fillOpacity={0.5} />
          </Svg>
        </View>

        <View style={styles.bottomBlob2}>
          <Svg width={300} height={240} viewBox="0 0 300 240">
            <Ellipse cx="220" cy="180" rx="180" ry="150" fill={colors.primary} fillOpacity={0.7} />
          </Svg>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.content_, { width: contentWidth, alignSelf: 'center' }]}>
        <Text style={styles.title}>{t('auth.mobile.setNewPassword', 'Set New Password')}</Text>

        <Text style={styles.label_}>{t('auth.mobile.newPassword', 'New Password')}</Text>
        <View style={styles.passwordBox_}>
          <TextInput
            secureTextEntry={secure}
            style={styles.passwordInput_}
            value={newPassword}
            onChangeText={value => {
              console.log('[ConfirmPassword] newPassword changed', { length: value.length });
              setNewPassword(value);
            }}
            placeholder={t('auth.mobile.enterNewPassword', 'Enter new password')}
          />
                    <TouchableOpacity onPress={() => setSecure(!secure)}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={styles.eyeIcon}>
              {secure ? (
                <>
                  <Path
                    d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.498 18.498 0 01-2.16 3.19"
                    stroke={colors.textMuted}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M14.12 14.12a3 3 0 11-4.24-4.24"
                    stroke={colors.textMuted}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M1 1l22 22"
                    stroke={colors.textMuted}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              ) : (
                <>
                  <Path
                    d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                    stroke={colors.textMuted}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Circle
                    cx={12}
                    cy={12}
                    r={3}
                    stroke={colors.textMuted}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}
            </Svg>
          </TouchableOpacity>
        </View>

        <Text style={styles.label_}>{t('auth.mobile.confirmPassword', 'Confirm Password')}</Text>
        <View style={styles.passwordBox_}>
          <TextInput
            secureTextEntry={secure}
            style={styles.passwordInput_}
            value={confirmPassword}
            onChangeText={value => {
              console.log('[ConfirmPassword] confirmPassword changed', { length: value.length });
              setConfirmPassword(value);
            }}
            placeholder={t('auth.mobile.confirmPasswordPlaceholder', 'Confirm password')}
          />
                    <TouchableOpacity onPress={() => setSecure(!secure)}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={styles.eyeIcon}>
              {secure ? (
                <>
                  <Path
                    d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.498 18.498 0 01-2.16 3.19"
                    stroke={colors.textMuted}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M14.12 14.12a3 3 0 11-4.24-4.24"
                    stroke={colors.textMuted}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M1 1l22 22"
                    stroke={colors.textMuted}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              ) : (
                <>
                  <Path
                    d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                    stroke={colors.textMuted}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Circle
                    cx={12}
                    cy={12}
                    r={3}
                    stroke={colors.textMuted}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}
            </Svg>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => {
            console.log('[ConfirmPassword] confirm button tapped');
            handleConfirm();
          }}
          disabled={loading}>
          <Text style={styles.loginText}>
            {loading ? t('settings.resetPassword.buttons.updating', 'Updating...') : t('common.confirm', 'Confirm')}
          </Text>
        </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      </View>
  );
}
