// AddEditFamily.tsx Ã¢â‚¬â€ Elegantly Redesigned
import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Alert, Platform, useWindowDimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Asset } from 'react-native-image-picker';
import Svg, { Path } from 'react-native-svg';

import { createStyles }  from './AddEditFamily.styles';
import ScreenWrapper     from '../../../../components/ScreenWrapper';
import KeyboardSafeScrollView from '../../../../components/KeyboardSafeScrollView';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { createFamilyMember, updateFamilyMember } from '../../services/familyService';
import { fetchFamilyMembers } from '../../state/familySlice';
import { useAppTheme }   from '../../../../theme/ThemeProvider';
import { useI18n }       from '../../../../i18n';
import {
  hasMaxLength, hasMinLength, isEmail,
  isPhoneNumber, normalizeEmail, sanitizeAlgerianPhoneInput, trimValue,
} from '../../../../shared/validation/formValidation';

// Ã¢â€â‚¬Ã¢â€â‚¬ inline icons Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const SaveIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v9a2 2 0 01-2 2z" stroke="#fff" strokeWidth={2} strokeLinecap="round"/>
    <Path d="M8 12l3 3 5-5" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// Ã¢â€â‚¬Ã¢â€â‚¬ layout helpers Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const SectionCard = ({ title, icon, children, colors }: { title: string; icon: string; children: React.ReactNode; colors: any }) => (
  (() => {
    const { width } = useWindowDimensions();
    const contentWidth = Math.min(width - 32, 520);

    return (
      <View style={{ width: contentWidth, alignSelf: 'center', marginBottom: 14 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1.1, color: colors.textMuted, marginBottom: 8, marginLeft: 2 }}>
          {icon ? `${icon}  ${title}` : title}
        </Text>
        <View style={{
          backgroundColor: colors.surface, borderRadius: 18, padding: 16,
          borderWidth: 0.5, borderColor: colors.border, gap: 12,
          shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
        }}>
          {children}
        </View>
      </View>
    );
  })()
);

const FieldBox = ({ label, children, colors }: { label: string; children: React.ReactNode; colors: any }) => (
  <View style={{ gap: 6 }}>
    <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary }}>{label}</Text>
    {children}
  </View>
);

