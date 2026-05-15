import React, { useEffect } from 'react';
import { Alert, Linking, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import ScreenWrapper from '../../../../components/ScreenWrapper';
import { createStyles } from './MaintenanceRequestDetailScreen.styles';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import {
  clearTechnicianDetails,
  clearRequestDetails,
  fetchMaintenanceRequestById,
  fetchTechnicianForRequest,
} from '../../state/maintenanceSlice';
import ThemedLoader from '../../../../components/ThemedLoader';
import { useAppTheme } from '../../../../theme/ThemeProvider';
import { useI18n } from '../../../../i18n';
import {
  formatMaintenanceDate,
  getMaintenanceStatusLabel,
  getMaintenanceUrgencyLabel,
} from '../../services/maintenanceService';

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

export default function MaintenanceRequestDetailScreen({ navigation, route }: any) {
  const { colors } = useAppTheme();
  const { language, t } = useI18n();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const requestId = route?.params?.requestId;
  const dispatch = useAppDispatch();
  const request = useAppSelector(state => state.maintenance.requestDetails);
  const loading = useAppSelector(state => state.maintenance.requestLoading);
  const technicianDetails = useAppSelector(state => state.maintenance.technicianDetails);
  const technicianLoading = useAppSelector(state => state.maintenance.technicianLoading);
  const technicianError = useAppSelector(state => state.maintenance.technicianError);
  const [profileModalVisible, setProfileModalVisible] = React.useState(false);
  const handleBack = React.useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('MaintenanceHistory');
  }, [navigation]);

  const openCall = React.useCallback(async (phone: string) => {
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
  }, [t]);

  useEffect(() => {
    if (requestId) {
      dispatch(fetchMaintenanceRequestById(requestId));
    }
    return () => {
      dispatch(clearRequestDetails());
    };
  }, [dispatch, requestId]);

  useEffect(() => {
    const technicianId = request?.technician?.id || request?.technicianId;

    if (profileModalVisible && technicianId) {
      dispatch(fetchTechnicianForRequest({ technicianId }));
    }

    if (!profileModalVisible) {
      dispatch(clearTechnicianDetails());
    }
  }, [
    dispatch,
    profileModalVisible,
    request?.technician?.id,
    request?.technicianId,
  ]);

  if (loading) {
    return (
      <ScreenWrapper
        title={t('maintenance.mobile.request.title', 'Maintenance Request')}
        onBackPress={handleBack}
      >
        <View style={styles.container}>
          <ThemedLoader size="large" />
        </View>
      </ScreenWrapper>
    );
  }

  if (!request) {
    return (
      <ScreenWrapper
        title={t('maintenance.mobile.request.title', 'Maintenance Request')}
        onBackPress={handleBack}
      >
        <View style={styles.container}>
          <Text style={styles.emptyText}>{t('maintenance.mobile.request.notFound', 'Request not found.')}</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const resolvedTechnicianId = request.technician?.id || request.technicianId;
  const showTechnicianCard = Boolean(resolvedTechnicianId);
  const technicianProfile = technicianDetails || request.technician || null;
  const technicianInitials = technicianProfile?.name
    ? technicianProfile.name
        .split(' ')
        .filter(Boolean)
        .map(part => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'T';
  const technicianServiceLabel = technicianProfile?.role || '-';
  const technicianExperienceLabel = toLocalizedExperience(
    technicianProfile?.experience,
    language,
  );
  const normalizedStatus = String(request.status || '').trim().toLowerCase();
  const isCompleted = normalizedStatus === 'completed';
  const isInProgress = normalizedStatus === 'in progress';
  const statusStyle =
    isCompleted
      ? styles.statusComplete
      : isInProgress
        ? styles.statusInProgress
        : styles.statusPending;
  const statusTextStyle =
    isCompleted
      ? styles.statusTextComplete
      : isInProgress
        ? styles.statusTextInProgress
        : styles.statusTextPending;

  return (
    <ScreenWrapper
      title={t('maintenance.mobile.request.title', 'Maintenance Request')}
      onBackPress={handleBack}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle} numberOfLines={2}>
                {request.serviceLabel}
              </Text>
              <Text style={styles.headerSub}>
                {request.requestCode || request.id}
              </Text>
            </View>
            <View style={[styles.statusPill, statusStyle]}>
              <Text style={[styles.statusText, statusTextStyle]}>
                {getMaintenanceStatusLabel(language, t, request.status)}
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.infoCard}>
              <Text style={styles.label}>{t('maintenance.mobile.request.requestedOn', 'Requested On')}</Text>
              <Text style={styles.valueText}>
                {formatMaintenanceDate(request.requestedOn, language)}
              </Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.label}>{t('maintenance.mobile.request.urgency', 'Urgency')}</Text>
              <Text style={styles.valueText}>
                {getMaintenanceUrgencyLabel(language, t, request.urgencyLevel)}
              </Text>
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.label}>{t('maintenance.mobile.request.problemDescription', 'Problem Description')}</Text>
            <Text style={styles.valueText}>{request.description}</Text>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.label}>{t('maintenance.mobile.request.preferredDateTime', 'Preferred Date & Time')}</Text>
            <Text style={styles.valueText}>{request.preferredDateTime}</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.infoCard}>
              <Text style={styles.label}>{t('maintenance.mobile.request.apartment', 'Apartment')}</Text>
              <Text style={styles.valueText}>{request.apartmentDetails}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.label}>{t('maintenance.mobile.request.contact', 'Contact')}</Text>
              <Text style={styles.valueText}>{request.contactNumber}</Text>
            </View>
          </View>
        </View>

        {showTechnicianCard ? (
          <TouchableOpacity
            style={styles.techCard}
            activeOpacity={0.85}
            onPress={() => setProfileModalVisible(true)}
          >
            <View>
              <Text style={styles.techName}>
                {request.technician?.name || t('maintenance.mobile.technician.title', 'Technician Assigned')}
              </Text>
              <Text style={styles.techRole}>
                {request.technician?.role || t('maintenance.mobile.technician.tapToView', 'Tap to view technicians')}
              </Text>
              <Text style={styles.techPhone}>
                {request.technician?.phone || '-'}
              </Text>
            </View>
            <View style={styles.viewBtn}>
              <Text style={styles.viewBtnText}>{t('maintenance.mobile.technician.viewProfile', 'View / Change')}</Text>
            </View>
          </TouchableOpacity>
        ) : null}
        <View style={{ height: 16 }} />
      </ScrollView>

      <Modal
        visible={profileModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {t('maintenance.mobile.technician.profileTitle', 'Technician Profile')}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setProfileModalVisible(false)}
                style={styles.modalCloseBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCloseText}>X</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              {technicianLoading ? (
                <View style={styles.modalBlock}>
                  <ThemedLoader size="small" />
                </View>
              ) : technicianError ? (
                <View style={styles.modalBlock}>
                  <Text style={styles.label}>{t('maintenance.mobile.request.status', 'Status')}</Text>
                  <Text style={styles.valueText}>{technicianError}</Text>
                </View>
              ) : technicianProfile ? (
                <>
                  <View style={styles.profileHero}>
                    <View style={styles.profileHeroTop}>
                      <View style={styles.profileAvatar}>
                        <Text style={styles.profileAvatarText}>{technicianInitials}</Text>
                      </View>
                      <View style={styles.profileHeroText}>
                        <Text style={styles.profileName}>{technicianProfile.name || '-'}</Text>
                        <Text style={styles.profileRole}>{technicianServiceLabel}</Text>
                      </View>
                    </View>

                    <View style={styles.highlightRow}>
                      <View style={styles.highlightCard}>
                        <Text style={styles.highlightLabel}>
                          {t('maintenance.mobile.technician.experience', 'Experience')}
                        </Text>
                        <Text style={styles.highlightValue}>{technicianExperienceLabel}</Text>
                      </View>
                      <View style={styles.highlightCard}>
                        <Text style={styles.highlightLabel}>
                          {t('maintenance.mobile.technician.skillLevel', 'Skill Level')}
                        </Text>
                        <Text style={styles.highlightValue}>{technicianProfile.skillLevel || '-'}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.modalGrid}>
                    <View style={styles.modalInfoCard}>
                      <Text style={styles.label}>{t('maintenance.mobile.technician.phone', 'Phone')}</Text>
                      <Text style={styles.valueText}>{technicianProfile.phone || '-'}</Text>
                      {technicianProfile.phone ? (
                        <TouchableOpacity
                          style={styles.callActionButton}
                          activeOpacity={0.85}
                          onPress={() => openCall(technicianProfile.phone)}
                        >
                          <CallIcon color={colors.primary} />
                          <Text style={styles.callActionText}>
                            {t('maintenance.mobile.technician.call', 'Call')}
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                    <View style={styles.modalInfoCard}>
                      <Text style={styles.label}>{t('maintenance.mobile.technician.email', 'Email')}</Text>
                      <Text style={styles.valueText}>{technicianProfile.email || '-'}</Text>
                    </View>
                  </View>

                  <View style={styles.modalGrid}>
                    <View style={styles.modalInfoCard}>
                      <Text style={styles.label}>{t('maintenance.mobile.technician.gender', 'Gender')}</Text>
                      <Text style={styles.valueText}>{technicianProfile.gender || '-'}</Text>
                    </View>
                    <View style={styles.modalInfoCard}>
                      <Text style={styles.label}>{t('maintenance.mobile.technician.availability', 'Availability')}</Text>
                      <Text style={styles.valueText}>{technicianProfile.availabilityStatus || '-'}</Text>
                    </View>
                  </View>

                  <View style={styles.modalGrid}>
                    <View style={styles.modalInfoCard}>
                      <Text style={styles.label}>{t('maintenance.mobile.technician.workingHours', 'Working Hours')}</Text>
                      <Text style={styles.valueText}>{technicianProfile.schedule || '-'}</Text>
                    </View>
                    <View style={styles.modalInfoCard}>
                      <Text style={styles.label}>{t('maintenance.mobile.technician.service', 'Service')}</Text>
                      <Text style={styles.valueText}>{technicianServiceLabel}</Text>
                    </View>
                  </View>
                </>
              ) : (
                <View style={styles.modalBlock}>
                  <Text style={styles.valueText}>
                    {t('maintenance.mobile.technician.notAvailable', 'Technician information is not available.')}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
