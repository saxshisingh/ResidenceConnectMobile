import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';

import ScreenWrapper from '../../../../components/ScreenWrapper';
import { createStyles } from './TechnicianDetailScreen.styles';
import {
  assignTechnician,
  getMaintenanceById,
  getTechniciansByServiceCategory,
  TechnicianInfo,
} from '../../services/maintenanceService';
import ThemedLoader from '../../../../components/ThemedLoader';
import { useAppTheme } from '../../../../theme/ThemeProvider';
import { useI18n } from '../../../../i18n';

const CallIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 16.42v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 1.12 3.18 2 2 0 0 1 3.11 1h3a2 2 0 0 1 2 1.72c.12.9.34 1.78.65 2.62a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 8 8l1.46-1.22a2 2 0 0 1 2.11-.45c.84.31 1.72.53 2.62.65A2 2 0 0 1 21 16.42Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SelectIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 12.5l4.2 4.2L19 7"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const toLocalizedExperience = (value: string | undefined, language: string) => {
  const normalized = String(value || '').trim();
  if (!normalized || normalized === '-') {
    return '-';
  }

  const match = normalized.match(/\d+(\.\d+)?/);
  if (!match) {
    return normalized;
  }

  const amount = Number(match[0]);
  if (!Number.isFinite(amount)) {
    return normalized;
  }

  if (language === 'fr') {
    return `${amount} ${amount === 1 ? 'an' : 'ans'}`;
  }

  if (language === 'ar') {
    return `${amount} سنة`;
  }

  return `${amount} ${amount === 1 ? 'year' : 'years'}`;
};

