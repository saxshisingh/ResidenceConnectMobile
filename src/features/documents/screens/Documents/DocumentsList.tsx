import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';

import { createStyles } from './Documents.styles';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import EmptyState from '../../../../components/EmptyState';
import { useAppSelector } from '../../../../redux/hooks';
import { useAppTheme } from '../../../../theme/ThemeProvider';
import { useI18n } from '../../../../i18n';
import NoDocumentsIllustration from './NoDocumentsIllustration';
import { getEntityFiles, ResidentFileDto } from '../../services/documentsService';
import { getVehiclesByResident } from '../../../vehicle/services/vehicleService';

import GovtIdIcon from '../../../../assets/Icons/GovID.svg';
import AddressIcon from '../../../../assets/Icons/AddProff.svg';
import VehicleIcon from '../../../../assets/Icons/Rc.svg';
import SocietyIcon from '../../../../assets/Icons/NOC.svg';

const ChevronRight = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18l6-6-6-6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const DocumentsHeroIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V9zm0 0v7h7"
      stroke="#FFFFFF"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 13h6M9 17h6"
      stroke="#FFFFFF"
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

const DOC_CONFIG: Record<string, { color: string; bg: string; accent: string }> = {
  'Profile Photo': { color: '#EC4899', bg: '#FCE7F3', accent: '#EC4899' },
  'Government ID': { color: '#8B5CF6', bg: '#EDE9FE', accent: '#8B5CF6' },
  'Address Proof': { color: '#2563EB', bg: '#EFF6FF', accent: '#2563EB' },
  'Vehicle Document (RC)': { color: '#F59E0B', bg: '#FEF3C7', accent: '#F59E0B' },
  'Society NOC': { color: '#10B981', bg: '#ECFDF5', accent: '#10B981' },
};

