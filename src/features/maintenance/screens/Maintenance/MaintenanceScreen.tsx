import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';

import ScreenWrapper from '../../../../components/ScreenWrapper';
import { createStyles } from './MaintenanceScreen.styles';
import {
  getMaintenanceCategories,
  MaintenanceCategory,
  ServiceKey,
} from '../../services/maintenanceService';

import ElectricianIcon from '../../../../assets/Icons/electrical_services.svg';
import HousekeepingIcon from '../../../../assets/Icons/house.svg';
import SupportIcon from '../../../../assets/Icons/support_agent.svg';
import PlumbingIcon from '../../../../assets/Icons/plumbing.svg';
import AirIcon from '../../../../assets/Icons/air.svg';
import BoilerIcon from '../../../../assets/Icons/hot_tub.svg';
import MultiSkillIcon from '../../../../assets/Icons/multiline_chart.svg';
import UnknownCategoryIcon from '../../../../assets/Icons/build.svg';
import ThemedLoader from '../../../../components/ThemedLoader';
import { useAppTheme } from '../../../../theme/ThemeProvider';
import { useI18n } from '../../../../i18n';

const toServiceKey = (label: string): ServiceKey => {
  const v = label
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (v.includes('electric')) return 'electrician';
  if (v.includes('house')) return 'housekeeping';
  if (v.includes('support') || v.includes('general')) return 'support';
  if (v.includes('plumb')) return 'plumber';
  if (v.includes('air') || v.includes('ac')) return 'air';
  if (v.includes('boiler') || v.includes('heat')) return 'boiler';
  if (v.includes('multi')) return 'multi';
  return 'support';
};

const resolveCategoryIcon = (categoryName: string) => {
  const key = categoryName
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (key.includes('electric')) return ElectricianIcon;
  if (key.includes('house')) return HousekeepingIcon;
  if (key.includes('plumb')) return PlumbingIcon;
  if (key.includes('air') || key.includes('ac')) return AirIcon;
  if (key.includes('boiler') || key.includes('heat')) return BoilerIcon;
  if (key.includes('multi')) return MultiSkillIcon;
  if (key.includes('support') || key.includes('general')) return SupportIcon;
  return UnknownCategoryIcon;
};

const getGridColumns = (screenWidth: number, screenHeight: number) => {
  const isCompactWidth = screenWidth <= 360;
  const isVeryCompactDevice = screenWidth <= 390 && screenHeight <= 760;
  return isCompactWidth || isVeryCompactDevice ? 2 : 3;
};

const MaintenanceScreen = ({ navigation }: any) => {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const { width, height } = useWindowDimensions();
  const styles = React.useMemo(() => createStyles(colors, width, height), [colors, width, height]);
  const columns = React.useMemo(() => getGridColumns(width, height), [width, height]);
  const [categories, setCategories] = React.useState<MaintenanceCategory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const handleBack = React.useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('MaintenanceHistory');
  }, [navigation]);

  React.useEffect(() => {
    let mounted = true;
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMaintenanceCategories();
        if (mounted) {
          setCategories(data.filter(item => item.isActive));
        }
      } catch (e: any) {
        if (mounted) {
          setError(
            e?.message ||
              t('maintenance.mobile.errorLoadCategories', 'Failed to load service categories'),
          );
          setCategories([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    loadCategories();
    return () => {
      mounted = false;
    };
  }, []);

  const handleServicePress = (category: MaintenanceCategory) => {
    const serviceKey = toServiceKey(category.name);
    navigation.navigate('MaintenanceRaiseRequest', {
      serviceKey,
      serviceLabel: category.name,
      serviceCategoryId: category.id,
    });
  };

  return (
    <ScreenWrapper
      title={t('maintenance.mobile.raiseRequest', 'Raise Maintenance Request')}
      onBackPress={handleBack}
    >
      <View style={styles.container}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ThemedLoader size="large" />
          </View>
        ) : null}
        {!loading && error ? (
          <View style={{ paddingVertical: 20 }}>
            <Text style={{ color: colors.danger, textAlign: 'center' }}>{error}</Text>
          </View>
        ) : null}
        {!loading && !error && categories.length === 0 ? (
          <View style={{ paddingVertical: 20 }}>
            <Text style={{ color: colors.textMuted, textAlign: 'center' }}>
              {t(
                'maintenance.mobile.noActiveCategories',
                'No active service categories available.',
              )}
            </Text>
          </View>
        ) : null}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.grid}
        >
          {categories.map((item, index) => {
            const Icon = resolveCategoryIcon(item.name);
            const isEndOfRow = (index + 1) % columns === 0;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.card,
                  isEndOfRow ? styles.cardNoRightMargin : styles.cardWithRightMargin,
                ]}
                activeOpacity={0.85}
                onPress={() => handleServicePress(item)}
              >
                <View style={styles.iconCircle}>
                  <Icon width={26} height={26} />
                </View>
                <Text style={styles.cardLabel} numberOfLines={2}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default MaintenanceScreen;
