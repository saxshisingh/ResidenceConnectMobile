/* eslint-disable @typescript-eslint/no-unused-vars */
// AddEditVehicle.tsx — Elegantly Redesigned
import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import Svg, { Path } from 'react-native-svg';

import { createStyles } from './AddEditVehicle.styles';
import CarIcon from '../../../../assets/Icons/Car.svg';
import {
  getVehicleById, updateVehicle, createVehicle, uploadVehicleRcDocument,
} from '../../services/vehicleService';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import KeyboardSafeScrollView from '../../../../components/KeyboardSafeScrollView';
import { fetchVehicles } from '../../state/vehicleSlice';
import { useAppTheme } from '../../../../theme/ThemeProvider';
import { useI18n }     from '../../../../i18n';
import {
  hasMaxLength, hasMinLength, trimValue,
} from '../../../../shared/validation/formValidation';

// ── inline icons ──────────────────────────────
const SaveIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v9a2 2 0 01-2 2z" stroke="#fff" strokeWidth={2} strokeLinecap="round"/>
    <Path d="M8 12l3 3 5-5" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);
const UploadIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="#F59E0B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// ── tiny layout helpers ───────────────────────
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

// ─────────────────────────────────────────────
export default function AddEditVehicle({ navigation, route }: any) {
  const { colors } = useAppTheme();
  const { t }      = useI18n();
  const styles     = React.useMemo(() => createStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const contentWidth = Math.min(width - 32, 520);
  const { mode = 'add', vehicleData } = route.params || {};
  const isEdit = mode === 'edit';
  const isView = mode === 'view';
  const dispatch = useAppDispatch();

  const [vehicleType,        setVehicleType]        = useState('');
  const [vehicleBrand,       setVehicleBrand]       = useState('');
  const [model,              setModel]              = useState('');
  const [vehicleColor,       setVehicleColor]       = useState('');
  const [vehicleNumberPlate, setVehicleNumberPlate] = useState('');
  const [rcDocument,         setRcDocument]         = useState('');
  const [rcDocumentFile,     setRcDocumentFile]     = useState<Asset | null>(null);

  const user = useAppSelector((state: any) => state.auth.user);

  useEffect(() => {
    if (!vehicleData) {
      return;
    }

    setVehicleType(vehicleData.vehicleType || vehicleData.type || '');
    setVehicleBrand(vehicleData.brand || vehicleData.make || '');
    setModel(vehicleData.model || '');
    setVehicleColor(vehicleData.color || '');
    setVehicleNumberPlate(
      vehicleData.vehicleNumber ||
        vehicleData.vehicleNumberPlate ||
        vehicleData.registrationNumber ||
        vehicleData.plateNumber ||
        '',
    );
    setRcDocument(
      vehicleData.rcDocumentName ||
        vehicleData.rcDocumentFileName ||
        vehicleData.rcDocument ||
        '',
    );
  }, [vehicleData]);

  useEffect(() => {
    if ((isEdit || isView) && vehicleData?.vehicleId) {
      getVehicleById(vehicleData.vehicleId)
        .then(res => {
          const d = res.data;
          setVehicleType(d.vehicleType || '');
          setVehicleBrand(d.brand || d.make || '');
          setModel(d.model || '');
          setVehicleColor(d.color || '');
          setVehicleNumberPlate(
            d.vehicleNumber ||
              d.vehicleNumberPlate ||
              d.registrationNumber ||
              d.plateNumber ||
              vehicleData?.vehicleNumber ||
              vehicleData?.vehicleNumberPlate ||
              '',
          );
          setRcDocument(
            d.rcDocumentName ||
              d.rcDocumentFileName ||
              d.rcDocument ||
              vehicleData?.rcDocumentName ||
              vehicleData?.rcDocumentFileName ||
              vehicleData?.rcDocument ||
              '',
          );
        })
        .catch(() => Alert.alert(t('common.error','Error'), t('vehicle.edit.errorLoadMessage','Failed to load vehicle details')));
    }
  }, [isEdit, isView, t, vehicleData]);

  const handleSubmit = async () => {
    try {
      const residentId  = user?.data?.residentId;
      const cleanType   = trimValue(vehicleType);
      const cleanBrand  = trimValue(vehicleBrand);
      const cleanModel  = trimValue(model);
      const cleanColor  = trimValue(vehicleColor);
      const cleanPlate  = trimValue(vehicleNumberPlate).toUpperCase();
      const cleanRc     = trimValue(rcDocument);

      if (!residentId) { Alert.alert(t('common.error','Error'), t('vehicle.mobile.residentNotFound','Resident not found')); return; }
      if (!cleanType||!cleanBrand||!cleanModel||!cleanColor||!cleanPlate) {
        Alert.alert(t('community.mobile.createPost.validationTitle','Validation'), t('vehicle.mobile.requiredFields','Please fill all required vehicle details')); return;
      }
      if (!hasMinLength(cleanType,2)||!hasMinLength(cleanBrand,2)||!hasMinLength(cleanModel,1)||!hasMinLength(cleanColor,2)||!hasMinLength(cleanPlate,4)) {
        Alert.alert(t('community.mobile.createPost.validationTitle','Validation'), t('vehicle.mobile.invalidFieldLength','One or more fields are too short')); return;
      }
      if (!hasMaxLength(cleanType,40)||!hasMaxLength(cleanBrand,40)||!hasMaxLength(cleanModel,40)||!hasMaxLength(cleanColor,30)||!hasMaxLength(cleanPlate,20)) {
        Alert.alert(t('community.mobile.createPost.validationTitle','Validation'), t('vehicle.mobile.invalidFieldLength','One or more fields are too long')); return;
      }
      if (!/^[A-Z0-9 -]{4,20}$/.test(cleanPlate)) {
        Alert.alert(t('community.mobile.createPost.validationTitle','Validation'), t('vehicle.mobile.invalidPlate','Please enter a valid vehicle number plate')); return;
      }
      if (cleanRc && !hasMaxLength(cleanRc,120)) {
        Alert.alert(t('community.mobile.createPost.validationTitle','Validation'), t('vehicle.mobile.invalidRcDoc','RC document value is too long')); return;
      }

      const extractId = (r: any) => r?.data?.vehicleId || r?.data?.id || r?.vehicleId || r?.id || vehicleData?.vehicleId || '';
      let vehicleResponse: any;

      if (isEdit) {
        vehicleResponse = await updateVehicle(vehicleData.vehicleId, {
          Brand: cleanBrand, vehicleType: cleanType, model: cleanModel, color: cleanColor,
          vehicleNumber: cleanPlate, rcDocsFile: null, modifiedBy: residentId,
        });
      } else {
        vehicleResponse = await createVehicle({
          residentId, Brand: cleanBrand, vehicleType: cleanType, model: cleanModel, color: cleanColor,
          vehicleNumber: cleanPlate, rcDocsFile: null, createdBy: residentId,
        });
      }

      const savedId = extractId(vehicleResponse);
      if (rcDocumentFile?.uri && rcDocumentFile?.type && rcDocumentFile?.fileName) {
        if (!savedId) throw new Error('Vehicle saved but ID not returned for RC upload');
        await uploadVehicleRcDocument({ vehicleId: String(savedId), file: { uri: rcDocumentFile.uri, type: rcDocumentFile.type, name: rcDocumentFile.fileName } });
      }

      await dispatch(fetchVehicles(residentId));
      Alert.alert(t('common.success','Success'), t(isEdit ? 'vehicle.edit.successMessage' : 'vehicle.add.successMessage','Vehicle saved successfully'));
      navigation.replace('VehicleEntry');
    } catch (e) {
      console.error(e);
      Alert.alert(t('common.error','Error'), t(isEdit ? 'vehicle.edit.errorMessage' : 'vehicle.add.errorMessage','Failed to save vehicle'));
    }
  };

  const handlePickRcDocument = async () => {
    try {
      const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8, selectionLimit: 1 });
      if (result.didCancel || result.errorCode) return;
      const asset = result.assets?.[0];
      if (!asset?.uri || !asset?.type || !asset?.fileName) {
        Alert.alert(t('common.error','Error'), t('documents.mobile.invalidFile','Selected file is invalid')); return;
      }
      setRcDocument(asset.fileName);
      setRcDocumentFile(asset);
    } catch {
      Alert.alert(t('common.error','Error'), t('vehicle.mobile.invalidRcDoc','RC document value is too long'));
    }
  };

  const screenTitle = isView
    ? t('vehicle.view.title','Vehicle Details')
    : isEdit ? t('vehicle.edit.title','Edit Vehicle')
    : t('vehicle.add.title','Add Vehicle');

  return (
    <ScreenWrapper title={screenTitle} onBackPress={() => navigation.goBack()}>
      <View style={styles.container}>
        <KeyboardSafeScrollView contentContainerStyle={styles.scrollContent}>
          {/* ── HERO ── */}
          <View style={[styles.heroCard, { width: contentWidth, alignSelf: 'center' }]}>
            <View style={styles.heroCircle1} />
            <View style={styles.heroCircle2} />
            <View style={styles.carFloatWrap}>
              <CarIcon width={90} height={90} />
            </View>
            <View style={styles.heroTextRow}>
              <View>
                <Text style={styles.heroTitle}>{screenTitle}</Text>
                <Text style={styles.heroSub}>
                  {isView
                    ? t('vehicle.mobile.viewVehicleInformation', 'View vehicle information')
                    : isEdit
                      ? t('vehicle.mobile.updateVehicleDetails', 'Update your vehicle details')
                      : t('vehicle.mobile.registerVehicle', 'Register a new vehicle')}
                </Text>
              </View>
              {/* {isView && (
                <View style={styles.viewChip}>
                  <Text style={styles.viewChipText}>{t('common.view', 'View')}</Text>
                </View>
              )} */}
            </View>
          </View>

          {/* ── VEHICLE INFO ── */}
          <SectionCard title={t('vehicle.mobile.vehicleInfoSection', 'VEHICLE INFO')} icon="" colors={colors}>
            <FieldRow>
              <View style={{ flex: 1 }}>
                <FieldBox label={t('vehicle.form.fields.vehicleType.label','Vehicle Type')} colors={colors}>
                  <TextInput
                    style={[styles.input, isView && styles.inputView]}
                    value={vehicleType} onChangeText={setVehicleType}
                    placeholder={t('vehicle.form.fields.vehicleType.placeholder','Vehicle Type')}
                    placeholderTextColor={colors.textMuted} editable={!isView}
                  />
                </FieldBox>
              </View>
              <View style={{ flex: 1 }}>
                <FieldBox label={t('vehicle.mobile.vehicleBrand','Brand')} colors={colors}>
                  <TextInput
                    style={[styles.input, isView && styles.inputView]}
                    value={vehicleBrand} onChangeText={setVehicleBrand}
                    placeholder={t('vehicle.mobile.vehicleBrand','Brand')}
                    placeholderTextColor={colors.textMuted} editable={!isView}
                  />
                </FieldBox>
              </View>
            </FieldRow>

            <FieldRow>
              <View style={{ flex: 1 }}>
                <FieldBox label={t('vehicle.form.fields.model.label','Model')} colors={colors}>
                  <TextInput
                    style={[styles.input, isView && styles.inputView]}
                    value={model} onChangeText={setModel}
                    placeholder={t('vehicle.form.fields.model.placeholder','Model')}
                    placeholderTextColor={colors.textMuted} editable={!isView}
                  />
                </FieldBox>
              </View>
              <View style={{ flex: 1 }}>
                <FieldBox label={t('vehicle.mobile.vehicleColor','Color')} colors={colors}>
                  <TextInput
                    style={[styles.input, isView && styles.inputView]}
                    value={vehicleColor} onChangeText={setVehicleColor}
                    placeholder={t('vehicle.mobile.vehicleColor','Color')}
                    placeholderTextColor={colors.textMuted} editable={!isView}
                  />
                </FieldBox>
              </View>
            </FieldRow>
          </SectionCard>

          {/* ── NUMBER PLATE ── */}
          <SectionCard title={t('vehicle.mobile.numberPlateSection', 'NUMBER PLATE')} icon="" colors={colors}>
            <FieldBox label={t('vehicle.mobile.vehicleNumberPlate','Vehicle Number Plate')} colors={colors}>
              <TextInput
                style={[styles.plateInput, isView && styles.inputView]}
                value={vehicleNumberPlate} onChangeText={setVehicleNumberPlate}
                placeholder={t('vehicle.mobile.vehicleNumberPlate','e.g. MH12 AB 4589')}
                placeholderTextColor={colors.textMuted}
                editable={!isView} autoCapitalize="characters"
              />
            </FieldBox>
          </SectionCard>

          {/* ── RC DOCUMENT ── */}
          {/* <SectionCard title="DOCUMENT" icon="📄">
            <FieldBox label={t('vehicle.mobile.uploadRcDocument','Upload RC Document (Image/pdf)')}>
              <TouchableOpacity
                activeOpacity={isView ? 1 : 0.8}
                style={[styles.uploadField, isView && styles.inputView]}
                onPress={isView ? undefined : handlePickRcDocument}
                disabled={isView}
              >
                <Text style={[styles.uploadFieldText, !rcDocument && { color: colors.textMuted }]} numberOfLines={1}>
                  {rcDocument || t('vehicle.mobile.rcDocument','RC Document')}
                </Text>
                {!isView && (
                  <View style={styles.uploadBadge}>
                    <UploadIcon />
                    <Text style={styles.uploadBadgeText}>{t('documents.mobile.upload','Upload')}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </FieldBox>
          </SectionCard> */}

          {/* ── SAVE BUTTON ── */}
          {!isView && (
            <TouchableOpacity style={[styles.saveButton, { width: contentWidth, alignSelf: 'center', marginBottom: Math.max(insets.bottom, 16) + 8 }]} onPress={handleSubmit} activeOpacity={0.85}>
              <SaveIcon />
              <Text style={styles.saveButtonText}>
                {isEdit ? t('vehicle.edit.submit','Update Vehicle') : t('vehicle.add.submit','Save Vehicle')}
              </Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 40 }} />
        </KeyboardSafeScrollView>
      </View>
    </ScreenWrapper>
  );
}
