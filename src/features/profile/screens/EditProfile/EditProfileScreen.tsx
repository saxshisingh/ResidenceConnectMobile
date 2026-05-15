/* eslint-disable no-catch-shadow */
/* eslint-disable @typescript-eslint/no-shadow */
// EditProfileScreen.tsx — Elegantly Redesigned
import React, { useMemo, useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Image, Alert, Platform, PermissionsAndroid, useWindowDimensions, Switch,
} from 'react-native';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Svg, { Path } from 'react-native-svg';

import { createStyles } from './EditProfileScreen.styles';
import CalendarIcon from '../../../../assets/Icons/calendar-due.svg';

import { editProfile, fetchProfile, resetEditProfileState } from '../../state/editProfileSlice';
import { useAppDispatch, useAppSelector }      from '../../../../redux/hooks';
import ScreenWrapper  from '../../../../components/ScreenWrapper';
import KeyboardSafeScrollView from '../../../../components/KeyboardSafeScrollView';
import ThemedLoader   from '../../../../components/ThemedLoader';
import { useAppTheme } from '../../../../theme/ThemeProvider';
import { useI18n }    from '../../../../i18n';
import { API_BASE_URL } from '../../../../config/api';
import { callAuthMeAndLog, updateAuthUserProfile } from '../../../auth/state/authSlice';
import {
  hasMaxLength, hasMinLength, isEmail,
  isPhoneNumber, normalizeEmail, sanitizeAlgerianPhoneInput, trimValue,
} from '../../../../shared/validation/formValidation';

// ── small inline icons ────────────────────────
const SaveIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v9a2 2 0 01-2 2z" stroke="#fff" strokeWidth={2} strokeLinecap="round"/>
    <Path d="M8 12l3 3 5-5" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);
const CameraIcon = () => (
  <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
    <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" fill="#fff"/>
    <Path d="M12 17a4 4 0 100-8 4 4 0 000 8z" fill="#E87722"/>
  </Svg>
);

