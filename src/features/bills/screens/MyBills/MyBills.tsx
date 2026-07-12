// MyBillsScreen.tsx - Elegantly Redesigned
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, useWindowDimensions } from 'react-native';

import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import { fetchBills } from '../../state/billsSlice';
import BillItem from './BillItem';
import BillPdfModal from '../../../../components/PdfModal';
import ThemedLoader from '../../../../components/ThemedLoader';
import EmptyState from '../../../../components/EmptyState';
import { useAppTheme } from '../../../../theme/ThemeProvider';
import { useI18n } from '../../../../i18n';
import { createStyles } from './MyBillsScreen.styles';

import WaterIcon from '../../../../assets/Icons/water_drop.svg';
import ElectricityIcon from '../../../../assets/Icons/Group 169 (1).svg';
import GasIcon from '../../../../assets/Icons/gas_meter.svg';
import BillsIllustration from '../../../../assets/Icons/Folder_file_alt_fill.svg';

const iconMap: Record<string, React.ComponentType<any>> = {
  Electricity: ElectricityIcon,
  Water: WaterIcon,
  Gas: GasIcon,
};

const resolveBillIcon = (billType?: string) => {
  const type = String(billType || '').trim().toLowerCase();
  if (type.includes('water')) return WaterIcon;
  if (type.includes('electric')) return ElectricityIcon;
  if (type.includes('gas')) return GasIcon;
  return ElectricityIcon;
};

const isUtilityBill = (billType?: string) => {
  const type = String(billType || '').trim().toLowerCase();
  return type.includes('water') || type.includes('electric') || type.includes('gas');
};

type BillsTabKey = 'UNPAID' | 'PAID' | 'UTILITY';