export default function TechnicianDetailScreen({ navigation, route }: any) {
  const { colors } = useAppTheme();
  const { language, t } = useI18n();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const requestId = String(route?.params?.requestId || '').trim();
  const initialServiceCategoryId = String(route?.params?.serviceCategoryId || '').trim();
  const initialServiceLabel = String(route?.params?.serviceLabel || '').trim();
  const assignedTechnicianId = String(route?.params?.technicianId || '').trim();

  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState('');
  const [serviceCategoryId, setServiceCategoryId] = useState(initialServiceCategoryId);
  const [serviceLabel, setServiceLabel] = useState(initialServiceLabel);
  const [technicians, setTechnicians] = useState<TechnicianInfo[]>([]);
  const [error, setError] = useState('');

  const moveToHistory = React.useCallback(() => {
    navigation.navigate('MaintenanceHistory');
  }, [navigation]);

  useEffect(() => {
    let mounted = true;

    const loadTechnicians = async () => {
      try {
        setLoading(true);
        setError('');

        let resolvedCategoryId = initialServiceCategoryId;
        let resolvedServiceLabel = initialServiceLabel;

        if ((!resolvedCategoryId || !resolvedServiceLabel) && requestId) {
          const request = await getMaintenanceById(requestId);
          resolvedCategoryId = resolvedCategoryId || String(request?.serviceCategoryId || '').trim();
          resolvedServiceLabel = resolvedServiceLabel || String(request?.serviceLabel || '').trim();
        }

        if (!resolvedCategoryId) {
          throw new Error(
            t(
              'maintenance.mobile.technician.categoryMissing',
              'Service category is missing for this request.',
            ),
          );
        }

        const list = await getTechniciansByServiceCategory(resolvedCategoryId);

        if (!mounted) {
          return;
        }

        setServiceCategoryId(resolvedCategoryId);
        setServiceLabel(resolvedServiceLabel);
        setTechnicians(list);
      } catch (e: any) {
        if (mounted) {
          setTechnicians([]);
          setError(
            e?.message ||
              t(
                'maintenance.mobile.technician.loadFailed',
                'Unable to load technicians for this request.',
              ),
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadTechnicians();
    return () => {
      mounted = false;
    };
  }, [initialServiceCategoryId, initialServiceLabel, requestId, t]);

  const openCall = async (phone: string) => {
    const normalized = String(phone || '').trim();
    if (!normalized || normalized === '-') {
      Alert.alert(
        t('common.error', 'Error'),
        t(
          'maintenance.mobile.technician.callUnavailable',
          'Phone number is not available for this technician.',
        ),
      );
      return;
    }

    const telUrl = `tel:${normalized.replace(/[^\d+]/g, '')}`;
    try {
      await Linking.openURL(telUrl);
    } catch {
      Alert.alert(
        t('common.error', 'Error'),
        t(
          'maintenance.mobile.technician.callFailed',
          'Unable to open the dialer right now.',
        ),
      );
    }
  };

  const handleSelect = async (technician: TechnicianInfo) => {
    if (!requestId) {
      Alert.alert(
        t('common.error', 'Error'),
        t(
          'maintenance.mobile.technician.requestMissing',
          'Maintenance request information is missing.',
        ),
      );
      return;
    }

    try {
      setAssigningId(technician.id);
      await assignTechnician({
        requestId,
        technicianId: technician.id,
      });

      Alert.alert(
        t('common.success', 'Success'),
        t(
          'maintenance.mobile.technician.assignSuccess',
          'Technician selected successfully.',
        ),
        [
          {
            text: t('common.mobile.common.ok', 'OK'),
            onPress: () => {
              navigation.dispatch(
                CommonActions.reset({
                  index: 1,
                  routes: [{ name: 'MainTabs' }, { name: 'MaintenanceHistory' }],
                }),
              );
            },
          },
        ],
      );
    } catch (e: any) {
      Alert.alert(
        t('common.error', 'Error'),
        e?.message ||
          t(
            'maintenance.mobile.technician.assignFailed',
            'Failed to assign technician.',
          ),
      );
    } finally {
      setAssigningId('');
    }
  };

  return (
    <ScreenWrapper
      title={t('maintenance.mobile.technician.title', 'Select Technician')}
      hideBackButton
      rightIcon={
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={moveToHistory}
          style={styles.historyAction}
        >
          <Text style={styles.historyActionText}>
            {t('maintenance.mobile.technician.moveToHistory', 'Move to History')}
          </Text>
        </TouchableOpacity>
      }
    >
      <View style={styles.container}>
        {loading ? (
          <View style={styles.centerState}>
            <ThemedLoader size="large" />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            <View style={styles.heroCard}>
              <View style={styles.heroCircle1} />
              <View style={styles.heroCircle2} />
              <Text style={styles.heroEyebrow}>
                {t('maintenance.mobile.technician.requestLabel', 'REQUEST')}
              </Text>
              <Text style={styles.heroTitle}>
                {serviceLabel ||
                  t('maintenance.mobile.technician.defaultService', 'Maintenance Service')}
              </Text>
              <Text style={styles.heroSub}>
                {t(
                  'maintenance.mobile.technician.heroSubtitle',
                  'Select the technician you want to assign to this maintenance request.',
                )}
              </Text>
              <View style={styles.metaRow}>
                <View style={styles.metaPillSingle}>
                  <Text style={styles.metaPillLabel}>
                    {t('maintenance.mobile.technician.availableCount', 'Available')}
                  </Text>
                  <Text style={styles.metaPillValue}>{technicians.length}</Text>
                </View>
              </View>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {!error && technicians.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>
                  {t(
                    'maintenance.mobile.technician.emptyTitle',
                    'No technicians available',
                  )}
                </Text>
                <Text style={styles.emptyText}>
                  {t(
                    'maintenance.mobile.technician.emptySubtitle',
                    'No technician is available for this service right now.',
                  )}
                </Text>
                <Text style={styles.emptyHint}>
                  {t(
                    'maintenance.mobile.technician.emptyHint',
                    'You can move to history for now and assign a technician later when someone becomes available.',
                  )}
                </Text>
              </View>
            ) : null}

            {technicians.map(technician => {
              const initials = technician.name
                .split(' ')
                .filter(Boolean)
                .map(part => part[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();
              const isAssigning = assigningId === technician.id;
              const isAssigned = assignedTechnicianId && assignedTechnicianId === technician.id;
              const technicianServiceLabel = technician.role || '-';
              const technicianExperienceLabel = toLocalizedExperience(
                technician.experience,
                language,
              );

              return (
                <View key={technician.id} style={styles.card}>
                  <View style={styles.headerRow}>
                    <View style={styles.avatar}>
                      {technician.profilePhoto ? (
                        <Image
                          source={{ uri: technician.profilePhoto }}
                          style={styles.avatarImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <Text style={styles.avatarText}>
                          {initials || t('maintenance.mobile.technician.initial', 'T')}
                        </Text>
                      )}
                    </View>
                    <View style={styles.headerContent}>
                      <View style={styles.nameRow}>
                        <Text style={styles.name}>{technician.name}</Text>
                        {isAssigned ? (
                          <View style={styles.selectedBadge}>
                            <Text style={styles.selectedBadgeText}>
                              {t('maintenance.mobile.technician.selected', 'Selected')}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={styles.role}>{technicianServiceLabel}</Text>
                      <Text style={styles.phoneText}>{technician.phone || '-'}</Text>
                    </View>
                  </View>

                  <View style={styles.quickGrid}>
                    <View style={styles.quickItem}>
                      <Text style={styles.quickLabel}>
                        {t('maintenance.mobile.technician.experience', 'Experience')}
                      </Text>
                      <Text style={styles.quickValue}>{technicianExperienceLabel}</Text>
                    </View>
                    <View style={styles.quickItem}>
                      <Text style={styles.quickLabel}>
                        {t('maintenance.mobile.technician.skillLevel', 'Skill Level')}
                      </Text>
                      <Text style={styles.quickValue}>{technician.skillLevel || '-'}</Text>
                    </View>
                  </View>

                  <View style={styles.quickGrid}>
                    <View style={styles.quickItem}>
                      <Text style={styles.quickLabel}>
                        {t('maintenance.mobile.technician.availability', 'Availability')}
                      </Text>
                      <Text style={styles.quickValue}>
                        {technician.availabilityStatus || '-'}
                      </Text>
                    </View>
                    <View style={styles.quickItem}>
                      <Text style={styles.quickLabel}>
                        {t('maintenance.mobile.technician.gender', 'Gender')}
                      </Text>
                      <Text style={styles.quickValue}>{technician.gender || '-'}</Text>
                    </View>
                  </View>

                  <View style={styles.detailBlock}>
                    <Text style={styles.detailLabel}>
                      {t('maintenance.mobile.technician.email', 'Email')}
                    </Text>
                    <Text style={styles.detailValue}>{technician.email || '-'}</Text>
                  </View>

                  <View style={styles.quickGrid}>
                    <View style={styles.quickItem}>
                      <Text style={styles.quickLabel}>
                        {t('maintenance.mobile.technician.workingHours', 'Working Hours')}
                      </Text>
                      <Text style={styles.quickValue}>{technician.schedule || '-'}</Text>
                    </View>
                    <View style={styles.quickItem}>
                      <Text style={styles.quickLabel}>
                        {t('maintenance.mobile.technician.service', 'Service')}
                      </Text>
                      <Text style={styles.quickValue}>{technicianServiceLabel}</Text>
                    </View>
                  </View>

                  {technician.skills.length > 0 ? (
                    <View style={styles.skillsWrap}>
                      {technician.skills.slice(0, 4).map(skill => (
                        <View key={skill} style={styles.skillPill}>
                          <Text style={styles.skillText}>{skill}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}

                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.callButton}
                      activeOpacity={0.85}
                      onPress={() => openCall(technician.phone)}
                    >
                      <CallIcon color={colors.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.selectButton,
                        (isAssigning || isAssigned) && styles.selectButtonDisabled,
                      ]}
                      activeOpacity={0.85}
                      disabled={
                        isAssigning ||
                        isAssigned ||
                        !requestId ||
                        !serviceCategoryId
                      }
                      onPress={() => handleSelect(technician)}
                    >
                      <View style={styles.selectButtonContent}>
                        <SelectIcon color={colors.onPrimary} />
                        <Text style={styles.selectButtonText}>
                          {isAssigning
                            ? t('maintenance.mobile.technician.selecting', 'Selecting...')
                            : isAssigned
                              ? t('maintenance.mobile.technician.selected', 'Selected')
                              : t('maintenance.mobile.technician.select', 'Select')}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </ScreenWrapper>
  );
}