const FieldRow = ({ children }: { children: React.ReactNode }) => (
  <View style={{ flexDirection: 'row', gap: 10 }}>{children}</View>
);

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
export default function AddEditFamily({ navigation, route }: any) {
  const { colors } = useAppTheme();
  const { language, t }      = useI18n();
  const styles     = useMemo(() => createStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 32, 520);
  const { mode = 'add', familyData } = route.params || {};
  const isEdit = mode === 'edit';
  const isView = mode === 'view';
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: any) => state.auth.user);

  const [fullName,          setFullName]          = useState('');
  const [relation,          setRelation]          = useState('');
  const [gender,            setGender]            = useState('');
  const [mobileNumber,      setMobileNumber]      = useState('');
  const [email,             setEmail]             = useState('');
  const [status,            setStatus]            = useState('1');
  const [accessPermission,  setAccessPermission]  = useState('Complete');
  const [profileImage,      setProfileImage]      = useState<Asset | null>(null);
  const [touched,           setTouched]           = useState<Record<string, boolean>>({});
  const [submitAttempted,   setSubmitAttempted]   = useState(false);

  const genderOptions = useMemo(() => [
    t('familyMember.form.fields.gender.options.male',   'Male'),
    t('familyMember.form.fields.gender.options.female', 'Female'),
    t('familyMember.form.fields.gender.options.other',  'Other'),
  ], [t]);
  const validationCopy = useMemo(() => {
    if (language === 'ar') {
      return {
        mobileInvalid: 'أدخل رقم هاتف صحيحًا',
        emailInvalid: 'يرجى إدخال بريد إلكتروني صحيح',
      };
    }

    if (language === 'fr') {
      return {
        mobileInvalid: 'Saisissez un numero de mobile algerien valide',
        emailInvalid: 'Veuillez saisir une adresse e-mail valide',
      };
    }

    return {
      mobileInvalid: 'Enter a valid Algerian phone number (local or international)',
      emailInvalid: 'Please enter a valid email address',
    };
  }, [language]);

  useEffect(() => {
    if ((isEdit || isView) && familyData) {
      setFullName(familyData.fullName || familyData.name || '');
      setRelation(familyData.relation || familyData.relationship || '');
      setGender(familyData.gender || '');
      setMobileNumber(familyData.mobileNumber || familyData.phoneNumber || familyData.mobile || '');
      setEmail(familyData.email || '');
      setStatus(String(familyData.status ?? 1));
      setAccessPermission(familyData.accessPermission || 'Complete');
    }
  }, [isEdit, isView, familyData]);

  const cleanMobile = trimValue(mobileNumber);
  const cleanEmail = normalizeEmail(email);
  const fieldErrors = {
    mobile:
      (touched.mobile || submitAttempted) && cleanMobile && !isPhoneNumber(cleanMobile)
        ? validationCopy.mobileInvalid
        : '',
    email:
      (touched.email || submitAttempted) && cleanEmail && !isEmail(cleanEmail)
        ? validationCopy.emailInvalid
        : '',
  };

  const markTouched = (field: string) =>
    setTouched(prev => (prev[field] ? prev : { ...prev, [field]: true }));

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    const residentId = user?.data?.residentId;
    const actorId    = user?.data?.userId || residentId;
    const familyMemberId = familyData?.familyMemberId || familyData?.memberId || familyData?.id;

    if (!residentId || !actorId) {
      Alert.alert(t('common.error','Error'), t('family.mobile.residentMissing','Resident information is missing')); return;
    }

    const cleanName     = trimValue(fullName);
    const cleanRelation = trimValue(relation);
    const cleanMobile   = trimValue(mobileNumber);
    const cleanEmail    = normalizeEmail(email);

    if (!cleanName || !cleanRelation) {
      Alert.alert(t('common.error','Error'), t('family.mobile.validationNameRelation','Please provide full name and relation')); return;
    }
    if (!hasMinLength(cleanName,2)||!hasMaxLength(cleanName,80)) {
      Alert.alert(t('community.mobile.createPost.validationTitle','Validation'), t('family.mobile.validationFullNameLength','Full name must be between 2 and 80 characters')); return;
    }
    if (!hasMinLength(cleanRelation,2)||!hasMaxLength(cleanRelation,40)) {
      Alert.alert(t('community.mobile.createPost.validationTitle','Validation'), t('family.mobile.validationRelationLength','Relation must be between 2 and 40 characters')); return;
    }
    if (!gender) {
      Alert.alert(t('community.mobile.createPost.validationTitle','Validation'), t('familyMember.form.fields.gender.required','Gender is required')); return;
    }
    if (status !== '0' && status !== '1') {
      Alert.alert(t('community.mobile.createPost.validationTitle','Validation'), t('family.mobile.validationStatus','Please select valid status')); return;
    }
    if (cleanMobile && !isPhoneNumber(cleanMobile)) {
      Alert.alert(t('community.mobile.createPost.validationTitle','Validation'), t('family.mobile.validationMobile','Enter a valid Algerian phone number (local or international)')); return;
    }
    if (cleanEmail && !isEmail(cleanEmail)) {
      Alert.alert(t('community.mobile.createPost.validationTitle','Validation'), t('family.mobile.validationEmail','Please enter a valid email address')); return;
    }

    const photoPayload = profileImage ? {
      uri: Platform.OS === 'ios' ? profileImage.uri!.replace('file://','') : profileImage.uri!,
      name: profileImage.fileName || 'family-profile.jpg',
      type: profileImage.type || 'image/jpeg',
    } : null;

    try {
      if (isEdit) {
        if (!familyMemberId) {
          Alert.alert(t('common.error','Error'), t('family.mobile.familyMemberIdMissing','Family member id is missing')); return;
        }
        await updateFamilyMember(familyMemberId, {
          residentId, fullName: cleanName, relation: cleanRelation, gender,
          mobile: cleanMobile, email: cleanEmail, status: Number(status)||1,
          accessPermission, modifiedBy: actorId, profilePhotoFile: photoPayload,
        });
      } else {
        await createFamilyMember({
          residentId, fullName: cleanName, relation: cleanRelation, gender,
          mobile: cleanMobile, email: cleanEmail, status: Number(status)||1,
          accessPermission, modifiedBy: actorId, profilePhotoFile: photoPayload,
        });
      }
      await dispatch(fetchFamilyMembers(residentId));
      Alert.alert(t('common.success','Success'), t(isEdit ? 'familyMember.edit.successMessage' : 'familyMember.add.successMessage','Family member saved successfully'));
      navigation.goBack();
    } catch {
      Alert.alert(t('common.error','Error'), t(isEdit ? 'familyMember.edit.errorMessage' : 'familyMember.add.errorMessage','Failed to save family member'));
    }
  };

  // access permission chip colors
  const permChipColor = (opt: string) => {
    if (opt === 'Complete') return { bg: '#22C55E', text: '#fff' };
    if (opt === 'Partial')  return { bg: '#F59E0B', text: '#fff' };
    return                         { bg: '#6B7280', text: '#fff' };
  };

  const screenTitle = isView
    ? (language === 'ar' ? '\u062a\u0641\u0627\u0635\u064a\u0644 \u0641\u0631\u062f \u0627\u0644\u0639\u0627\u0626\u0644\u0629' : language === 'fr' ? 'Details du membre de la famille' : 'Family Member Details')
    : isEdit ? (language === 'ar' ? '\u062a\u0639\u062f\u064a\u0644 \u0641\u0631\u062f \u0627\u0644\u0639\u0627\u0626\u0644\u0629' : language === 'fr' ? 'Modifier le membre de la famille' : 'Edit Family Member')
    : (language === 'ar' ? '\u0625\u0636\u0627\u0641\u0629 \u0641\u0631\u062f \u0639\u0627\u0626\u0644\u0629' : language === 'fr' ? 'Ajouter un membre de la famille' : 'Add Family Member');
  const heroSubtitle = isView
    ? (language === 'ar' ? '\u0639\u0631\u0636 \u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0639\u0636\u0648' : language === 'fr' ? 'Voir les details du membre' : 'View member details')
    : isEdit ? (language === 'ar' ? '\u062d\u062f\u0651\u062b \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0639\u0636\u0648' : language === 'fr' ? 'Mettre a jour les informations du membre' : 'Update member information')
    : (language === 'ar' ? '\u0623\u0636\u0641 \u0641\u0631\u062f\u064b\u0627 \u062c\u062f\u064a\u062f\u064b\u0627 \u0645\u0646 \u0623\u0641\u0631\u0627\u062f \u0627\u0644\u0623\u0633\u0631\u0629' : language === 'fr' ? 'Ajouter un nouveau membre du foyer' : 'Add a new household member');
  const fullNameLabel = language === 'ar' ? '\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644' : language === 'fr' ? 'Nom complet' : t('family.mobile.fullName', 'Full Name');
  const relationLabel = language === 'ar' ? '\u0635\u0644\u0629 \u0627\u0644\u0642\u0631\u0627\u0628\u0629' : language === 'fr' ? 'Relation' : 'Relation';
  const genderLabel = language === 'ar' ? '\u0627\u0644\u062c\u0646\u0633' : language === 'fr' ? 'Genre' : 'Gender';
  const genderPlaceholder = language === 'ar' ? '\u0627\u062e\u062a\u0631 \u0627\u0644\u062c\u0646\u0633' : language === 'fr' ? 'Selectionner le genre' : 'Select Gender';
  const contactTitle = language === 'ar' ? '\u0627\u0644\u062a\u0648\u0627\u0635\u0644' : language === 'fr' ? 'CONTACT' : 'CONTACT';
  const personalInfoTitle = language === 'ar' ? '\u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0627\u0644\u0634\u062e\u0635\u064a\u0629' : language === 'fr' ? 'INFOS PERSONNELLES' : 'PERSONAL INFO';
  const mobileLabel = language === 'ar' ? '\u0631\u0642\u0645 \u0627\u0644\u062c\u0648\u0627\u0644' : language === 'fr' ? 'Numero de mobile' : 'Mobile Number';
  const statusAccessTitle = language === 'ar' ? '\u0627\u0644\u062d\u0627\u0644\u0629 \u0648\u0627\u0644\u0635\u0644\u0627\u062d\u064a\u0627\u062a' : language === 'fr' ? 'STATUT ET ACCES' : 'STATUS & ACCESS';
  const accessPermissionLabel = language === 'ar' ? '\u0635\u0644\u0627\u062d\u064a\u0629 \u0627\u0644\u062f\u062e\u0648\u0644' : language === 'fr' ? 'Permission acces' : 'Access Permission';
  const submitLabel = isEdit ? (language === 'ar' ? '\u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0639\u0636\u0648' : language === 'fr' ? 'Mettre a jour le membre' : 'Update Member') : (language === 'ar' ? '\u062d\u0641\u0638 \u0627\u0644\u0639\u0636\u0648' : language === 'fr' ? 'Enregistrer le membre' : 'Save Member');
  const relationPlaceholder = language === 'ar' ? '\u0627\u062e\u062a\u0631 \u0635\u0644\u0629 \u0627\u0644\u0642\u0631\u0627\u0628\u0629' : language === 'fr' ? 'Selectionner la relation' : 'Sister';
  const fullNamePlaceholder = language === 'ar' ? '\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644' : language === 'fr' ? 'Nom complet' : 'Emma Aryan';
  const mobilePlaceholder = language === 'ar' ? '05XXXXXXXX' : language === 'fr' ? '05XXXXXXXX ou +213XXXXXXXXX' : '05XXXXXXXX or +213XXXXXXXXX';
  const emailLabel = language === 'ar' ? '\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a' : language === 'fr' ? 'E-mail' : t('common.email', 'Email');
  // initials for hero avatar
  const initials = fullName
    ? fullName.trim().split(' ').filter(Boolean).map(w => w[0]).join('').slice(0,2).toUpperCase()
    : 'FM';

  return (
    <ScreenWrapper title={screenTitle} onBackPress={() => navigation.goBack()}>
      <View style={styles.container}>
        <KeyboardSafeScrollView contentContainerStyle={styles.scrollContent}>

          {/* Ã¢â€â‚¬Ã¢â€â‚¬ HERO Ã¢â€â‚¬Ã¢â€â‚¬ */}
          <View style={[styles.heroCard, { width: contentWidth, alignSelf: 'center' }]}>
            <View style={styles.heroCircle1} />
            <View style={styles.heroCircle2} />

            {/* avatar initials */}
            <View style={styles.heroAvatarWrap}>
              <View style={styles.heroAvatar}>
                <Text style={styles.heroAvatarText}>{initials}</Text>
              </View>
            </View>

            <View style={styles.heroTextRow}>
              <View>
                <Text style={styles.heroTitle}>{screenTitle}</Text>
                <Text style={styles.heroSub}>
                  {heroSubtitle}
                </Text>
              </View>
              {isView && (
                <View style={styles.viewChip}>
                  <Text style={styles.viewChipText}>
                    {language === 'ar' ? '\u0639\u0631\u0636' : language === 'fr' ? 'VOIR' : 'VIEW'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Ã¢â€â‚¬Ã¢â€â‚¬ PERSONAL INFO Ã¢â€â‚¬Ã¢â€â‚¬ */}
          <SectionCard
            title={personalInfoTitle}
            icon=""
            colors={colors}
          >
            <FieldRow>
              <View style={{ flex: 1 }}>
                <FieldBox label={fullNameLabel} colors={colors}>
                  <TextInput
                    style={[styles.input, isView && styles.inputView]}
                    value={fullName} onChangeText={setFullName}
                    placeholder={fullNamePlaceholder}
                    placeholderTextColor={colors.textMuted} editable={!isView}
                  />
                </FieldBox>
              </View>
              <View style={{ flex: 1 }}>
                <FieldBox label={relationLabel} colors={colors}>
                  <TextInput
                    style={[styles.input, isView && styles.inputView]}
                    value={relation} onChangeText={setRelation}
                    placeholder={relationPlaceholder}
                    placeholderTextColor={colors.textMuted} editable={!isView}
                  />
                </FieldBox>
              </View>
            </FieldRow>

            <FieldBox label={genderLabel} colors={colors}>
              <View style={[styles.pickerWrapper, isView && styles.inputView]}>
                <Picker
                  selectedValue={gender} onValueChange={setGender}
                  enabled={!isView}
                  style={Platform.OS === 'ios' ? styles.dropdownIOS : styles.dropdownAndroid}
                  itemStyle={styles.dropdownItem} mode="dropdown"
                >
                  <Picker.Item label={genderPlaceholder} value="" color={colors.textMuted}/>
                  {genderOptions.map(o => <Picker.Item key={o} label={o} value={o}/>)}
                </Picker>
              </View>
            </FieldBox>
          </SectionCard>

          {/* Ã¢â€â‚¬Ã¢â€â‚¬ CONTACT Ã¢â€â‚¬Ã¢â€â‚¬ */}
          <SectionCard
            title={contactTitle}
            icon=""
            colors={colors}
          >
            <FieldBox label={mobileLabel} colors={colors}>
              <TextInput
                style={[styles.input, fieldErrors.mobile ? { borderColor: '#DC2626' } : null, isView && styles.inputView]}
                value={mobileNumber}
                onChangeText={value => {
                  setMobileNumber(sanitizeAlgerianPhoneInput(value));
                  markTouched('mobile');
                }}
                placeholder={mobilePlaceholder}
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad" editable={!isView}
              />
              {fieldErrors.mobile ? <Text style={{ color: '#DC2626', fontSize: 12 }}>{fieldErrors.mobile}</Text> : null}
            </FieldBox>
            {/*
            <FieldBox label={emailLabel} colors={colors}>
              <TextInput
                style={[styles.input, fieldErrors.email ? { borderColor: '#DC2626' } : null, isView && styles.inputView]}
                value={email}
                onChangeText={value => {
                  setEmail(value);
                  markTouched('email');
                }}
                placeholder={t('family.mobile.emailPlaceholder','emma@example.com')}
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address" autoCapitalize="none" editable={!isView}
              />
              {fieldErrors.email ? <Text style={{ color: '#DC2626', fontSize: 12 }}>{fieldErrors.email}</Text> : null}
            </FieldBox>
            */}
          </SectionCard>

          {/*
          <SectionCard
            title={statusAccessTitle}
            icon=""
            colors={colors}
          >
            <FieldBox label={t('parking.form.fields.status.label','Status')} colors={colors}>
              <View style={[styles.pickerWrapper, isView && styles.inputView]}>
                <Picker
                  selectedValue={status} onValueChange={setStatus}
                  enabled={!isView}
                  style={Platform.OS === 'ios' ? styles.dropdownIOS : styles.dropdownAndroid}
                  itemStyle={styles.dropdownItem} mode="dropdown"
                >
                  <Picker.Item label={t('common.status.Active','Active')} value="1"/>
                  <Picker.Item label={t('common.status.Inactive','Inactive')} value="0"/>
                </Picker>
              </View>
            </FieldBox>

            <FieldBox label={accessPermissionLabel} colors={colors}>
              <View style={styles.permRow}>
                {['Complete','Partial','None'].map(opt => {
                  const isActive = accessPermission === opt;
                  const chip = permChipColor(opt);
                  return (
                    <TouchableOpacity
                      key={opt}
                      style={[
                        styles.permChip,
                        isActive
                          ? { backgroundColor: chip.bg, borderColor: chip.bg }
                          : { backgroundColor: colors.backgroundAlt, borderColor: colors.border },
                        isView && { opacity: 0.7 },
                      ]}
                      onPress={() => !isView && setAccessPermission(opt)}
                      disabled={isView}
                      activeOpacity={0.8}
                    >
                      <Text style={[
                        styles.permChipText,
                        { color: isActive ? chip.text : colors.textSecondary },
                      ]}>
                        {t(`familyMember.form.fields.accessPermission.values.${opt}`, opt)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </FieldBox>
          </SectionCard>
          */}

          {/* Ã¢â€â‚¬Ã¢â€â‚¬ SAVE BUTTON Ã¢â€â‚¬Ã¢â€â‚¬ */}
          {!isView && (
            <TouchableOpacity style={[styles.saveButton, { width: contentWidth, alignSelf: 'center' }]} onPress={handleSubmit} activeOpacity={0.85}>
              <SaveIcon />
              <Text style={styles.saveButtonText}>
                {submitLabel}
              </Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 40 }} />
        </KeyboardSafeScrollView>
      </View>
    </ScreenWrapper>
  );
}
