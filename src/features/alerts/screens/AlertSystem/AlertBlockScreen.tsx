import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  PermissionsAndroid,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Svg, { Path } from 'react-native-svg';

import { useAppSelector } from '../../../../redux/hooks';
import { createSOSAlert } from '../../services/alertService';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import KeyboardSafeScrollView from '../../../../components/KeyboardSafeScrollView';
import ThemedLoader from '../../../../components/ThemedLoader';
import { useI18n } from '../../../../i18n';
import { useAppTheme } from '../../../../theme/ThemeProvider';
import { hasMaxLength, hasMinLength, trimValue } from '../../../../shared/validation/formValidation';

// ─── Icons ────────────────────────────────────────────────────────────────────

const CameraIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 17a4 4 0 100-8 4 4 0 000 8z" stroke={color} strokeWidth={2} />
  </Svg>
);

const SendIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 2L11 13"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 2L15 22L11 13L2 9L22 2Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CloseIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6l12 12"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

const BuildingIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 21h18M5 21V7l7-4 7 4v14"
      stroke={color}
      strokeWidth={1.9}
      strokeLinejoin="round"
    />
  </Svg>
);

const HomeIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 10L12 3l9 7v10H3V10z"
      stroke={color}
      strokeWidth={1.9}
      strokeLinejoin="round"
    />
  </Svg>
);

// ─── Field wrapper ────────────────────────────────────────────────────────────

const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <View style={fieldStyles.wrapper}>
    <Text style={fieldStyles.label}>
      {label}
      {required && <Text style={fieldStyles.required}> *</Text>}
    </Text>
    {children}
  </View>
);

