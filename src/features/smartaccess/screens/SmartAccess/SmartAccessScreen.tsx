import React, {useEffect, useMemo} from 'react';
import {ActivityIndicator, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';

import {createStyles} from './SmartAccess.styles';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import {useAppTheme} from '../../../../theme/ThemeProvider';
import {useI18n} from '../../../../i18n';
import Logger from '../../../../services/logger/logger';

const normalizeRole = (value?: string | null) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '');

export default function SmartAccessScreen() {
  const navigation = useNavigation<any>();

  const user = useSelector(
    (state: any) => state.auth.user,
  );

  /*
   * AuthProvider stores the profile directly:
   *
   * state.auth.user = {
   *   userId,
   *   residentId,
   *   apartmentId,
   *   blockId,
   *   residenceId,
   *   roleName,
   *   ...
   * }
   *
   * Keep fallback support for the old { data: {...} } structure.
   */
  const userData = user?.data ?? user ?? null;

  const {colors} = useAppTheme();
  const {t} = useI18n();

  const styles = useMemo(
    () => createStyles(colors),
    [colors],
  );

  /**
   * Get role from the normalized user object.
   */
  const roleRaw =
    userData?.roleName ||
    userData?.role ||
    userData?.userType ||
    '';

  const normalizedRole = useMemo(
    () => normalizeRole(roleRaw),
    [roleRaw],
  );

  const shouldOpenAdminFirst =
    normalizedRole === 'administrator' ||
    normalizedRole === 'superadmin';

  useEffect(() => {
    Logger.screen('SmartAccessScreen Mounted');

    Logger.info('[SmartAccess] User resolved', {
      userData,
      roleRaw,
      normalizedRole,
      shouldOpenAdminFirst,
    });

    return () => {
      Logger.screen('SmartAccessScreen Unmounted');
    };
  }, [
    userData,
    roleRaw,
    normalizedRole,
    shouldOpenAdminFirst,
  ]);

  useEffect(() => {
    // Don't navigate until we actually have a role.
    if (!roleRaw) {
      Logger.info(
        '[SmartAccess] Role not available yet. Waiting...',
      );
      return;
    }

    const destination = shouldOpenAdminFirst
      ? 'TTLockAdmin'
      : 'UnlockDoor';

    Logger.info('[SmartAccess] Navigation decision', {
      roleRaw,
      normalizedRole,
      shouldOpenAdminFirst,
      destination,
    });

    try {
      navigation.replace(destination);

      Logger.info(
        '[SmartAccess] navigation.replace() called',
        {
          destination,
        },
      );
    } catch (error) {
      Logger.error(
        '[SmartAccess] navigation.replace() failed',
        error,
      );
    }
  }, [
    navigation,
    roleRaw,
    normalizedRole,
    shouldOpenAdminFirst,
  ]);

  return (
    <ScreenWrapper
      title={t(
        'mobile.smartAccess.unlockDoor',
        'Unlock Door',
      )}
      onBackPress={() => {
        Logger.info('[SmartAccess] Back pressed');
        navigation.goBack();
      }}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
          },
        ]}
        onTouchStart={() => {
          Logger.info('[SmartAccess] ROOT TOUCH');
        }}>
        <View style={styles.accessStateWrap}>
          <ActivityIndicator
            size="small"
            color={colors.primary}
          />

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