import React, { useEffect, useMemo, useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import Svg, { Path } from 'react-native-svg';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { NativeModules, PermissionsAndroid } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ScreenWrapper from '../../../../components/ScreenWrapper';
import { ServiceKey } from '../../services/maintenanceService';
import { createStyles } from './MaintenanceRaiseRequestScreen.styles';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { createMaintenanceRequestThunk } from '../../state/maintenanceSlice';
import { useI18n } from '../../../../i18n';
import { useAppTheme } from '../../../../theme/ThemeProvider';
import {
  hasMaxLength,
  hasMinLength,
  trimValue,
} from '../../../../shared/validation/formValidation';

const SaveIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 12.5l4.2 4.2L19 7"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CancelIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6 6 18M6 6l12 12"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
    />
  </Svg>
);

const ensureVoiceEmitterCompatibility = () => {
  const voiceModule =
    (NativeModules as any)?.Voice ||
    (NativeModules as any)?.RCTVoice ||
    (NativeModules as any)?.VoiceModule ||
    null;

  if (!voiceModule) {
    return;
  }

  // Newer React Native requires NativeEventEmitter modules to expose these.
  if (typeof voiceModule.addListener !== 'function') {
    voiceModule.addListener = () => {};
  }
  if (typeof voiceModule.removeListeners !== 'function') {
    voiceModule.removeListeners = () => {};
  }
};

const isVoiceNativeReady = () => {
  const voiceNativeModule =
    (NativeModules as any)?.Voice ||
    (NativeModules as any)?.RCTVoice ||
    (NativeModules as any)?.VoiceModule ||
    null;

  return Boolean(voiceNativeModule);
};