const fieldStyles = StyleSheet.create({
  wrapper: { marginBottom: 18 },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  required: { color: '#DC2626' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AlertBlockScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const user = useAppSelector((state: any) => state.auth.user);
  const { t } = useI18n();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 32, 520);
  const inactiveSelectorColor = colors.textSecondary;

  const initialAlertType = route.params?.alertType || 'block';
  const [alertType, setAlertType]   = useState<'block' | 'building'>(initialAlertType);
  const isEntireBuilding = alertType === 'building';

  const [alertTitle, setAlertTitle]   = useState(t('alert.mobile.block.defaultAlertTitle', 'Fire Emergency'));
  const [description, setDescription] = useState('');
  const [attachment, setAttachment]   = useState<any>(null);
  const [urgencyLevel, setUrgencyLevel] = useState<'High' | 'Medium' | 'Low'>('High');
  const [loading, setLoading]         = useState(false);

  const urgencyOptions = [
    { value: 'High',   label: t('alert.mobile.common.urgent', 'Urgent'), color: '#DC2626', bg: '#FEF2F2' },
    { value: 'Medium', label: t('alert.mobile.common.important', 'Important'), color: '#D97706', bg: '#FFFBEB' },
    { value: 'Low',    label: t('alert.mobile.common.regular', 'Regular'), color: '#2563EB', bg: '#EFF6FF' },
  ];

  // ─── Image picker ────────────────────────────────────────────────────────────

  const handleMediaResult = (result: any) => {
    if (result?.didCancel) return;

    if (result?.errorCode) {
      Alert.alert(
        t('alert.mobile.block.cameraErrorTitle', 'Camera Error'),
        result.errorMessage || t('alert.mobile.block.cameraErrorMessage', 'Unable to open camera.'),
      );
      return;
    }

    if (result?.assets?.length) {
      setAttachment(result.assets[0]);
    }
  };

  const openCamera = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: t('alert.mobile.block.cameraPermissionTitle', 'Camera Permission'),
            message: t('alert.mobile.block.cameraPermissionMessage', 'App needs camera access to take an alert photo.'),
            buttonPositive: t('common.mobile.common.gotIt', 'Got it'),
          },
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            t('alert.mobile.block.permissionDeniedTitle', 'Permission denied'),
            t('alert.mobile.block.permissionDeniedMessage', 'Camera permission is required to take a photo.'),
          );
          return;
        }
      }

      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: true,
        includeBase64: false,
        maxWidth: 1600,
        maxHeight: 1600,
      });

      console.log('Alert camera result:', result);
      handleMediaResult(result);
    } catch (error: any) {
      console.log('Alert camera error:', error);
      Alert.alert(
        t('alert.mobile.block.cameraErrorTitle', 'Camera Error'),
        error?.message || t('alert.mobile.block.cameraErrorMessage', 'Unable to open camera.'),
      );
    }
  };

  const openGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
        includeBase64: false,
      });

      console.log('Alert gallery result:', result);
      handleMediaResult(result);
    } catch (error: any) {
      console.log('Alert gallery error:', error);
      Alert.alert(
        t('alert.mobile.block.galleryErrorTitle', 'Gallery Error'),
        error?.message || t('alert.mobile.block.galleryErrorMessage', 'Unable to open gallery.'),
      );
    }
  };

  const handlePickImage = () => {
    Alert.alert(t('alert.mobile.block.addPhotoTitle', 'Add Photo'), t('alert.mobile.block.addPhotoMessage', 'Choose how to attach the photo.'), [
      { text: t('alert.mobile.block.camera', 'Camera'), onPress: () => { openCamera(); } },
      { text: t('alert.mobile.block.gallery', 'Gallery'), onPress: () => { openGallery(); } },
      { text: t('common.cancel', 'Cancel'), style: 'cancel' },
    ]);
  };

  // ─── Submit ──────────────────────────────────────────────────────────────────

  const handleProceed = async () => {
    try {
      const cleanTitle = trimValue(alertTitle);
      const cleanDesc  = trimValue(description);

      if (!user?.data) {
        Alert.alert(t('common.error', 'Error'), t('alert.mobile.block.userNotFound', 'User information not found'));
        return;
      }
      if (!cleanTitle || !cleanDesc) {
        Alert.alert(t('common.error', 'Error'), t('common.form.allRequiredMessage', 'Please fill all required fields correctly!'));
        return;
      }
      if (!hasMinLength(cleanTitle, 3) || !hasMinLength(cleanDesc, 10)) {
        Alert.alert(t('community.mobile.createPost.validationTitle', 'Validation'), t('alert.mobile.block.descriptionTooShort', 'Please enter a clear alert title and description'));
        return;
      }
      if (!hasMaxLength(cleanTitle, 120) || !hasMaxLength(cleanDesc, 1000)) {
        Alert.alert(t('community.mobile.createPost.validationTitle', 'Validation'), t('alert.mobile.block.descriptionTooLong', 'Alert title or description is too long'));
        return;
      }

      setLoading(true);

      await createSOSAlert({
        residentId: user.data.residentId,
        userId: user.data.userId,
        apartmentId: user.data.apartmentId,
        blockId: user.data.blockId,
        location: `${user.data.blockName}, ${t('alert.mobile.block.floor', 'Floor')} ${user.data.floorNumber}, ${t('alert.mobile.block.apartmentShort', 'Apt')} ${user.data.apartmentUnit}`,
        notes: cleanDesc,
        title: cleanTitle,
        message: cleanDesc,
        urgencyLevel,
        allBlocks: isEntireBuilding,
        blockIds: isEntireBuilding ? [] : [user.data.blockId],
        attachment: attachment ? { uri: attachment.uri, type: attachment.type || 'image/jpeg', name: attachment.fileName || 'alert_image.jpg' } : undefined,
      });

      Alert.alert(
        t('alert.mobile.block.successTitle', 'Success'),
        isEntireBuilding
          ? t('alert.mobile.block.successBuilding', 'Alert sent successfully to entire building')
          : t('alert.mobile.block.successBlock', 'Alert sent successfully to your block'),
        [{ text: t('common.mobile.common.gotIt', 'Got it'), onPress: () => navigation.goBack() }],
      );
    } catch (error: any) {
      Alert.alert(t('common.error', 'Error'), error.message || t('alert.add.errorMessage', 'Failed to send alert notification.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper title={t('alert.mobile.block.createTitle', 'Create Alert')} onBackPress={() => navigation.goBack()}>
      <KeyboardSafeScrollView bottomOffset={96} contentContainerStyle={styles.scroll}>
        {/* ── Top accent ── */}
        <View style={[styles.topAccent, { width: contentWidth, alignSelf: 'center' }]}>
          <Text style={styles.topAccentText}>⚠️  {t('alert.mobile.block.topAccentText', 'Emergency Alert')}</Text>
          <Text style={styles.topAccentSub}>
            {t('alert.mobile.block.topAccentSub', 'This will immediately notify all residents in the selected area.')}
          </Text>
        </View>

        {/* ── Form card ── */}
        <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border, width: contentWidth, alignSelf: 'center' }]}>

          {/* Send To */}
          <Field label={t('alert.mobile.block.sendTo', 'Send To')} required>
            <View style={styles.segmentedRow}>
              {[
                { value: 'block', label: t('alert.mobile.system.alertMyBlock', 'My Block') },
                { value: 'building', label: t('alert.mobile.system.alertEntireBuilding', 'Entire Building') },
              ].map(opt => {
                const active = alertType === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.segBtn,
                      active && styles.segBtnActive,
                      !active && styles.segBtnInactive,
                    ]}
                    onPress={() => setAlertType(opt.value as any)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.segBtnInner}>
                      {opt.value === 'block' ? (
                        <HomeIcon color={active ? '#FFFFFF' : inactiveSelectorColor} />
                      ) : (
                        <BuildingIcon color={active ? '#FFFFFF' : inactiveSelectorColor} />
                      )}
                      <Text style={[styles.segBtnText, active && styles.segBtnTextActive, !active && styles.segBtnTextInactive]}>
                        {opt.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Field>

          {/* Alert Title */}
          <Field label={t('alert.mobile.block.alertType', 'Alert Type')} required>
            <TextInput
              style={styles.input}
              value={alertTitle}
              onChangeText={setAlertTitle}
              placeholder={t('alert.mobile.block.alertTypePlaceholder', 'e.g., Fire Emergency, Medical Emergency')}
              placeholderTextColor={colors.textMuted}
            />
          </Field>

          {/* Description */}
          <Field label={t('alert.mobile.block.description', 'Description')} required>
            <TextInput
              style={styles.textArea}
              value={description}
              onChangeText={setDescription}
              placeholder={t('alert.mobile.block.descriptionPlaceholder', 'Describe the emergency situation clearly...')}
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{description.length}/1000</Text>
          </Field>

          {/* Urgency */}
          <Field label={t('alert.mobile.block.urgencyLevel', 'Urgency Level')}>
            <View style={styles.urgencyRow}>
              {urgencyOptions.map(opt => {
                const active = urgencyLevel === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.urgencyBtn,
                      { borderColor: opt.color, backgroundColor: active ? opt.color : colors.surface },
                    ]}
                    onPress={() => setUrgencyLevel(opt.value as any)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.urgencyBtnText, { color: active ? '#FFFFFF' : opt.color }]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Field>

          {/* Your Location (read-only) */}
          <Field label={t('alert.mobile.block.yourLocation', 'Your Location')}>
            <View style={[styles.readonlyBox, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
              <Text style={styles.readonlyIcon}>📍</Text>
              <Text style={styles.readonlyText}>
                {user?.data?.blockName},  {t('alert.mobile.block.floor', 'Floor')} {user?.data?.floorNumber},  {t('alert.mobile.block.apartmentShort', 'Apt')} {user?.data?.apartmentUnit}
              </Text>
            </View>
          </Field>

          {/* Attachment */}
          <Field label={t('alert.mobile.block.addPhoto', 'Add Photo (Optional)')}>
            <TouchableOpacity style={[styles.uploadBox, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]} onPress={handlePickImage} activeOpacity={0.8}>
              <CameraIcon color={attachment ? '#16A34A' : '#94A3B8'} />
              <Text style={[styles.uploadText, attachment && styles.uploadTextDone]} numberOfLines={2} ellipsizeMode="tail">
                {attachment
                  ? `✓  ${attachment.fileName || t('alert.mobile.block.photoSelected', 'Photo selected')}`
                  : t('alert.mobile.block.tapToUpload', 'Tap to upload a photo')}
              </Text>
            </TouchableOpacity>
          </Field>
        </View>

        {/* ── Buttons ── */}
        <View style={[styles.buttonRow, { width: contentWidth, alignSelf: 'center' }]}>
          <TouchableOpacity
            style={[styles.cancelBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelBtnText}>{t('common.cancel', 'Cancel')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleProceed}
            disabled={loading}
          >
            {loading ? (
              <ThemedLoader tone="onPrimary" />
            ) : (
              <View style={styles.submitBtnContent}>
                <Text style={styles.submitBtnText}>{t('alert.mobile.block.sendAlert', 'Send Alert')}</Text>
                <SendIcon color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.bottomSpacer} />
      </KeyboardSafeScrollView>
    </ScreenWrapper>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors']) => StyleSheet.create({
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 88,
  },

  // Top accent banner
  topAccent: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  topAccentText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  topAccentSub: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
    lineHeight: 17,
  },

  // Form card
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    shadowColor: colors.overlay,
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },

  // Segmented control (Send To)
  segmentedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  segBtn: {
    flexGrow: 1,
    flexBasis: 150,
    paddingVertical: 13,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  segBtnInactive: {
    backgroundColor: colors.surface,
  },
  segBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  segBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    flexShrink: 1,
    textAlign: 'center',
  },
  segBtnTextActive: {
    color: '#FFFFFF',
  },
  segBtnTextInactive: {
    color: colors.textSecondary,
  },

  // Text inputs
  input: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  textArea: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: colors.textPrimary,
    minHeight: 110,
    fontWeight: '500',
  },
  charCount: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
    textAlign: 'right',
    marginTop: 5,
  },

  // Urgency
  urgencyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  urgencyBtn: {
    flexGrow: 1,
    flexBasis: 110,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  urgencyBtnText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  // Read-only location
  readonlyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  readonlyIcon: { fontSize: 16 },
  readonlyText: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },

  // Upload
  uploadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderStyle: 'dashed',
  },
  uploadText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    lineHeight: 18,
  },
  uploadTextDone: {
    color: '#16A34A',
  },

  // Buttons
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  bottomSpacer: {
    height: 48,
  },
  cancelBtn: {
    flexGrow: 1,
    flexBasis: 120,
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  submitBtn: {
    flexGrow: 2,
    flexBasis: 180,
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  submitBtnDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  submitBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
