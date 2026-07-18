import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Svg, { Ellipse } from 'react-native-svg';
import ThemedLoader from '../../../../components/ThemedLoader';
import { useI18n } from '../../../../i18n';
import {
  isEmail,
  normalizeEmail,
  trimValue,
} from '../../../../shared/validation/formValidation';
import { useAppTheme } from '../../../../theme/ThemeProvider';
import { forgotPassword } from '../../services/authService';
import createStyles from './ForgotPasswordScreen.styles';
import BackIcon from '../../../../assets/Icons/BackButton.svg';

type ForgotPasswordRouteParams = {
  email?: string;
};

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const styles = createStyles(colors);
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 32, 520);
  const params = (route.params || {}) as ForgotPasswordRouteParams;

  const [email, setEmail] = useState(trimValue(params.email || ''));
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      Alert.alert(
        t('common.error', 'Error'),
        t('auth.mobile.enterEmail', 'Please enter your email'),
      );
      return;
    }

    if (!isEmail(normalizedEmail)) {
      Alert.alert(
        t('common.error', 'Error'),
        t('auth.mobile.enterValidEmail', 'Please enter a valid email address'),
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await forgotPassword(normalizedEmail);
      const responseMessage = trimValue(response?.message);
      const successMessage =
        responseMessage === 'If an account exists, a password reset link has been sent.'
          ? t(
              'auth.mobile.forgotPasswordLinkSentMessage',
              'If an account exists, a password reset link has been sent.',
            )
          : responseMessage ||
            t(
              'auth.mobile.forgotPasswordLinkSentMessage',
              'If an account exists, a password reset link has been sent.',
            );

      Alert.alert(
        t('common.success', 'Success'),
        successMessage,
        [
          {
            text: t('common.mobile.common.ok', 'OK'),
            onPress: () => navigation.replace('Login'),
          },
        ],
      );
    } catch (error: any) {
      Alert.alert(
        t('common.error', 'Error'),
        String(
          error?.message ||
            t(
              'auth.mobile.forgotPasswordFailed',
              'Unable to send the verification code right now. Please try again.',
            ),
        ),
      );
    } finally {
      setSubmitting(false);
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
          <View style={[styles.content, { width: contentWidth, alignSelf: 'center' }]}>
            <View style={styles.backButtonRow}>
              <TouchableOpacity
                style={styles.backButtonCircle}
                onPress={() => navigation.replace('Login')}
                activeOpacity={0.8}
              >
                <BackIcon width={20} height={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {t('auth.mobile.forgotPassword', 'Forgot Password?')}
                </Text>
              </View>

              <Text style={styles.title}>
                {t('auth.mobile.forgotPasswordTitle', 'Reset your password')}
              </Text>

              <Text style={styles.description}>
                {t(
                  'auth.mobile.forgotPasswordDescription',
                  'Enter your email address below and we will send a password reset link if the account exists.',
                )}
              </Text>

              <Text style={styles.label}>{t('common.email', 'Email')}</Text>
              <TextInput
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                placeholder={t('auth.mobile.enterEmailPlaceholder', 'Enter your email')}
                placeholderTextColor={colors.textMuted}
                editable={!submitting}
              />

              <Text style={styles.helper}>
                {t(
                  'auth.mobile.forgotPasswordHelper',
                  'If this email is linked to an account, we will send a password reset link.',
                )}
              </Text>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  submitting ? styles.submitButtonDisabled : null,
                ]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ThemedLoader tone="onPrimary" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {t(
                      'auth.mobile.forgotPasswordSendLink',
                      'Send reset link',
                    )}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}