import React, {useMemo} from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, {Path} from 'react-native-svg';

import ScreenWrapper from '../../../../components/ScreenWrapper';
import {useAppTheme} from '../../../../theme/ThemeProvider';
import {useI18n} from '../../../../i18n';

const PoliciesIcon = ({color}: {color: string}) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 4.75h7.5L19.25 8.5V18A2.25 2.25 0 0117 20.25H8A2.25 2.25 0 015.75 18V7A2.25 2.25 0 018 4.75z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M15.5 4.75V8.5h3.75M9 11h6M9 14.5h6M9 18h4"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChevronRight = ({color}: {color: string}) => (
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

const POLICY_LINKS = [
  {
    id: 'privacy',
    labelKey: 'settings.mobile.policyPrivacy',
    fallback: 'Privacy Policy',
    url: 'https://residenceconnect-dz.com/privacy',
  },
  {
    id: 'legal',
    labelKey: 'settings.mobile.policyLegal',
    fallback: 'Legal Notice',
    url: 'https://residenceconnect-dz.com/legal',
  },
  {
    id: 'cgu',
    labelKey: 'settings.mobile.policyCgu',
    fallback: 'Terms of Use',
    url: 'https://residenceconnect-dz.com/cgu',
  },
] as const;

export default function PoliciesScreen({navigation}: any) {
  const {colors} = useAppTheme();
  const {t} = useI18n();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const {width} = useWindowDimensions();
  const contentWidth = Math.min(width - 32, 520);

  const handleOpenPolicy = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert(
        t('common.error', 'Error'),
        t('settings.mobile.policyOpenError', 'Unable to open this policy right now.'),
      );
    }
  };

  return (
    <ScreenWrapper
      title={t('settings.mobile.policies', 'Privacy Policies')}
      onBackPress={() => navigation.goBack()}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, {width: contentWidth, alignSelf: 'center'}]}>
          <View style={styles.heroIconBox}>
            <PoliciesIcon color={colors.primary} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>
              {t('settings.mobile.policies', 'Privacy Policies')}
            </Text>
            <Text style={styles.heroSubtitle}>
              {t(
                'settings.mobile.policiesDescription',
                'Read our privacy, legal, and terms documents. Tap any item to open it in your browser.',
              )}
            </Text>
          </View>
        </View>

        <View style={[styles.list, {width: contentWidth, alignSelf: 'center'}]}>
          {POLICY_LINKS.map(policy => (
            <TouchableOpacity
              key={policy.id}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => handleOpenPolicy(policy.url)}>
              <View style={styles.cardLeft}>
                <View style={styles.iconWrap}>
                  <PoliciesIcon color="#059669" />
                </View>
                <View style={styles.copy}>
                  <Text style={styles.title}>{t(policy.labelKey, policy.fallback)}</Text>
                  <Text style={styles.url}>{policy.url.replace('https://', '')}</Text>
                </View>
              </View>
              <View style={styles.chevronWrap}>
                <ChevronRight color={colors.textMuted} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors']) =>
  StyleSheet.create({
    heroCard: {
      flexDirection: 'row',
      gap: 14,
      marginTop: 12,
      marginBottom: 16,
      padding: 18,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    heroIconBox: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceMuted,
    },
    heroCopy: {
      flex: 1,
    },
    heroTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    heroSubtitle: {
      fontSize: 13,
      lineHeight: 20,
      color: colors.textMuted,
    },
    list: {
      gap: 10,
      marginBottom: 32,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 14,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceMuted,
    },
    copy: {
      flex: 1,
    },
    title: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 3,
    },
    url: {
      fontSize: 12,
      color: colors.textMuted,
    },
    chevronWrap: {
      width: 30,
      height: 30,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.backgroundAlt,
    },
  });
