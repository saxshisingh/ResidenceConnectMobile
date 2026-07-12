import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { CommonActions } from '@react-navigation/native';

import { createStyles } from './MaintenanceRequestSuccessScreen.styles';
import { useAppTheme } from '../../../../theme/ThemeProvider';
import { useI18n } from '../../../../i18n';

export default function MaintenanceRequestSuccessScreen({ navigation }: any) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  useEffect(() => {
    const timeout = setTimeout(() => {
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            { name: 'MainTabs' },
            { name: 'MaintenanceHistory' },
          ],
        }),
      );
    }, 2500);

    return () => clearTimeout(timeout);
  }, [navigation]);

  return (
    <View style={styles.screen}>
      <View style={styles.iconCircle}>
        <Text style={styles.checkText}>{t('common.mobile.common.ok', 'OK')}</Text>
      </View>
      <Text style={styles.title}>{t('maintenance.mobile.success.title', 'Your request has been submitted!')}</Text>
      <Text style={styles.subtitle}>{t('maintenance.mobile.success.subtitle', 'Our team will contact you shortly.')}</Text>
    </View>
  );
}
