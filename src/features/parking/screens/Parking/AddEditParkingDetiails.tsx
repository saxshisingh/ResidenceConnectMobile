/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
// AddEditParkingDetails.tsx â€” Elegantly Redesigned
import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity,
  Alert, TextInput,
  useWindowDimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { createStyles } from './AddEditParkingDetiails.styles';
import CarIcon      from '../../../../assets/Icons/Car.svg';
import ParkingIcon  from '../../../../assets/Icons/Rectangle 79.svg';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import KeyboardSafeScrollView from '../../../../components/KeyboardSafeScrollView';
import ModalSelect   from '../../../../components/ModalSelect';

import {
  updateParkingSlot,
  createParkingAssignment,
  getParkingSlotsByBlock,
  getVehiclesByResident,
} from '../../services/parkingService';

import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { fetchParkingSlots }  from '../../state/parkingSlice';
import { useAppTheme }        from '../../../../theme/ThemeProvider';
import { useI18n }            from '../../../../i18n';
import {
  hasMaxLength, hasMinLength,
  isLikelyGuid, trimValue,
} from '../../../../shared/validation/formValidation';

// inline icons
const SaveIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v9a2 2 0 01-2 2z" stroke="#fff" strokeWidth={2} strokeLinecap="round"/>
    <Path d="M8 12l3 3 5-5" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// â”€â”€â”€ tiny section card helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SectionCard = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) => (
  (() => {
    const { colors } = useAppTheme();
    const { width } = useWindowDimensions();
    const contentWidth = Math.min(width - 32, 520);

    return (
      <View style={{ width: contentWidth, alignSelf: 'center', marginBottom: 14 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1.1, color: colors.textMuted, marginBottom: 8, marginLeft: 2 }}>
          {icon ? `${icon}  ${title}` : title}
        </Text>
        <View style={{ backgroundColor: colors.surface, borderRadius: 18, padding: 16, borderWidth: 0.5, borderColor: colors.border, gap: 12,
          shadowColor: colors.overlay, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }}>
          {children}
        </View>
      </View>
    );
  })()
);

const FieldBox = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  (() => {
    const { colors } = useAppTheme();

    return (
      <View style={{ gap: 6 }}>
        <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary }}>{label}</Text>
        {children}
      </View>
    );
  })()
);

