import React, { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ScreenWrapper from '../../../../components/ScreenWrapper';
import { createStyles } from './MaintenanceHistoryScreen.styles';
import {
  formatMaintenanceDate,
  getMaintenanceStatusLabel,
  MaintenanceRequestItem,
} from '../../services/maintenanceService';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { fetchMaintenanceHistory } from '../../state/maintenanceSlice';

import ElectricianIcon from '../../../../assets/Icons/electrical_services.svg';
import HousekeepingIcon from '../../../../assets/Icons/house.svg';
import SupportIcon from '../../../../assets/Icons/support_agent.svg';
import PlumbingIcon from '../../../../assets/Icons/plumbing.svg';
import AirIcon from '../../../../assets/Icons/air.svg';
import BoilerIcon from '../../../../assets/Icons/hot_tub.svg';
import MultiSkillIcon from '../../../../assets/Icons/multiline_chart.svg';
import ThemedLoader from '../../../../components/ThemedLoader';
import EmptyState from '../../../../components/EmptyState';
import MaintenanceIllustration from '../../../../assets/Icons/support_agent.svg';
import { useAppTheme } from '../../../../theme/ThemeProvider';
import { useI18n } from '../../../../i18n';

const ICON_MAP = {
  electrician: ElectricianIcon,
  housekeeping: HousekeepingIcon,
  support: SupportIcon,
  plumber: PlumbingIcon,
  air: AirIcon,
  boiler: BoilerIcon,
  multi: MultiSkillIcon,
};

const MaintenanceHistoryScreen = ({ navigation }: any) => {
  const { colors } = useAppTheme();
  const { language, t } = useI18n();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const handleBack = React.useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('MainTabs');
  }, [navigation]);
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const requests = useAppSelector(state => state.maintenance.history);
  const loading = useAppSelector(state => state.maintenance.historyLoading);
  const error = useAppSelector(state => state.maintenance.historyError);

  const fetchHistory = useCallback(async () => {
    const residentId = user?.data?.residentId;
    if (!residentId) {
      return;
    }
    dispatch(fetchMaintenanceHistory(residentId));
  }, [dispatch, user?.data?.residentId]);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory]),
  );

  const openDetails = useCallback(
    (requestId: string) => {
      navigation.navigate('MaintenanceRequestDetail', { requestId });
    },
    [navigation],
  );

  const renderItem = ({ item }: { item: MaintenanceRequestItem }) => {
    const isCompleted = item.status === 'Completed';
    const isInProgress = item.status === 'In Progress';
    const Icon = ICON_MAP[item.serviceKey as keyof typeof ICON_MAP];

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => {
          const requestId = (item.id || '').trim();
          if (!requestId) {
            Alert.alert(
              t('common.error', 'Error'),
              t(
                'maintenance.mobile.history.invalidRequestId',
                'This request does not have a valid id.'
              )
            );
            return;
          }
          openDetails(requestId);
        }}
      >
        <View style={styles.iconCircle}>
          <Icon width={24} height={24} />
        </View>
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>{item.serviceLabel}</Text>
          </View>
          <Text style={styles.subtitle} numberOfLines={2}>{item.description}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.dateText}>
              {formatMaintenanceDate(item.requestedOn, language)}
            </Text>
            <View
              style={[
                styles.statusPill,
                isCompleted
                  ? styles.statusPillCompleted
                  : isInProgress
                    ? styles.statusPillInProgress
                    : styles.statusPillPending,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  isCompleted
                    ? styles.statusTextCompleted
                    : isInProgress
                      ? styles.statusTextInProgress
                      : styles.statusTextPending,
                ]}
              >
                {getMaintenanceStatusLabel(language, t, item.status)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper
      title={t('maintenance.mobile.history.title', 'Maintenance History')}
      onBackPress={handleBack}
    >
      <View style={styles.container}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ThemedLoader size="large" />
          </View>
        ) : (
          <>
            {error ? (
              <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
                <Text style={{ color: colors.danger, fontSize: 13 }}>{error}</Text>
              </View>
            ) : null}

        <FlatList
          data={requests}
          keyExtractor={(item, index) => {
            if (item.id && item.id.trim().length > 0) {
              return item.id;
            }
            const fallback = `${item.serviceLabel}-${item.requestedOn}-${item.description}`;
            return `${fallback}-${index}`;
          }}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              title={t(
                'maintenance.mobile.history.emptyTitle',
                'No maintenance requests found'
              )}
              description={t(
                'maintenance.mobile.history.emptyDesc',
                'Raise a request to get help from the maintenance team.'
              )}
              illustration={<MaintenanceIllustration width={72} height={72} />}
            />
          }
          refreshing={loading}
          onRefresh={fetchHistory}
        />
          </>
        )}
        <TouchableOpacity
          style={[styles.addButton, { bottom: Math.max(insets.bottom, 16) + 12 }]}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('MaintenanceRaiseCategory')}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

export default MaintenanceHistoryScreen;

