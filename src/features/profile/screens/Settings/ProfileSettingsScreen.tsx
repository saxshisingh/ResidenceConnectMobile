import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, {Circle, Path} from 'react-native-svg';

import ScreenWrapper from '../../../../components/ScreenWrapper';
import {createStyles} from './ProfileSettingsScreen.styles';
import LanguageIcon from '../../../../assets/Icons/mdi_world-wide-web.svg';
import SettingIcon from '../../../../assets/Icons/material-symbols_settings-outline.svg';
import {useAppTheme} from '../../../../theme/ThemeProvider';
import {useI18n} from '../../../../i18n';
import {useAppDispatch, useAppSelector} from '../../../../redux/hooks';
import {logout} from '../../../auth/state/authSlice';
import {navigationRef} from '../../../../navigation/navigationRef';
import {requestAccountDeletion} from '../../services/accountDeletion';

const ChangePasswordIconBlack = ({color}: {color: string}) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Path d="M7 11V7a5 5 0 0110 0v4" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Circle cx="12" cy="16" r="1.5" fill={color} />
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

const DeleteAccountIcon = ({color}: {color: string}) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 7h16M9 7V5.8c0-.7.6-1.3 1.3-1.3h3.4c.7 0 1.3.6 1.3 1.3V7"
      stroke={color}
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7.5 7l.7 10.2c.1 1 .9 1.8 1.9 1.8h3.8c1 0 1.8-.8 1.9-1.8L16.5 7"
      stroke={color}
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M10 10.5v5M14 10.5v5" stroke={color} strokeWidth={1.9} strokeLinecap="round" />
  </Svg>
);

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

const MENU_ITEMS = (
  t: any,
  navigation: any,
  isDarkMode: boolean,
  onThemeChange: (v: boolean) => void,
  colors: ReturnType<typeof useAppTheme>['colors'],
) => [
  {
    id: 'language',
    label: t('settings.mobile.changeLanguage', 'Change Language'),
    icon: <LanguageIcon width={20} height={20} />,
    color: '#2563EB',
    bg: '#EFF6FF',
    onPress: () => navigation.navigate('Language'),
    type: 'link',
  },
  {
    id: 'password',
    label: t('settings.mobile.changePassword', 'Change Password'),
    icon: <ChangePasswordIconBlack color="#7C3AED" />,
    color: '#7C3AED',
    bg: '#F5F3FF',
    onPress: () => navigation.navigate('ConfirmPassword'),
    type: 'link',
  },
  {
    id: 'policies',
    label: t('settings.mobile.policies', 'Privacy Policies'),
    icon: <PoliciesIcon color="#059669" />,
    color: '#059669',
    bg: colors.surfaceMuted,
    onPress: () => navigation.navigate('Policies'),
    type: 'link',
  },
  {
    id: 'darkmode',
    label: t('settings.mobile.darkMode', 'Dark Mode'),
    icon: <SettingIcon width={20} height={20} />,
    color: '#1F2937',
    bg: '#F3F4F6',
    type: 'toggle',
    toggleValue: isDarkMode,
    onToggle: onThemeChange,
  },
];

