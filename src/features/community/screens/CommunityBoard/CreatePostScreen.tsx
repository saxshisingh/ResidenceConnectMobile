import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ScreenWrapper from '../../../../components/ScreenWrapper';
import KeyboardSafeScrollView from '../../../../components/KeyboardSafeScrollView';
import { createStyles } from './CommunityBoard.styles';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { createCommunityPost, fetchPosts } from '../../state/communitySlice';
import { fetchLanguages } from '../../../language/services/languageService';
import { useI18n } from '../../../../i18n';
import { useAppTheme } from '../../../../theme/ThemeProvider';
import { hasMaxLength, trimValue } from '../../../../shared/validation/formValidation';

// ─── Icons ────────────────────────────────────────────────────────────────────

const ImageIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    <Path d="M8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" fill={color} />
    <Path d="M21 15l-5-5L5 21" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PublishIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// ─── Type options ─────────────────────────────────────────────────────────────

const POST_TYPES = [
  { value: 'Announcement', icon: '📢', color: '#7C3AED', bg: '#EDE9FE' },
  { value: 'Event',        icon: '🗓', color: '#0284C7', bg: '#E0F2FE' },
  { value: 'Maintenance',  icon: '🔧', color: '#D97706', bg: '#FEF3C7' },
] as const;

// ─── Field wrapper ────────────────────────────────────────────────────────────

