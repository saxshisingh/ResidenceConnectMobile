import React, {useEffect, useMemo} from 'react';
import {ActivityIndicator, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';

import {createStyles} from './SmartAccess.styles';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import {useAppTheme} from '../../../../theme/ThemeProvider';
import {useI18n} from '../../../../i18n';

const normalizeRole = (value?: string) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '');

export default function SmartAccessScreen() {
  const navigation = useNavigation<any>();
  const user = useSelector((state: any) => state.auth.user);
  const {colors} = useAppTheme();
  const {t} = useI18n();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const roleRaw =
    user?.data?.roleName || user?.data?.role || user?.data?.userType || '';

  const shouldOpenAdminFirst = useMemo(() => {
    const role = normalizeRole(roleRaw);
    return role === 'admin' || role === 'superadmin';
  }, [roleRaw]);

  useEffect(() => {
    navigation.replace(shouldOpenAdminFirst ? 'TTLockAdmin' : 'UnlockDoor');
  }, [navigation, shouldOpenAdminFirst]);

  return (
    <ScreenWrapper
      title={t('mobile.smartAccess.unlockDoor', 'Unlock Door')}
      onBackPress={() => navigation.goBack()}>
      <View style={[styles.container, {backgroundColor: colors.background}]}>
        <View style={styles.accessStateWrap}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.accessStateText}>
            {t(
              'mobile.smartAccess.openingDevices',
              'Opening your smart access devices...',
            )}
          </Text>
        </View>
      </View>
    </ScreenWrapper>
  );
}