export default function DocumentsListScreen({ navigation }: any) {
  const user = useAppSelector(state => state.auth.user);
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 32, 520);
  const residentId = user?.data?.residentId;

  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<ResidentFileDto[]>([]);

  const documentCards = useMemo(
    () => [
      {
        type: 'Profile Photo',
        title: t('documents.mobile.types.profilePhoto', 'Profile Photo'),
        icon: GovtIdIcon,
      },
      {
        type: 'Government ID',
        title: t('documents.mobile.types.governmentId', 'Government ID'),
        icon: GovtIdIcon,
      },
      {
        type: 'Address Proof',
        title: t('documents.mobile.types.addressProof', 'Address Proof'),
        icon: AddressIcon,
      },
      {
        type: 'Vehicle Document (RC)',
        title: t('documents.mobile.types.vehicleDocument', 'Vehicle Document (RC)'),
        icon: VehicleIcon,
      },
      {
        type: 'Society NOC',
        title: t('documents.mobile.types.societyNoc', 'Society NOC'),
        icon: SocietyIcon,
      },
    ],
    [t],
  );

  const loadFiles = useCallback(async () => {
    if (!residentId) {
      setFiles([]);
      return;
    }

    try {
      setLoading(true);
      const residentFilesPromise = getEntityFiles(String(residentId));
      const vehiclesPromise = getVehiclesByResident(String(residentId)).catch(() => []);

      const [residentFiles, vehicles] = await Promise.all([
        residentFilesPromise,
        vehiclesPromise,
      ]);

      const vehicleIds = Array.isArray(vehicles)
        ? vehicles
            .map((vehicle: any) => String(vehicle?.vehicleId || vehicle?.id || '').trim())
            .filter(Boolean)
        : [];

      const vehicleFileGroups = await Promise.all(
        vehicleIds.map(vehicleId =>
          getEntityFiles(vehicleId).catch(() => [] as ResidentFileDto[]),
        ),
      );

      const mergedFiles = [...residentFiles, ...vehicleFileGroups.flat()];
      const uniqueFiles = mergedFiles.filter(
        (file, index, list) =>
          index === list.findIndex(item => item.fileId === file.fileId),
      );

      setFiles(uniqueFiles);
    } catch (error: any) {
      Alert.alert(
        t('common.error', 'Error'),
        error?.message || t('documents.mobile.loadError', 'Failed to load documents'),
      );
    } finally {
      setLoading(false);
    }
  }, [residentId, t]);

  useFocusEffect(
    useCallback(() => {
      loadFiles();
    }, [loadFiles]),
  );

  const getFilesByType = useCallback(
    (documentType: string) =>
      files
        .filter(file => file.documentType?.toLowerCase() === documentType.toLowerCase())
        .sort((a, b) => {
          const aTime = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
          const bTime = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
          return bTime - aTime;
        }),
    [files],
  );

  const visibleCards = documentCards.filter(card => getFilesByType(card.type).length > 0);

  const openDocumentViewer = (documentType: string, title: string) => {
    navigation.navigate('DocumentViewer', {
      title,
      files: getFilesByType(documentType),
    });
  };

  return (
    <ScreenWrapper
      title={t('documents.mobile.title', 'Documents')}
      onBackPress={() => navigation.goBack()}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          <View style={[styles.heroCard, { width: contentWidth, alignSelf: 'center' }]}>
            <View style={styles.heroCircle1} />
            <View style={styles.heroCircle2} />
            <View style={styles.heroContent}>
              <View style={styles.heroIconBox}>
                <DocumentsHeroIcon />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroTitle}>{t('documents.mobile.title', 'Documents')}</Text>
              </View>
            </View>
            <View style={styles.heroStats}>
              <View
                style={[
                  styles.heroStat,
                  { backgroundColor: '#8B5CF6', width: '100%' },
                ]}
              >
                <Text style={styles.heroStatNum}>{files.length}</Text>
                <Text style={styles.heroStatLabel}>
                  {t('documents.mobile.filesLabel', 'FILES')}
                </Text>
              </View>
            </View>
          </View>

          {loading ? (
            <View style={styles.centerState}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={[styles.stateText, { color: colors.textMuted }]}>
                {t('documents.mobile.loading', 'Loading documents...')}
              </Text>
            </View>
          ) : visibleCards.length === 0 ? (
            <EmptyState
              title={t('documents.mobile.emptyFound', 'No documents found')}
              description={t('documents.mobile.emptyListDescription', 'Nothing to show here')}
              illustration={<NoDocumentsIllustration />}
            />
          ) : (
            <>
              {visibleCards.map(card => {
                const Icon = card.icon;
                const docsByType = getFilesByType(card.type);
                const cfg = DOC_CONFIG[card.type] ?? {
                  color: '#8B5CF6',
                  bg: '#EDE9FE',
                  accent: '#8B5CF6',
                };

                return (
                  <View
                    key={card.title}
                    style={[styles.card, { width: contentWidth, alignSelf: 'center' }]}
                  >
                    <View style={[styles.cardAccent, { backgroundColor: cfg.accent }]} />

                    <TouchableOpacity
                      style={styles.cardMain}
                      onPress={() => openDocumentViewer(card.type, card.title)}
                      activeOpacity={0.85}
                    >
                      <View style={[styles.cardIconBox, { backgroundColor: cfg.bg }]}>
                        <Icon width={28} height={28} />
                      </View>

                      <View style={styles.cardLeft}>
                        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                          {card.title}
                        </Text>
                        <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
                          {t(
                            docsByType.length === 1
                              ? 'documents.mobile.filesUploadedSingle'
                              : 'documents.mobile.filesUploadedPlural',
                            docsByType.length === 1 ? '1 file uploaded' : '{{count}} files uploaded',
                          ).replace('{{count}}', String(docsByType.length))}
                        </Text>
                        <View style={[styles.uploadedBadge, { backgroundColor: cfg.bg }]}>
                          <Text style={[styles.uploadedBadgeText, { color: cfg.color }]}>
                            {t('documents.mobile.viewFiles', 'Tap to view files')}
                          </Text>
                        </View>
                        <Text
                          style={[styles.cardFilesPreview, { color: colors.textMuted }]}
                          numberOfLines={2}
                        >
                          {docsByType.map(file => file.fileName).join(', ')}
                        </Text>
                      </View>

                      <View style={styles.chevronBox}>
                        <ChevronRight color={colors.textMuted} />
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </>
          )}
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}