const Field = ({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => {
  const {colors} = useAppTheme();

  return (
    <View style={localStyles.fieldWrapper}>
      <Text style={[localStyles.fieldLabel, {color: colors.textSecondary}]}>
        {label}
        {required && <Text style={{color: '#EF4444'}}> *</Text>}
      </Text>
      {children}
    </View>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function CreatePostScreen({ navigation }: any) {
  const { colors, resolvedTheme } = useAppTheme();
  const isDark = resolvedTheme === 'dark';
  const styles = React.useMemo(
    () => createStyles(colors, isDark),
    [colors, isDark],
  );
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const { language, t } = useI18n();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const contentWidth = Math.min(width - 32, 520);

  const [title, setTitle]       = useState('');
  const [content, setContent]   = useState('');
  const [image, setImage]       = useState<any>(null);
  const [postType, setPostType] = useState<'Announcement' | 'Event' | 'Maintenance'>('Announcement');
  const [submitting, setSubmitting] = useState(false);

  const handleMediaResult = (response: any) => {
    if (response?.didCancel) return;

    if (response?.errorCode) {
      Alert.alert(
        t('common.error', 'Error'),
        response.errorMessage || t('community.mobile.createPost.imageError', 'Unable to open image picker.'),
      );
      return;
    }

    if (response?.assets?.length) {
      setImage(response.assets[0]);
    }
  };

  const openCamera = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: t('community.mobile.createPost.cameraPermissionTitle', 'Camera Permission'),
            message: t('community.mobile.createPost.cameraPermissionMessage', 'App needs camera access to take a photo.'),
            buttonPositive: t('common.mobile.common.gotIt', 'Got it'),
          },
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            t('community.mobile.createPost.permissionDeniedTitle', 'Permission denied'),
            t('community.mobile.createPost.permissionDeniedMessage', 'Camera permission is required to take a photo.'),
          );
          return;
        }
      }

      const response = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: true,
        includeBase64: false,
        maxWidth: 1600,
        maxHeight: 1600,
      });

      console.log('Create post camera result:', response);
      handleMediaResult(response);
    } catch (error: any) {
      console.log('Create post camera error:', error);
      Alert.alert(
        t('community.mobile.createPost.cameraErrorTitle', 'Camera Error'),
        error?.message || t('community.mobile.createPost.cameraErrorMessage', 'Unable to open camera.'),
      );
    }
  };

  const openGallery = async () => {
    try {
      const response = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.7,
        selectionLimit: 1,
        includeBase64: false,
      });

      console.log('Create post gallery result:', response);
      handleMediaResult(response);
    } catch (error: any) {
      console.log('Create post gallery error:', error);
      Alert.alert(
        t('community.mobile.createPost.galleryErrorTitle', 'Gallery Error'),
        error?.message || t('community.mobile.createPost.galleryErrorMessage', 'Unable to open gallery.'),
      );
    }
  };

  const pickImage = () => {
    Alert.alert(
      t('community.mobile.createPost.addPhotoTitle', 'Add Photo'),
      t('community.mobile.createPost.addPhotoMessage', 'Choose how to attach the photo.'),
      [
        { text: t('community.mobile.createPost.camera', 'Camera'), onPress: () => { openCamera(); } },
        { text: t('community.mobile.createPost.gallery', 'Gallery'), onPress: () => { openGallery(); } },
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
      ],
    );
  };

  const handleSubmit = async () => {
    const cleanTitle   = trimValue(title);
    const cleanContent = trimValue(content);

    if (!user?.data?.userId) {
      Alert.alert(t('common.error', 'Error'), t('community.mobile.createPost.userMissing', 'User information is missing'));
      return;
    }
    if (!cleanTitle || !cleanContent) {
      Alert.alert(t('community.mobile.createPost.validationTitle', 'Validation'), t('community.mobile.createPost.titleContentRequired', 'Title and content are required'));
      return;
    }
    if (!hasMaxLength(cleanTitle, 120) || !hasMaxLength(cleanContent, 2000)) {
      Alert.alert(t('community.mobile.createPost.validationTitle', 'Validation'), t('community.mobile.createPost.contentTooLong', 'Title or content is too long'));
      return;
    }

    let languageId = user?.data?.languageId || user?.data?.preferredLanguageId || '';
    if (!languageId) languageId = (await AsyncStorage.getItem('selectedLanguageId')) || '';
    if (!languageId) {
      try {
        const languages = await fetchLanguages();
        const matched = languages.find(l => String(l.languageCode || '').toLowerCase() === String(language || '').toLowerCase());
        languageId = matched?.languageId || '';
      } catch {}
    }
    if (!languageId) {
      Alert.alert(t('community.mobile.createPost.validationTitle', 'Validation'), t('community.mobile.createPost.languageRequired', 'LanguageId is required. Please select language first.'));
      return;
    }

    const blockIds: string[] = Array.isArray(user?.data?.blockIds)
      ? user.data.blockIds.filter(Boolean)
      : user?.data?.blockId ? [user.data.blockId] : [];

    if (blockIds.length === 0) {
      Alert.alert(t('community.mobile.createPost.validationTitle', 'Validation'), t('community.mobile.createPost.blockIdsRequired', 'BlockIds are required'));
      return;
    }

    const formData = new FormData();
    formData.append('PostType', postType);
    formData.append('Title', cleanTitle);
    formData.append('Content', cleanContent);
    formData.append('LanguageId', languageId);
    formData.append('Visibility', 'Block');
    formData.append('CreatedBy', user.data.userId);
    formData.append('CreatedByRole', user.data.roleName || user.data.role || '');
    blockIds.forEach((id: string) => formData.append('BlockIds', id));
    formData.append('PublishAt', new Date().toISOString());
    formData.append('ExpiryAt', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());
    if (image) {
      formData.append('AttachmentFile', { uri: image.uri, type: image.type || 'image/png', name: image.fileName || 'post.png' } as any);
    }

    try {
      setSubmitting(true);
      await dispatch(createCommunityPost(formData)).unwrap();
      await dispatch(fetchPosts());
      Alert.alert(t('common.success', 'Success'), t('community.mobile.createPost.success', 'Post created successfully'));
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(t('common.error', 'Error'), error?.message || t('community.mobile.createPost.error', 'Failed to create post'));
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTypeMeta = POST_TYPES.find(p => p.value === postType);

  return (
    <ScreenWrapper
      title={t('community.mobile.createPost.title', 'Create Post')}
      onBackPress={() => navigation.goBack()}
    >
      <KeyboardSafeScrollView
        bottomOffset={140}
        contentContainerStyle={[
          styles.scrollContent,
          {
            width: contentWidth,
            alignSelf: 'center',
            paddingBottom: Math.max(insets.bottom, 24) + 72,
          },
        ]}>
        {/* ── Type selector ── */}
        <View style={localStyles.typeSection}>
          <Text style={[localStyles.typeSectionLabel, { color: colors.textSecondary }]}>
            {t('community.mobile.createPost.postType', 'Post Type')}
          </Text>
          <View style={localStyles.typeGrid}>
            {POST_TYPES.map(opt => {
              const active = postType === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    localStyles.typeCard,
                    active && { backgroundColor: opt.bg, borderColor: opt.color, borderWidth: 1.5 },
                    !active && [localStyles.typeCardInactive, { backgroundColor: colors.surface, borderColor: colors.border }],
                  ]}
                  onPress={() => setPostType(opt.value)}
                  activeOpacity={0.8}
                >
                  <Text style={localStyles.typeCardIcon}>{opt.icon}</Text>
                  <Text
                    style={[
                      localStyles.typeCardText,
                      { color: active ? opt.color : colors.textPrimary },
                      active && { fontWeight: '800' },
                    ]}>
                    {opt.value === 'Announcement'
                      ? t('community.mobile.createPost.typeAnnouncement', 'Announcement')
                      : opt.value === 'Event'
                        ? t('community.mobile.createPost.typeEvent', 'Event')
                        : t('community.mobile.createPost.typeMaintenance', 'Maintenance')}
                  </Text>
                  {active && (
                    <View style={[localStyles.typeCardCheck, { backgroundColor: opt.color }]}>
                      <Text style={localStyles.typeCardCheckMark}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Form card ── */}
        <View style={styles.card}>

          <Field label={t('community.mobile.createPost.postTitle', 'Title')} required>
            <TextInput
              placeholder={t('community.mobile.createPost.postTitlePlaceholder', 'Give your post a clear title…')}
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              maxLength={120}
            />
            <Text style={[localStyles.charCount, { color: colors.textMuted }]}>{title.length}/120</Text>
          </Field>

          <Field label={t('community.mobile.createPost.content', 'Content')} required>
            <TextInput
              placeholder={t('community.mobile.createPost.contentPlaceholder', 'Share details with your community…')}
              placeholderTextColor={colors.textMuted}
              style={[styles.input, styles.textArea]}
              multiline
              value={content}
              onChangeText={setContent}
              maxLength={2000}
            />
            <Text style={[localStyles.charCount, { color: colors.textMuted }]}>{content.length}/2000</Text>
          </Field>

          <Field label={t('community.mobile.createPost.uploadImageOptional', 'Photo (optional)')}>
            <TouchableOpacity style={styles.uploadBox} onPress={pickImage} activeOpacity={0.8}>
              <View style={localStyles.uploadInner}>
                <ImageIcon color={image ? '#16A34A' : '#94A3B8'} />
                <Text
                  style={[
                    styles.uploadText,
                    { color: image ? '#16A34A' : colors.textSecondary },
                    image && localStyles.uploadTextDone,
                  ]}>
                  {image
                    ? `✓  ${image.fileName || t('community.mobile.createPost.photoSelected', 'Photo selected')}`
                    : t('community.mobile.createPost.chooseImage', 'Tap to choose a photo')}
                </Text>
              </View>
            </TouchableOpacity>
          </Field>
        </View>

        {/* ── Buttons ── */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}
            disabled={submitting}
          >
            <Text style={styles.cancelText}>{t('common.cancel', 'Cancel')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.postBtn, submitting && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <Text style={styles.postText1}>
                {t('community.mobile.createPost.posting', 'Posting...')}
              </Text>
            ) : (
              <View style={localStyles.publishButtonContent}>
                <Text style={styles.postText1}>
                  {t('community.mobile.createPost.postButton', 'Publish Post')}
                </Text>
                <PublishIcon />
              </View>
            )}
          </TouchableOpacity>
        </View>
        <View style={{ height: Math.max(insets.bottom, 20) + 24 }} />
      </KeyboardSafeScrollView>
    </ScreenWrapper>
  );
}

// ─── Local Styles ─────────────────────────────────────────────────────────────

const localStyles = StyleSheet.create({
  fieldWrapper: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  charCount: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    textAlign: 'right',
    marginTop: 5,
  },

  // Type selector
  typeSection: {
    marginTop: 12,
    marginBottom: 4,
  },
  typeSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  typeCard: {
    minWidth: 96,
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 14,
    position: 'relative',
  },
  typeCardInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typeCardIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  typeCardText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  typeCardCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeCardCheckMark: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  // Upload
  uploadInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    flexWrap: 'nowrap',
  },
  uploadTextDone: {
    color: '#16A34A',
    fontWeight: '700',
    flex: 1,
    flexShrink: 1,
  },
  publishButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
