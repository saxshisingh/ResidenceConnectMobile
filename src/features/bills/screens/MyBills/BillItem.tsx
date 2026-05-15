import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useAppTheme } from '../../../../theme/ThemeProvider';
import { createStyles } from './MyBillsScreen.styles';
import { BillItem as Bill } from '../../services/billsService';
import { useI18n } from '../../../../i18n';

interface Props {
  item?: Bill | null;
  IconComponent?: React.ComponentType<any>;
  onPress: () => void;
}

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

const BILL_CONFIG: Record<string, { color: string; bg: string; accent: string }> = {
  Water: { color: '#38BDF8', bg: '#F0F9FF', accent: '#38BDF8' },
  Electricity: { color: '#EAB308', bg: '#FEFCE8', accent: '#EAB308' },
  Gas: { color: '#F97316', bg: '#FFF7ED', accent: '#F97316' },
};

const getBillConfig = (billType?: string) => {
  const type = String(billType || '').trim().toLowerCase();
  if (type.includes('water')) return BILL_CONFIG.Water;
  if (type.includes('electric')) return BILL_CONFIG.Electricity;
  if (type.includes('gas')) return BILL_CONFIG.Gas;
  return { color: '#10B981', bg: '#ECFDF5', accent: '#10B981' };
};

const isUtilityBill = (billType?: string) => {
  const type = String(billType || '').trim().toLowerCase();
  return type.includes('water') || type.includes('electric') || type.includes('gas');
};

const formatDate = (dateString?: string) => {
  if (!dateString) {
    return '-';
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

const formatAmount = (amount?: number) => `DZD ${Number(amount || 0).toLocaleString('fr-DZ')}`;

const getLocalizedBillType = (
  billType: unknown,
  t: (key: string, fallback?: string) => string,
) => {
  const raw = String(billType || '').trim();
  const normalized = raw.toLowerCase();

  if (!raw) {
    return t('bills.mobile.viewer.bill', 'Bill');
  }
  if (normalized.includes('maintenance')) {
    return t('bills.mobile.types.maintenance', 'Maintenance');
  }
  if (normalized.includes('water')) {
    return t('bills.mobile.types.water', 'Water');
  }
  if (normalized.includes('electric')) {
    return t('bills.mobile.types.electricity', 'Electricity');
  }
  if (normalized.includes('gas')) {
    return t('bills.mobile.types.gas', 'Gas');
  }

  return raw;
};

const BillItem = ({ item, IconComponent, onPress }: Props) => {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!item) {
    return null;
  }

  const cfg = getBillConfig(item.billType);
  const isPaid = item.status === 'PAID';
  const billTypeLabel = getLocalizedBillType(item.billType, t);
  const utilityBill = isUtilityBill(item.billType);
  const title = billTypeLabel;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.cardAccentBar, { backgroundColor: cfg.accent }]} />

      <View style={[styles.iconContainer, { backgroundColor: cfg.bg }]}>
        {IconComponent ? (
          <IconComponent width={24} height={24} />
        ) : (
          <Text style={{ fontSize: 13, fontWeight: '700', color: cfg.color }}>
            {billTypeLabel.slice(0, 1).toUpperCase()}
          </Text>
        )}
      </View>

      <View style={styles.billInfo}>
        <Text style={styles.billType}>{title}</Text>
        <Text style={styles.billDate}>{formatDate(item.createdOn)}</Text>
        {!utilityBill ? (
          <View
            style={[
              styles.statusChip,
              { backgroundColor: isPaid ? '#F0FDF4' : '#FEF2F2' },
            ]}
          >
            <Text
              style={[
                styles.statusChipText,
                { color: isPaid ? '#16A34A' : '#EF4444' },
              ]}
            >
              {isPaid ? t('bills.mobile.paid', 'Paid') : t('bills.mobile.unpaid', 'Unpaid')}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.cardRight}>
        {utilityBill ? (
          <Text style={[styles.amountHint, { color: colors.textMuted }]}>
            {t('bills.mobile.viewBill', 'View bill')}
          </Text>
        ) : (
          <Text style={[styles.amount, { color: isPaid ? '#6B7280' : colors.textPrimary }]}>
            {formatAmount(item.amount)}
          </Text>
        )}
        <View style={styles.chevronBox}>
          <ChevronRight color={colors.textMuted} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default BillItem;