export default function MaintenanceRaiseRequestScreen({ navigation, route }: any) {
  const dispatch = useAppDispatch();
  const { language, t } = useI18n();
  const { colors } = useAppTheme();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isCompactWidth = width <= 360;
  const isCompactHeight = height <= 720;
  const styles = React.useMemo(
    () => createStyles(colors, { isCompactWidth, isCompactHeight, bottomInset: insets.bottom }),
    [colors, insets.bottom, isCompactHeight, isCompactWidth],
  );
  const handleBack = React.useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('MaintenanceRaiseCategory');
  }, [navigation]);
  const serviceKey: ServiceKey = route?.params?.serviceKey ?? 'support';
  const serviceLabel: string =
    route?.params?.serviceLabel ??
    t('maintenance.mobile.raise.defaultServiceLabel', 'General Support');
  const serviceCategoryId: string | undefined = route?.params?.serviceCategoryId;
  const user = useAppSelector(state => state.auth.user);
  const apartmentUnit = user?.data?.apartmentUnit || 'A-402';
  const residentMobile = user?.data?.mobile || '(454) 726-0592';

  const [description, setDescription] = useState('');
  const [preferredDateTime, setPreferredDateTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [inputMode, setInputMode] = useState<'type' | 'speak'>('type');
  const [isListening, setIsListening] = useState(false);
  const [saving, setSaving] = useState(false);
  const [createdRequestId, setCreatedRequestId] = useState('');
  const [successVisible, setSuccessVisible] = useState(false);

  const formatPreferredDateTime = (value: Date | null) => {
    if (!value) {
      return '';
    }

    const locale = language === 'fr' ? 'fr-FR' : language === 'ar' ? 'ar-SA' : 'en-GB';
    const datePart = value.toLocaleDateString(locale);
    const timePart = value.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${datePart} ${timePart}`;
  };

  const openDateTimePicker = () => {
    setShowDatePicker(true);
  };

  const onDateSelected = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');

    if (!selectedDate) {
      return;
    }

    const base = preferredDateTime || new Date();
    const nextDate = new Date(selectedDate);
    nextDate.setHours(base.getHours(), base.getMinutes(), 0, 0);
    setPreferredDateTime(nextDate);

    if (Platform.OS === 'android') {
      setShowTimePicker(true);
    }
  };

  const onTimeSelected = (_event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');

    if (!selectedTime) {
      return;
    }

    const base = preferredDateTime || new Date();
    const nextDate = new Date(base);
    nextDate.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
    setPreferredDateTime(nextDate);
  };

  const Voice = useMemo(() => {
    try {
      ensureVoiceEmitterCompatibility();
      return require('@react-native-voice/voice')?.default ?? null;
    } catch (_e) {
      return null;
    }
  }, []);
  const isVoiceSupported = useMemo(
    () => Boolean(Voice) && isVoiceNativeReady(),
    [Voice],
  );

  useEffect(() => {
    if (!Voice) {
      return;
    }

    Voice.onSpeechResults = (event: any) => {
      const value = event?.value?.[0];
      if (value) {
        setDescription(value);
      }
      setIsListening(false);
    };

    Voice.onSpeechError = () => {
      setIsListening(false);
      Alert.alert(
        t('maintenance.mobile.raise.speechErrorTitle', 'Speech Error'),
        t(
          'maintenance.mobile.raise.captureVoiceError',
          'Unable to capture voice input. Please try again.'
        )
      );
    };

    return () => {
      // Avoid removeAllListeners() here: older voice builds can crash with
      // "destroySpeech of null". Reset JS handlers directly instead.
      Voice.onSpeechResults = undefined;
      Voice.onSpeechError = undefined;
    };
  }, [Voice]);

  useEffect(() => {
    if (!isVoiceSupported && inputMode !== 'type') {
      setInputMode('type');
    }
  }, [inputMode, isVoiceSupported]);

  const requestMicrophonePermission = async () => {
    if (Platform.OS !== 'android') {
      return true;
    }

    if (Platform.Version < 23) {
      return true;
    }

    try {
      const permission = PermissionsAndroid.PERMISSIONS.RECORD_AUDIO;
      const hasPermission = await PermissionsAndroid.check(permission);

      if (hasPermission) {
        return true;
      }

      const granted = await PermissionsAndroid.request(permission, {
        title: t('maintenance.mobile.raise.microphonePermissionTitle', 'Microphone Permission'),
        message: t(
          'maintenance.mobile.raise.microphonePermissionMessage',
          'We need microphone access for speech to text.'
        ),
        buttonPositive: t('maintenance.mobile.raise.allow', 'Allow'),
        buttonNegative: t('maintenance.mobile.raise.deny', 'Deny'),
      });

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
      return false;
    }
  };

  const startListening = async () => {
    if (!Voice) {
      Alert.alert(
        t('maintenance.mobile.raise.speechToTextTitle', 'Speech To Text'),
        t(
          'maintenance.mobile.raise.installVoiceModule',
          'Install @react-native-voice/voice to enable voice input in description.'
        ),
      );
      return;
    }

    try {
      if (!isVoiceNativeReady()) {
        Alert.alert(
          t('maintenance.mobile.raise.speechToTextTitle', 'Speech To Text'),
          t(
            'maintenance.mobile.raise.voiceModuleUnavailable',
            'Voice module is not available in this build. Please rebuild the app.'
          ),
        );
        return;
      }

      const micAllowed = await requestMicrophonePermission();
      if (!micAllowed) {
        Alert.alert(
          t('maintenance.mobile.raise.permissionRequiredTitle', 'Permission Required'),
          t(
            'maintenance.mobile.raise.permissionRequiredMessage',
            'Please allow microphone permission to use voice input.'
          )
        );
        return;
      }

      setIsListening(true);
      await Voice.start(language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US');
    } catch (e: any) {
      setIsListening(false);
      Alert.alert(
        t('maintenance.mobile.raise.speechErrorTitle', 'Speech Error'),
        e?.message ||
          t('maintenance.mobile.raise.couldNotStartVoice', 'Could not start voice recording.')
      );
    }
  };

  const stopListening = async () => {
    if (!Voice) {
      return;
    }

    try {
      await Voice.stop();
    } finally {
      setIsListening(false);
    }
  };

  const onSave = async () => {
    const issueSummary = trimValue(description);

    if (!issueSummary) {
      Alert.alert(
        t('maintenance.mobile.raise.validationTitle', 'Validation'),
        t('maintenance.mobile.raise.problemDescriptionRequired', 'Please enter problem description.')
      );
      return;
    }

    if (!hasMinLength(issueSummary, 10) || !hasMaxLength(issueSummary, 1000)) {
      Alert.alert(
        t('maintenance.mobile.raise.validationTitle', 'Validation'),
        t('maintenance.mobile.raise.problemDescriptionInvalid', 'Description must be between 10 and 1000 characters.'),
      );
      return;
    }

    if (!serviceCategoryId) {
      Alert.alert(
        t('maintenance.mobile.raise.validationTitle', 'Validation'),
        t(
          'maintenance.mobile.raise.serviceCategoryMissing',
          'Service category ID is missing. Please select a valid service.'
        )
      );
      return;
    }

    const residentId = user?.data?.residentId;
    const createdBy = user?.data?.userId;
    if (!residentId || !createdBy) {
      Alert.alert(
        t('common.error', 'Error'),
        t('maintenance.mobile.raise.residentNotFound', 'Resident information not found.')
      );
      return;
    }

    try {
      setSaving(true);
      const requestId = await dispatch(
        createMaintenanceRequestThunk({
          category: serviceCategoryId,
          issueSummary,
          residentId,
          unitNo: apartmentUnit,
          contact: residentMobile,
          notes: "",
          createdBy,
        }),
      ).unwrap();

      setCreatedRequestId(String(requestId || ''));
      setSuccessVisible(true);
    } catch (e: any) {
      Alert.alert(
        t('common.error', 'Error'),
        e?.message ||
          t('maintenance.mobile.raise.createRequestError', 'Failed to create maintenance request.')
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenWrapper
      title={t('maintenance.mobile.raiseRequest', 'Raise Maintenance Request')}
      onBackPress={handleBack}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 16 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.card}>
          <Text style={styles.label}>{t('maintenance.mobile.raise.serviceType', 'Service Type')}</Text>
          <View style={styles.valueBox}>
            <Text style={styles.valueText}>
              {serviceLabel}
            </Text>
          </View>

          <Text style={styles.label}>
            {t('maintenance.mobile.raise.problemDescription', 'Problem Description')}
          </Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={description}
            onChangeText={setDescription}
            placeholder={t('maintenance.mobile.raise.describeIssue', 'Describe the issue')}
            multiline
          />

          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[styles.modeButton, inputMode === 'type' && styles.modeButtonActive]}
              onPress={() => setInputMode('type')}
            >
              <Text style={[styles.modeText, inputMode === 'type' && styles.modeTextActive]}>
                {t('maintenance.mobile.raise.write', 'Write')}
              </Text>
            </TouchableOpacity>
            {isVoiceSupported ? (
              <TouchableOpacity
                style={[styles.modeButton, inputMode === 'speak' && styles.modeButtonActive]}
                onPress={() => setInputMode('speak')}
              >
                <Text style={[styles.modeText, inputMode === 'speak' && styles.modeTextActive]}>
                  {t('maintenance.mobile.raise.speak', 'Speak')}
                </Text>
              </TouchableOpacity>
            ) : null}
            {isVoiceSupported && inputMode === 'speak' ? (
              <TouchableOpacity
                style={styles.listenButton}
                onPress={isListening ? stopListening : startListening}
              >
                <Text style={styles.listenButtonText}>
                  {isListening
                    ? t('maintenance.mobile.raise.stop', 'Stop')
                    : t('maintenance.mobile.raise.startVoice', 'Start Voice')}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <Text style={styles.label}>
            {t('maintenance.mobile.raise.preferredDateTime', 'Preferred Date & Time')}
          </Text>
          <TouchableOpacity style={styles.input} onPress={openDateTimePicker}>
            <Text
              style={
                preferredDateTime
                  ? styles.dateTimeText
                  : styles.dateTimePlaceholderText
              }
            >
              {preferredDateTime
                ? formatPreferredDateTime(preferredDateTime)
                : t('maintenance.mobile.raise.selectDateTime', 'Select date and time')}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>{t('maintenance.mobile.raise.apartmentDetails', 'Apartment Details')}</Text>
          <TextInput
            style={styles.input}
            value={apartmentUnit}
            editable={false}
            selectTextOnFocus={false}
          />

          <Text style={styles.label}>{t('maintenance.mobile.raise.contactNumber', 'Contact Number')}</Text>
          <TextInput
            style={styles.input}
            value={residentMobile}
            editable={false}
            selectTextOnFocus={false}
          />

          {/* <Text style={styles.label}>Urgency Level</Text>
          <View style={styles.urgencyRow}>
            {(['Low', 'Medium', 'High'] as const).map(item => (
              <TouchableOpacity
                key={item}
                style={[styles.urgencyButton, urgencyLevel === item && styles.urgencyButtonActive]}
                onPress={() => setUrgencyLevel(item)}
              >
                <Text
                  style={[styles.urgencyText, urgencyLevel === item && styles.urgencyTextActive]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View> */}
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.saveButton} onPress={onSave} disabled={saving}>
              <View style={styles.actionContent}>
                <SaveIcon color={colors.onPrimary} />
                <Text style={styles.actionText}>{t('common.save', 'Save')}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleBack}
              disabled={saving}
            >
              <View style={styles.actionContent}>
                <CancelIcon color={colors.onPrimary} />
                <Text style={styles.actionText}>{t('common.cancel', 'Cancel')}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {showDatePicker && (
        <DateTimePicker
          value={preferredDateTime || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateSelected}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={preferredDateTime || new Date()}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeSelected}
        />
      )}
      <Modal
        transparent
        visible={successVisible}
        animationType="fade"
        onRequestClose={() => setSuccessVisible(false)}
      >
        <View style={styles.successOverlay}>
          <Pressable
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
            onPress={() => setSuccessVisible(false)}
          />
          <View style={styles.successCard}>
            <View style={styles.successIconWrap}>
              <SaveIcon color={colors.onPrimary} />
            </View>
            <Text style={styles.successTitle}>
              {t('maintenance.mobile.raise.successTitle', 'Request Created Successfully')}
            </Text>
            <Text style={styles.successText}>
              {t(
                'maintenance.mobile.raise.successMessage',
                'Your maintenance request has been created. You can assign a technician now or move to history and manage it later.',
              )}
            </Text>
            <TouchableOpacity
              style={styles.successActionPrimary}
              activeOpacity={0.85}
              onPress={() => {
                setSuccessVisible(false);
                navigation.navigate('TechnicianDetail', {
                  requestId: createdRequestId,
                  serviceCategoryId,
                  serviceLabel,
                });
              }}
            >
              <Text style={styles.successActionPrimaryText}>
                {t('maintenance.mobile.raise.selectTechnician', 'Select Technician')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.successActionSecondary}
              activeOpacity={0.85}
              onPress={() => {
                setSuccessVisible(false);
                navigation.navigate('MaintenanceHistory');
              }}
            >
              <Text style={styles.successActionSecondaryText}>
                {t('maintenance.mobile.raise.moveToHistory', 'Move to History')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