// ─────────────────────────────────────────────
export default function EditProfileScreen({ navigation }: any) {
  const [profileImage,          setProfileImage]          = useState<Asset | null>(null);
  const [profileImageLoadFailed, setProfileImageLoadFailed] = useState(false);
  const [firstName,    setFirstName]    = useState('');
  const [lastName,     setLastName]     = useState('');
  const [email,        setEmail]        = useState('');
  const [birthDate,    setBirthDate]    = useState('');
  const [phoneNumber,  setPhoneNumber]  = useState('');
  const [petOwnership, setPetOwnership] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const MAX_PROFILE_PHOTO_BYTES = 900 * 1024;

  const dispatch = useAppDispatch();
  const { colors } = useAppTheme();
  const { language, t } = useI18n();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 32, 520);
  const profileCopy = useMemo(() => {
    if (language === 'ar') {
      return {
        birthDate: 'تاريخ الميلاد',
        phoneNumber: 'رقم الهاتف',
        petOwnership: 'امتلاك حيوان أليف',
      };
    }

    if (language === 'fr') {
      return {
        birthDate: 'Date de naissance',
        phoneNumber: 'Numero de mobile',
        petOwnership: 'Animal de compagnie',
      };
    }

    return {
      birthDate: 'Birth Date',
      phoneNumber: 'Mobile Number',
      petOwnership: 'Pet Ownership',
    };
  }, [language]);
  const validationCopy = useMemo(() => {
    if (language === 'ar') {
      return {
        firstNameRequired: 'يرجى إدخال الاسم الأول',
        firstNameInvalid: 'يجب أن يكون الاسم الأول بين 2 و40 حرفًا',
        lastNameRequired: 'يرجى إدخال اسم العائلة',
        lastNameInvalid: 'يجب أن يكون اسم العائلة بين 2 و40 حرفًا',
        emailRequired: 'يرجى إدخال البريد الإلكتروني',
        emailInvalid: 'يرجى إدخال بريد إلكتروني صحيح',
        phoneRequired: 'يرجى إدخال رقم الهاتف',
        phoneInvalid: 'أدخل رقم هاتف صحيحًا',
      };
    }

    if (language === 'fr') {
      return {
        firstNameRequired: 'Veuillez saisir le prenom',
        firstNameInvalid: 'Le prenom doit contenir entre 2 et 40 caracteres',
        lastNameRequired: 'Veuillez saisir le nom',
        lastNameInvalid: 'Le nom doit contenir entre 2 et 40 caracteres',
        emailRequired: 'Veuillez saisir votre adresse e-mail',
        emailInvalid: 'Veuillez saisir une adresse e-mail valide',
        phoneRequired: 'Veuillez saisir le numero de telephone',
        phoneInvalid: 'Saisissez un numero de mobile algerien valide',
      };
    }

    return {
      firstNameRequired: 'Please enter your first name',
      firstNameInvalid: 'First name must be between 2 and 40 characters',
      lastNameRequired: 'Please enter your last name',
      lastNameInvalid: 'Last name must be between 2 and 40 characters',
      emailRequired: 'Please enter your email address',
      emailInvalid: 'Please enter a valid email address',
      phoneRequired: 'Please enter your phone number',
      phoneInvalid: 'Enter a valid Algerian phone number (local or international)',
    };
  }, [language]);
  const sectionLabelStyle = useMemo(
    () => ({
      fontSize: 11,
      fontWeight: '700' as const,
      letterSpacing: 1.1,
      color: colors.textMuted,
      marginBottom: 8,
      marginLeft: 2,
    }),
    [colors.textMuted],
  );
  const sectionCardStyle = useMemo(
    () => ({
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 16,
      borderWidth: 0.5,
      borderColor: colors.border,
      gap: 12,
      shadowColor: colors.overlay,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 1,
    }),
    [colors.border, colors.overlay, colors.surface],
  );
  const fieldLabelStyle = useMemo(
    () => ({
      fontSize: 12,
      fontWeight: '600' as const,
      color: colors.textSecondary,
      marginBottom: 6,
    }),
    [colors.textSecondary],
  );

  const user = useAppSelector(state => state.auth.user);
  const { profile, loading, success, error } = useAppSelector(state => state.editProfile);
  const residentId = user?.data?.residentId;

  const getInitials = (f?: string, l?: string) =>
    `${f?.[0] ?? ''}${l?.[0] ?? ''}`.toUpperCase() || 'U';

  const normalizeImageUrl = (path?: string) => {
    const p = trimValue(String(path || ''));
    if (!p) return '';
    if (['null','undefined','n/a','na'].includes(p.toLowerCase())) return '';
    if (p.startsWith('http')) return p;
    return `${API_BASE_URL}/${p.replace(/^\/+/, '')}`;
  };

  const currentProfilePhoto = normalizeImageUrl(
    profile?.profilePhoto || profile?.photo ||
    user?.data?.profilePhoto || user?.data?.photo,
  );
  const shouldShowProfilePhoto =
    Boolean(profileImage?.uri) || Boolean(currentProfilePhoto && !profileImageLoadFailed);

  useEffect(() => {
    if (residentId) {
      dispatch(fetchProfile(residentId));
    }
  }, [dispatch, residentId]);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName);
      setLastName(profile.lastName);
      setEmail(profile.email);
      setBirthDate(profile.dateOfBirth?.split('T')[0]);
      setPhoneNumber(profile.mobileNumber || profile.mobile || '');
      setPetOwnership(Boolean(profile.petOwnership));
    }
  }, [profile]);

  const cleanFirstName = trimValue(firstName);
  const cleanLastName = trimValue(lastName);
  const cleanEmail = normalizeEmail(email);
  const cleanPhoneNumber = trimValue(phoneNumber);

  const fieldErrors = {
    firstName:
      (touched.firstName || submitAttempted)
        ? (!cleanFirstName
            ? validationCopy.firstNameRequired
            : !hasMinLength(cleanFirstName,2) || !hasMaxLength(cleanFirstName,40)
              ? validationCopy.firstNameInvalid
            : '')
        : '',
    lastName:
      (touched.lastName || submitAttempted)
        ? (!cleanLastName
            ? validationCopy.lastNameRequired
            : !hasMinLength(cleanLastName,2) || !hasMaxLength(cleanLastName,40)
              ? validationCopy.lastNameInvalid
            : '')
        : '',
    email:
      (touched.email || submitAttempted)
        ? (!cleanEmail
            ? validationCopy.emailRequired
            : !isEmail(cleanEmail)
              ? validationCopy.emailInvalid
              : '')
        : '',
    phoneNumber:
      (touched.phoneNumber || submitAttempted)
        ? (!cleanPhoneNumber
            ? validationCopy.phoneRequired
            : !isPhoneNumber(cleanPhoneNumber)
              ? validationCopy.phoneInvalid
            : '')
        : '',
  };

  const markTouched = (field: string) =>
    setTouched(prev => (prev[field] ? prev : { ...prev, [field]: true }));

  const handleImagePick = () => {
    Alert.alert(
      t('profile.mobile.photoTitle', 'Profile Photo'),
      t('profile.mobile.chooseOption', 'Choose an option'),
      [
        { text: t('profile.mobile.camera',  'Camera'),  onPress: openCamera },
        { text: t('profile.mobile.gallery', 'Gallery'), onPress: openGallery },
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
      ],
      { cancelable: true },
    );
  };

  const openCamera = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title:   t('profile.mobile.cameraPermission', 'Camera Permission'),
            message: t('profile.mobile.cameraPermissionMessage', 'App needs camera access to take profile photo'),
            buttonPositive: t('common.mobile.common.ok', 'OK'),
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(t('profile.mobile.permissionDenied','Permission denied'), t('profile.mobile.cameraPermissionRequired','Camera permission is required'));
          return;
        }
      }
      const result = await launchCamera({ mediaType:'photo', cameraType:'front', saveToPhotos:true, quality:0.6, maxWidth:1080, maxHeight:1080, includeBase64:false });
      if (result.assets?.length) {
        const sel = result.assets[0];
        if ((sel.fileSize ?? 0) > MAX_PROFILE_PHOTO_BYTES) {
          Alert.alert(t('profile.mobile.imageTooLarge','Image too large'), t('profile.mobile.imageTooLargeMessage','Please choose a photo smaller than 900 KB.'));
          return;
        }
        setProfileImage(sel);
        setProfileImageLoadFailed(false);
      }
    } catch (e) { console.log('Camera error:', e); }
  };

  const openGallery = async () => {
    const result = await launchImageLibrary({ mediaType:'photo', quality:0.6, maxWidth:1080, maxHeight:1080, selectionLimit:1, includeBase64:false });
    if (result.assets?.length) {
      const sel = result.assets[0];
      if ((sel.fileSize ?? 0) > MAX_PROFILE_PHOTO_BYTES) {
        Alert.alert(t('profile.mobile.imageTooLarge','Image too large'), t('profile.mobile.imageTooLargeMessage','Please choose a photo smaller than 900 KB.'));
        return;
      }
      setProfileImage(sel);
      setProfileImageLoadFailed(false);
    }
  };

  const handleSave = () => {
    setSubmitAttempted(true);
    const cf  = cleanFirstName;
    const cl  = cleanLastName;
    const ce  = cleanEmail;
    const cp  = cleanPhoneNumber;
    const hasBlockingFieldError =
      !cf ||
      !hasMinLength(cf, 2) ||
      !hasMaxLength(cf, 40) ||
      !cl ||
      !hasMinLength(cl, 2) ||
      !hasMaxLength(cl, 40) ||
      !ce ||
      !isEmail(ce) ||
      !cp ||
      !isPhoneNumber(cp);

    if (!profile) {
      Alert.alert(t('profile.mobile.checkProfileTitle','Check Profile'), t('profile.mobile.userNotReady','User profile data is not ready yet'));
      return;
    }
    if (hasBlockingFieldError) {
      return;
    }
    const editProfilePayload = {
      firstName: cf,
      lastName: cl,
      dateOfBirth: birthDate,
      petOwnership,
      mobileNumber: cp, email: ce,
      profilePhoto: profileImage ? {
        uri: Platform.OS === 'ios' ? profileImage.uri!.replace('file://','') : profileImage.uri!,
        name: profileImage.fileName || 'profile.jpg',
        type: profileImage.type || 'image/jpeg',
      } : undefined,
    };

    console.log('[EditProfileScreen] submit payload:', {
      ...editProfilePayload,
      hasProfilePhotoFile: Boolean(editProfilePayload.profilePhoto),
      profilePhoto: editProfilePayload.profilePhoto
        ? {
            name: editProfilePayload.profilePhoto.name,
            type: editProfilePayload.profilePhoto.type,
            hasUri: Boolean(editProfilePayload.profilePhoto.uri),
          }
        : undefined,
    });

    dispatch(resetEditProfileState());
    dispatch(editProfile(editProfilePayload));
  };

  useEffect(() => {
    if (success) {
      Alert.alert(t('common.success','Success'), t('profile.mobile.updateSuccess','Profile updated successfully'), [{
        text: t('common.mobile.common.ok','OK'),
        onPress: async () => {
          await dispatch(callAuthMeAndLog());
          dispatch(updateAuthUserProfile({
            firstName: cleanFirstName,
            lastName: cleanLastName,
            email: cleanEmail,
            mobile: cleanPhoneNumber,
            mobileNumber: cleanPhoneNumber,
          }));
          if (residentId) {
            await dispatch(fetchProfile(residentId));
          }
          dispatch(resetEditProfileState());
          navigation.goBack();
        },
      }]);
    }
    if (error) {
      Alert.alert(t('profile.mobile.saveIssueTitle','Please Check'), error, [{
        text: t('common.mobile.common.ok','OK'),
        onPress: () => dispatch(resetEditProfileState()),
      }]);
    }
  }, [success, error, dispatch, navigation, residentId, t]);

  useEffect(() => { dispatch(resetEditProfileState()); }, [dispatch]);

  return (
    <ScreenWrapper title={t('profile.mobile.editProfile','Edit Profile')} onBackPress={() => navigation.goBack()}>
      <View style={styles.container}>
        <KeyboardSafeScrollView contentContainerStyle={styles.scrollContent}>

          {/* ── AVATAR HERO ── */}
          <View style={[styles.avatarHero, { width: contentWidth, alignSelf: 'center' }]}>
            <View style={styles.avatarHeroCircle1} />
            <View style={styles.avatarHeroCircle2} />

            <View style={styles.avatarWrap}>
              {shouldShowProfilePhoto ? (
                <Image
                  source={{ uri: profileImage?.uri || currentProfilePhoto }}
                  style={styles.profilePicture}
                  onError={() => setProfileImageLoadFailed(true)}
                />
              ) : (
                <View style={styles.initialsContainer}>
                  <Text style={styles.profileFallbackText}>
                    {getInitials(firstName || user?.data?.firstName, lastName || user?.data?.lastName)}
                  </Text>
                </View>
              )}
              <TouchableOpacity style={styles.editIconButton} onPress={handleImagePick} activeOpacity={0.85}>
                <CameraIcon />
              </TouchableOpacity>
            </View>

            <Text style={styles.avatarHeroName}>{firstName || user?.data?.firstName} {lastName || user?.data?.lastName}</Text>
            <Text style={styles.avatarHeroSub}>{user?.data?.residenceName} · {user?.data?.apartmentUnit}</Text>
          </View>

          {/* ── FORM SECTIONS ── */}

          {/* Personal Info */}
          <SectionCard title={t('profile.mobile.personalInfoSection', 'PERSONAL INFO')} icon="👤" labelStyle={sectionLabelStyle} cardStyle={sectionCardStyle}>
            <FieldRow>
              <FieldBox label={t('profile.mobile.firstName','First Name')} flex labelStyle={fieldLabelStyle}>
                <TextInput style={[styles.input, fieldErrors.firstName ? styles.inputError : null]} value={firstName} onChangeText={value => { setFirstName(value); markTouched('firstName'); }} placeholderTextColor={colors.textMuted} />
                {fieldErrors.firstName ? <Text style={styles.errorText}>{fieldErrors.firstName}</Text> : null}
              </FieldBox>
              <FieldBox label={t('profile.mobile.lastName','Last Name')} flex labelStyle={fieldLabelStyle}>
                <TextInput style={[styles.input, fieldErrors.lastName ? styles.inputError : null]} value={lastName} onChangeText={value => { setLastName(value); markTouched('lastName'); }} placeholderTextColor={colors.textMuted} />
                {fieldErrors.lastName ? <Text style={styles.errorText}>{fieldErrors.lastName}</Text> : null}
              </FieldBox>
            </FieldRow>

            <FieldBox label={t('common.email','Email')} styles={styles} labelStyle={fieldLabelStyle}>
              <TextInput style={[styles.input, fieldErrors.email ? styles.inputError : null]} value={email} onChangeText={value => { setEmail(value); markTouched('email'); }} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={colors.textMuted} />
              {fieldErrors.email ? <Text style={styles.errorText}>{fieldErrors.email}</Text> : null}
            </FieldBox>

            <FieldBox label={t('profile.mobile.birthDate', profileCopy.birthDate)} styles={styles} labelStyle={fieldLabelStyle}>
              <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
                <Text style={[styles.dateInputText, !birthDate && { color: colors.textMuted }]}>
                  {birthDate || t('profile.mobile.birthDatePlaceholder','YYYY-MM-DD')}
                </Text>
                <CalendarIcon />
              </TouchableOpacity>
            </FieldBox>

            <FieldBox label={t('profile.mobile.phoneNumber', profileCopy.phoneNumber)} styles={styles} labelStyle={fieldLabelStyle}>
              <TextInput style={[styles.input, fieldErrors.phoneNumber ? styles.inputError : null]} value={phoneNumber} onChangeText={value => { setPhoneNumber(sanitizeAlgerianPhoneInput(value)); markTouched('phoneNumber'); }} keyboardType="phone-pad" placeholder="05XXXXXXXX or +213XXXXXXXXX" placeholderTextColor={colors.textMuted} />
              {fieldErrors.phoneNumber ? <Text style={styles.errorText}>{fieldErrors.phoneNumber}</Text> : null}
            </FieldBox>

            <FieldBox label={t('profile.mobile.pet', profileCopy.petOwnership)} styles={styles} labelStyle={fieldLabelStyle}>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>
                  {petOwnership ? t('common.values.yes', 'Yes') : t('common.values.no', 'No')}
                </Text>
                <Switch
                  value={petOwnership}
                  onValueChange={setPetOwnership}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#fff"
                />
              </View>
            </FieldBox>
          </SectionCard>

          {/* Save button */}
          <TouchableOpacity style={[styles.saveButton, { width: contentWidth, alignSelf: 'center' }]} onPress={handleSave} disabled={loading} activeOpacity={0.85}>
            {loading ? (
              <ThemedLoader tone="onPrimary" />
            ) : (
              <>
                <SaveIcon />
                <Text style={styles.saveButtonText}>{t('common.mobile.common.saveChanges','Save Changes')}</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </KeyboardSafeScrollView>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={birthDate ? new Date(birthDate) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date()}
          onChange={(_, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setBirthDate(selectedDate.toISOString().split('T')[0]);
          }}
        />
      )}
    </ScreenWrapper>
  );
}

// ── tiny layout helpers (no styles needed, purely structural) ─
const SectionCard = ({ title, icon, children, labelStyle, cardStyle }: { title: string; icon: string; children: React.ReactNode; labelStyle: any; cardStyle: any }) => (
  (() => {
    const { width } = useWindowDimensions();
    const contentWidth = Math.min(width - 32, 520);

    return (
      <View style={{ width: contentWidth, alignSelf: 'center', marginBottom: 14 }}>
        <Text style={labelStyle}>
          {icon}  {title}
        </Text>
        <View style={cardStyle}>
          {children}
        </View>
      </View>
    );
  })()
);

const FieldRow = ({ children }: { children: React.ReactNode }) => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>{children}</View>
);

const FieldBox = ({ label, children, flex, styles: _s, labelStyle }: { label: string; children: React.ReactNode; flex?: boolean; styles?: any; labelStyle: any }) => (
  <View style={flex ? { flexGrow: 1, flexBasis: 140, minWidth: 120 } : { width: '100%' }}>
    <Text style={labelStyle}>{label}</Text>
    {children}
  </View>
);