const FieldRow = ({ children }: { children: React.ReactNode }) => (
  <View style={{ flexDirection: 'row', gap: 10 }}>{children}</View>
);

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function AddEditParkingDetails({ navigation, route }: any) {
  const { width: screenWidth } = useWindowDimensions();
  const { colors } = useAppTheme();
  const { language, t }      = useI18n();
  const styles     = useMemo(() => createStyles(colors), [colors]);
  const dispatch   = useAppDispatch();
  const parkingCopy = useMemo(() => {
    if (language === 'ar') {
      return {
        viewSlotAssignment: '\u0639\u0631\u0636 \u062a\u062e\u0635\u064a\u0635 \u0645\u0648\u0642\u0641\u0643',
        updateParkingSlot: '\u062a\u062d\u062f\u064a\u062b \u062a\u062e\u0635\u064a\u0635 \u0627\u0644\u0645\u0648\u0642\u0641',
        assignParkingSlot: '\u062a\u062e\u0635\u064a\u0635 \u0645\u0648\u0642\u0641',
        slotDetails: '\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0645\u0648\u0642\u0641',
        vehicleSection: '\u0627\u0644\u0645\u0631\u0643\u0628\u0629',
        detailsTitle: '\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0645\u0648\u0642\u0641',
        editTitle: '\u062a\u062d\u062f\u064a\u062b \u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0645\u0648\u0642\u0641',
        addTitle: '\u0625\u0636\u0627\u0641\u0629 \u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0645\u0648\u0642\u0641',
      };
    }

    if (language === 'fr') {
      return {
        viewSlotAssignment: "Voir l'affectation de votre place",
        updateParkingSlot: "Mettre a jour l'affectation de la place",
        assignParkingSlot: 'Attribuer une place',
        slotDetails: 'Details de la place',
        vehicleSection: 'Vehicule',
        detailsTitle: 'Details de la place',
        editTitle: 'Modifier les details du stationnement',
        addTitle: 'Ajouter les details du stationnement',
      };
    }

    return {
      viewSlotAssignment: 'View your slot assignment',
      updateParkingSlot: 'Update your parking slot',
      assignParkingSlot: 'Assign a new parking slot',
      slotDetails: 'SLOT DETAILS',
      vehicleSection: 'VEHICLE',
      detailsTitle: 'Parking Details',
      editTitle: 'Edit Parking Details',
      addTitle: 'Add Parking Details',
    };
  }, [language]);

  const { mode = 'add', parkingData } = route.params || {};
  const isEdit = mode === 'edit';
  const isView = mode === 'view';
  const illustrationSize = Math.min(Math.max(screenWidth - 96, 220), 280);

  const user = useAppSelector((state: any) => state.auth.user);

  const [zoneBlock,    setZoneBlock]    = useState('');
  const [parkingType,  setParkingType]  = useState('');
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [vehicles,     setVehicles]     = useState<any[]>([]);
  const [selectedSlotId,    setSelectedSlotId]    = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');

  useEffect(() => {
    if (parkingData?.blockId) {
      getParkingSlotsByBlock(parkingData.blockId)
        .then(setAvailableSlots)
        .catch(() => Alert.alert(t('common.error','Error'), t('parking.mobile.loadSlotsFailed','Failed to load slots')));
    }
    if (user?.data?.residentId) {
      getVehiclesByResident(user.data.residentId)
        .then(setVehicles)
        .catch(() => Alert.alert(t('common.error','Error'), t('vehicle.list.loadError','Failed to load vehicles')));
    }
  }, [parkingData?.blockId, t, user?.data?.residentId]);

  useEffect(() => {
    if ((isEdit || isView) && parkingData) {
      setSelectedSlotId(parkingData.parkingSlotId || parkingData.slotId || '');
      setSelectedVehicleId(parkingData.vehicleId || '');
      setZoneBlock(parkingData.blockName || '');
      setParkingType(parkingData.assignmentType || '');
    }
  }, [isEdit, isView, parkingData]);

  const handleSave = async () => {
    try {
      const cleanZone = trimValue(zoneBlock);
      const cleanType = trimValue(parkingType);

      if (!selectedSlotId || !isLikelyGuid(selectedSlotId)) {
        Alert.alert(t('common.error','Error'), t('parking.mobile.validationValidSlot','Please select a valid parking slot'));
        return;
      }
      if (!selectedVehicleId || !isLikelyGuid(selectedVehicleId)) {
        Alert.alert(t('common.error','Error'), t('parking.mobile.validationValidVehicle','Please select a valid vehicle'));
        return;
      }
      if (!cleanZone || !cleanType) {
        Alert.alert(t('community.mobile.createPost.validationTitle','Validation'), t('parking.mobile.zoneTypeRequired','Parking zone/block and parking type are required'));
        return;
      }
      if (!hasMinLength(cleanZone,2)||!hasMinLength(cleanType,2)||!hasMaxLength(cleanZone,60)||!hasMaxLength(cleanType,40)) {
        Alert.alert(t('community.mobile.createPost.validationTitle','Validation'), t('parking.mobile.zoneTypeInvalid','Parking zone/block or type is invalid'));
        return;
      }

      if (isEdit) {
        await updateParkingSlot({
          slotId: selectedSlotId,
          vehicleId: selectedVehicleId,
          status: String(parkingData.status),
          modifiedBy: user.data.userId,
        });
      } else {
        const selectedVehicle = vehicles.find(v => v.vehicleId === selectedVehicleId);
        if (!selectedVehicle) {
          Alert.alert(t('common.error','Error'), t('parking.mobile.validationValidVehicle','Please select a valid vehicle'));
          return;
        }
        await createParkingAssignment(user.data.residentId, {
          assignmentType: 'Resident',
          residentId: user.data.residentId,
          vehicleId: selectedVehicle.vehicleId,
          parkingSlotId: selectedSlotId,
          customerName: selectedVehicle.residentName,
          vehicleNumber: selectedVehicle.vehicleNumber,
          visitorName: '', visitorVehicleNumber: '',
          effectiveFrom: new Date().toISOString(),
          effectiveTo: new Date(new Date().setFullYear(new Date().getFullYear()+1)).toISOString(),
          createdBy: user.data.userId, notes: '',
        });
      }

      await dispatch(fetchParkingSlots(user.data.residentId));
      Alert.alert(t('common.success','Success'), t('parking.mobile.savedSuccessfully','Parking saved successfully'));
      navigation.replace('ParkingEntry');
    } catch {
      Alert.alert(t('common.error','Error'), t('parking.mobile.saveFailed','Unable to save parking details'));
    }
  };

  const slotOptions = availableSlots
    .map(s => {
      const v = s.parkingSlotId || s.slotId;
      if (!v) return null;
      return { value: v, label: `${s.slotNumber} • ${t('parking.form.fields.level.label','Level')} ${s.level}` };
    })
    .filter(Boolean) as { value: string; label: string }[];

  const vehicleOptions = vehicles
    .filter(v => v.vehicleId)
    .map(v => ({ value: v.vehicleId, label: `${v.vehicleNumber} (${v.vehicleType})` }));

  const selectedSlotLabel =
    slotOptions.find(option => option.value === selectedSlotId)?.label ||
    parkingData?.slotNumber ||
    '';

  const selectedVehicleLabel =
    vehicles.find(v => v.vehicleId === selectedVehicleId)?.vehicleNumber ||
    parkingData?.vehicleNumber ||
    '';

  const screenTitle = isView
    ? parkingCopy.detailsTitle
    : isEdit
      ? parkingCopy.editTitle
      : parkingCopy.addTitle;

  return (
    <ScreenWrapper title={screenTitle} onBackPress={() => navigation.goBack()}>
      <View style={styles.container}>
        <KeyboardSafeScrollView contentContainerStyle={styles.scrollContent}>

          {/* â”€â”€ HERO â”€â”€ */}
          <View style={[styles.heroCard, { width: Math.min(screenWidth - 32, 520), alignSelf: 'center' }]}>
            <View style={styles.heroCircle1} />
            <View style={styles.heroCircle2} />
            {/* car illustration floats above */}
            <View style={styles.carFloatWrap}>
              <CarIcon width={90} height={90} />
            </View>
            <View style={styles.heroTextRow}>
              <View>
                <Text style={styles.heroTitle}>{screenTitle}</Text>
                <Text style={styles.heroSub}>
                  {isView
                    ? parkingCopy.viewSlotAssignment
                    : isEdit
                      ? parkingCopy.updateParkingSlot
                      : parkingCopy.assignParkingSlot}
                </Text>
              </View>
              {/* status chip for view mode */}
              {/* {isView && (
                <View style={styles.viewChip}>
                  <Text style={styles.viewChipText}>VIEW</Text>
                </View>
              )} */}
            </View>
          </View>

          {/* â”€â”€ SLOT & ZONE SECTION â”€â”€ */}
          <SectionCard title={parkingCopy.slotDetails} icon="">
            <FieldRow>
              <View style={{ flex: 1 }}>
                <FieldBox label={t('parking.form.fields.slotNumber.label','Slot Number')}>
                  {isView ? (
                    <TextInput
                      style={[styles.input, styles.readonlyInput]}
                      value={selectedSlotLabel}
                      editable={false}
                      placeholder=""
                      placeholderTextColor={colors.textMuted}
                    />
                  ) : (
                    <View style={styles.dropdownWrapper}>
                      <ModalSelect
                        value={selectedSlotId}
                        onChange={setSelectedSlotId}
                        disabled={false}
                        placeholder={t('parking.mobile.selectParkingSlot','Select Slot')}
                        title={t('parking.mobile.selectParkingSlot','Select Parking Slot')}
                        options={slotOptions}
                      />
                    </View>
                  )}
                </FieldBox>
              </View>
              <View style={{ flex: 1 }}>
                <FieldBox label={t('parking.mobile.zoneBlock','Zone / Block')}>
                  <TextInput
                    style={[styles.input, isView && styles.readonlyInput]}
                    value={zoneBlock}
                    onChangeText={setZoneBlock}
                    editable={!isView}
                    placeholderTextColor={colors.textMuted}
                  />
                </FieldBox>
              </View>
            </FieldRow>
          </SectionCard>

          {/* â”€â”€ VEHICLE SECTION â”€â”€ */}
          <SectionCard title={parkingCopy.vehicleSection} icon="">
            <FieldBox label={t('vehicle.form.fields.vehicleNumber.label','Vehicle Number')}>
              {isView ? (
                <TextInput
                  style={[styles.input, styles.readonlyInput]}
                  value={selectedVehicleLabel}
                  editable={false}
                  placeholder=""
                  placeholderTextColor={colors.textMuted}
                />
              ) : (
                <View style={styles.dropdownWrapper}>
                  <ModalSelect
                    value={selectedVehicleId}
                    onChange={setSelectedVehicleId}
                    disabled={false}
                    placeholder={t('parking.mobile.selectVehicle','Select Vehicle')}
                    title={t('parking.mobile.selectVehicle','Select Vehicle')}
                    options={vehicleOptions}
                  />
                </View>
              )}
            </FieldBox>

            <FieldBox label={t('parking.mobile.parkingType','Parking Type')}>
              <TextInput
                style={[styles.input, isView && styles.readonlyInput]}
                value={parkingType}
                onChangeText={setParkingType}
                editable={!isView}
                placeholderTextColor={colors.textMuted}
              />
            </FieldBox>
          </SectionCard>

          {/* Parking map illustration for view mode */}
          {/* {isView && (
            <View style={[styles.parkingIllustrationWrap, { width: illustrationSize, height: illustrationSize }]}>
              <ParkingIcon style={{ marginTop: 20 }} />
            </View>
          )} */}

          {/* â”€â”€ SAVE / UPDATE BUTTON â”€â”€ */}
          {!isView && (
            <TouchableOpacity style={[styles.saveButton, { width: Math.min(screenWidth - 32, 520), alignSelf: 'center' }]} onPress={handleSave} activeOpacity={0.85}>
              <SaveIcon />
              <Text style={styles.saveButtonText}>
                {isEdit
                  ? t('parking.mobile.updateParkingDetail','Update Parking')
                  : t('parking.mobile.addParking','Add Parking')}
              </Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 40 }} />
        </KeyboardSafeScrollView>
      </View>
    </ScreenWrapper>
  );
}