export default function ProfileSettingsScreen({navigation}: any) {
  const dispatch = useAppDispatch();
  const {themeMode, setThemeMode, colors} = useAppTheme();
  const {t} = useI18n();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const {width} = useWindowDimensions();
  const contentWidth = Math.min(width - 32, 520);
  const isDarkMode = themeMode === 'dark';
  const user = useAppSelector(state => state.auth.user);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const userEmail = String(user?.data?.email || user?.email || '').trim();

  const onThemeChange = async (value: boolean) => {
    await setThemeMode(value ? 'dark' : 'light');
  };

  const completeDeletionSignOut = () => {
    dispatch(logout());
    navigationRef.reset({
      index: 0,
      routes: [{name: 'Login'}],
    });
  };

  const handleDeleteAccount = () => {
    if (deleteLoading) {
      return;
    }

    if (!userEmail) {
      Alert.alert(
        t('common.error', 'Error'),
        t(
          'settings.mobile.deleteAccountEmailMissing',
          'We could not find your email for this account. Please update your profile or contact support.',
        ),
      );
      return;
    }

    Alert.alert(
      t('settings.mobile.deleteAccountTitle', 'Delete My Account'),
      t(
        'settings.mobile.deleteAccountConfirmMessage',
        'Are you sure you want to delete your account? This action cannot be undone.',
      ),
      [
        {text: t('common.cancel', 'Cancel'), style: 'cancel'},
        {
          text: t('settings.mobile.deleteAccountAction', 'Delete my account'),
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleteLoading(true);
              const message = await requestAccountDeletion({email: userEmail});
              Alert.alert(
                t('common.success', 'Success'),
                message ||
                  t(
                    'settings.mobile.deleteAccountSuccess',
                    'Account deletion request processed successfully.',
                  ),
                [
                  {
                    text: t('common.mobile.common.ok', 'OK'),
                    onPress: completeDeletionSignOut,
                  },
                ],
              );
            } catch (error: any) {
              Alert.alert(
                t('common.error', 'Error'),
                error?.message ||
                  t(
                    'settings.mobile.deleteAccountError',
                    'Unable to process your account deletion request right now.',
                  ),
              );
            } finally {
              setDeleteLoading(false);
            }
          },
        },
      ],
    );
  };

  const items = MENU_ITEMS(t, navigation, isDarkMode, onThemeChange, colors);

  return (
    <ScreenWrapper
      title={t('settings.mobile.title', 'Settings')}
      onBackPress={() => navigation.goBack()}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, {width: contentWidth, alignSelf: 'center'}]}>
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />
          <View style={styles.heroContent}>
            <View style={styles.heroIconBox}>
              <Text style={{fontSize: 18}}>⚙️</Text>
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.heroTitle}>{t('settings.mobile.title', 'Settings')}</Text>
              <Text style={styles.heroSub}>
                {t('settings.mobile.subtitle', 'Manage your app preferences')}
              </Text>
            </View>
          </View>
        </View>

        <Text
          style={[
            styles.sectionTitle,
            {width: contentWidth, alignSelf: 'center', marginHorizontal: 0},
          ]}>
          {t('settings.mobile.preferences', 'PREFERENCES')}
        </Text>

        <View style={[styles.menuList, {width: contentWidth, alignSelf: 'center', marginHorizontal: 0}]}>
          {items.map(item => {
            if (item.type === 'toggle') {
              return (
                <View key={item.id} style={styles.menuItem}>
                  <View style={[styles.menuIconBox, {backgroundColor: item.bg}]}>
                    {item.icon}
                  </View>
                  <Text style={[styles.menuLabel, {color: colors.textPrimary}]}>{item.label}</Text>
                  <Switch
                    value={item.toggleValue}
                    onValueChange={item.onToggle}
                    thumbColor={colors.onPrimary}
                    trackColor={{false: colors.border, true: item.color}}
                  />
                </View>
              );
            }

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={item.onPress}
                activeOpacity={0.8}>
                <View style={[styles.menuIconBox, {backgroundColor: item.bg}]}>{item.icon}</View>
                <Text style={[styles.menuLabel, {color: colors.textPrimary}]}>{item.label}</Text>
                <View style={styles.chevronBox}>
                  <ChevronRight color={colors.textMuted} />
                </View>
              </TouchableOpacity>
            );
          })}

        </View>

        <Text
          style={[
            styles.sectionTitle,
            {width: contentWidth, alignSelf: 'center', marginHorizontal: 0},
          ]}>
          {t('settings.mobile.accountActions', 'ACCOUNT ACTIONS')}
        </Text>

        <TouchableOpacity
          style={[
            styles.menuItem,
            styles.dangerMenuItem,
            {width: contentWidth, alignSelf: 'center', marginHorizontal: 0},
          ]}
          onPress={handleDeleteAccount}
          activeOpacity={0.8}
          disabled={deleteLoading}>
          <View style={[styles.menuIconBox, styles.dangerIconBox]}>
            <DeleteAccountIcon color={colors.danger} />
          </View>
          <View style={styles.dangerContent}>
            <Text style={[styles.menuLabel, styles.dangerLabel]}>
              {t('settings.mobile.deleteAccountAction', 'Delete my account')}
            </Text>
            <Text style={[styles.dangerDescription, {color: colors.textMuted}]}>
              {t(
                'settings.mobile.deleteAccountDescription',
                'Request permanent deletion of your account directly from the app.',
              )}
            </Text>
          </View>
          {deleteLoading ? (
            <ActivityIndicator color={colors.danger} />
          ) : (
            <View style={styles.chevronBox}>
              <ChevronRight color={colors.danger} />
            </View>
          )}
        </TouchableOpacity>

        <Text
          style={[
            styles.sectionTitle,
            {width: contentWidth, alignSelf: 'center', marginHorizontal: 0},
          ]}>
          {t('settings.mobile.about', 'ABOUT')}
        </Text>
        <View style={[styles.aboutCard, {width: contentWidth, alignSelf: 'center'}]}>
          <Text style={[styles.aboutLabel, {color: colors.textMuted}]}>
            {t('settings.mobile.appVersion', 'App Version')}
          </Text>
          <Text style={[styles.aboutValue, {color: colors.textPrimary}]}>1.0.0</Text>
        </View>

        <View style={{height: 40}} />
      </ScrollView>
    </ScreenWrapper>
  );
}