const MyBills = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 32, 520);

  const user = useAppSelector(state => state.auth.user);
  const { list, loading } = useAppSelector(state => state.bills);
  const residentId = user?.data?.residentId;
  const safeBills = Array.isArray(list) ? list.filter(Boolean) : [];
  const utilityBills = useMemo(
    () => safeBills.filter(bill => isUtilityBill(bill?.billType)),
    [safeBills],
  );
  const nonUtilityBills = useMemo(
    () => safeBills.filter(bill => !isUtilityBill(bill?.billType)),
    [safeBills],
  );

  const tabs = [
    { key: 'UNPAID', label: t('bills.mobile.unpaid', 'Unpaid') },
    { key: 'PAID', label: t('bills.mobile.paid', 'Paid') },
    { key: 'UTILITY', label: t('bills.mobile.utilityBills', 'Utilities') },
  ];

  const [activeTab, setActiveTab] = useState<BillsTabKey>('UNPAID');
  const [pdfVisible, setPdfVisible] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);

  useEffect(() => {
    if (residentId) {
      dispatch(fetchBills(residentId));
    }
  }, [residentId, dispatch]);

  const filteredBills = useMemo(
    () =>
      activeTab === 'UTILITY'
        ? utilityBills
        : nonUtilityBills.filter(bill => bill?.status === activeTab),
    [activeTab, nonUtilityBills, utilityBills],
  );

  const unpaidCount = useMemo(
    () => nonUtilityBills.filter(bill => bill?.status === 'UNPAID').length,
    [nonUtilityBills],
  );
  const paidCount = useMemo(
    () => nonUtilityBills.filter(bill => bill?.status === 'PAID').length,
    [nonUtilityBills],
  );
  const utilityCount = useMemo(() => utilityBills.length, [utilityBills]);
  const totalDue = useMemo(
    () =>
      safeBills
        .filter(bill => bill?.status === 'UNPAID')
        .reduce((sum, bill) => sum + Number(bill?.amount || 0), 0),
    [safeBills],
  );
  const dueAmountLabel = totalDue.toLocaleString('fr-DZ');

  const handleBillPress = (bill: any) => {
    if (!bill) {
      return;
    }
    setSelectedBill(bill);
    setPdfVisible(true);
  };

  const handleCloseModal = () => {
    setPdfVisible(false);
    setSelectedBill(null);
  };

  return (
    <ScreenWrapper
      title={t('home.mobile.myBills', 'My Bills')}
      onBackPress={() => navigation.goBack()}
    >
      <View style={styles.root}>
        <View style={[styles.heroCard, { width: contentWidth, alignSelf: 'center' }]}>
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />
          <View style={styles.heroContent}>
            <View style={styles.heroIconBox}>
              <Text style={{ fontSize: 18 }}>M</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>{t('home.mobile.myBills', 'My Bills')}</Text>
              <Text style={styles.heroSub}>
                {t('bills.mobile.heroSubtitle', 'Track and manage your utility bills')}
              </Text>
            </View>
          </View>
          <View style={styles.heroStats}>
            <View style={[styles.heroStat, { backgroundColor: '#EF4444' }]}>
              <Text style={styles.heroStatNum}>{unpaidCount}</Text>
              <Text style={styles.heroStatLabel}>
                {t('bills.mobile.unpaidLabel', 'UNPAID')}
              </Text>
            </View>
            <View style={[styles.heroStat, { backgroundColor: '#22C55E' }]}>
              <Text style={styles.heroStatNum}>{paidCount}</Text>
              <Text style={styles.heroStatLabel}>
                {t('bills.mobile.paidLabel', 'PAID')}
              </Text>
            </View>
            <View style={[styles.heroStat, { backgroundColor: '#10B981' }]}>
              <Text style={styles.heroStatCurrency}>DZD</Text>
              <Text
                style={styles.heroStatAmount}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
              >
                {dueAmountLabel}
              </Text>
              <Text style={styles.heroStatLabel}>
                {t('bills.mobile.dueLabel', 'DUE')}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.container, { width: contentWidth, alignSelf: 'center' }]}>
          <View style={[styles.tabsWrapper, { paddingHorizontal: 0 }]}>
            <View style={styles.tabs}>
              {tabs.map(tab => (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tab, activeTab === tab.key && styles.activeTab]}
                  onPress={() => setActiveTab(tab.key as BillsTabKey)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
                    {tab.label}
                    {tab.key === 'UNPAID' && unpaidCount > 0 ? `  ${unpaidCount}` : ''}
                    {tab.key === 'PAID' && paidCount > 0 ? `  ${paidCount}` : ''}
                    {tab.key === 'UTILITY' && utilityCount > 0 ? `  ${utilityCount}` : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {loading && filteredBills.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ThemedLoader size="large" />
              <Text style={styles.loadingText}>{t('bills.mobile.loading', 'Loading bills...')}</Text>
            </View>
          ) : (
            <FlatList
              data={filteredBills}
              keyExtractor={(item, index) => String(item?.id || index)}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <BillItem
                  item={item}
                  IconComponent={iconMap[String(item?.billType || '')] || resolveBillIcon(item?.billType)}
                  onPress={() => handleBillPress(item)}
                />
              )}
              contentContainerStyle={[
                styles.listContent,
                { paddingHorizontal: 0 },
                filteredBills.length === 0 && styles.listContentEmpty,
              ]}
              ListEmptyComponent={
                <EmptyState
                  title={
                    activeTab === 'UNPAID'
                      ? t('bills.mobile.noUnpaidBills', 'No unpaid bills')
                      : activeTab === 'PAID'
                        ? t('bills.mobile.noPaidBills', 'No paid bills')
                        : t('bills.mobile.noUtilityBills', 'No utility bills')
                  }
                  description={
                    activeTab === 'UNPAID'
                      ? t('bills.mobile.allCaughtUp', "You're all caught up!")
                      : activeTab === 'PAID'
                        ? t('bills.mobile.paidBillsAppearHere', 'Paid bills will appear here')
                        : t(
                            'bills.mobile.utilityBillsAppearHere',
                            'Water, gas, and electricity bills will appear here',
                          )
                  }
                  illustration={<BillsIllustration width={72} height={72} />}
                />
              }
              refreshing={loading && filteredBills.length > 0}
              onRefresh={() => {
                if (residentId) {
                  dispatch(fetchBills(residentId));
                }
              }}
            />
          )}
        </View>
      </View>

      <BillPdfModal
        visible={pdfVisible}
        bill={selectedBill}
        billFilePath={selectedBill?.billFilePath}
        onClose={handleCloseModal}
      />
    </ScreenWrapper>
  );
};

export default MyBills;
