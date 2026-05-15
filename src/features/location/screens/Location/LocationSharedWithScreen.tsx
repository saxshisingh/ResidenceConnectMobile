import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { createStyles } from './LocationFlow.styles';
import SettingIcon from '../../../../assets/Icons/icon setting.svg';
import CheckIcon from '../../../../assets/Icons/check_circle.svg';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import { useAppTheme } from '../../../../theme/ThemeProvider';
import { useI18n } from '../../../../i18n';

const sharedPeople = [
  { id: '1', name: 'Father', status: 'Viewing now', online: true, avatar: 'F' },
  { id: '2', name: 'Mother', status: 'Last seen 5 min ago', online: false, avatar: 'M' },
  { id: '3', name: 'Security Gate', status: 'Viewing now', online: true, avatar: 'S' },
];

export default function LocationSharedWithScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <ScreenWrapper
      title={t('location.mobile.sharedWith', 'Shared With')}
      onBackPress={() => navigation.goBack()}
      rightIcon={
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('ShareSettings')}
        >
          <SettingIcon width={20} height={20} />
        </TouchableOpacity>
      }
    >
      <ScrollView style={styles.page}>
        <View style={styles.sharedContainer}>
          <Text style={styles.sharedMainTitle}>{t('location.mobile.activeViewers', 'Active viewers')}</Text>
          <Text style={styles.sharedMainDesc}>
            {t('location.mobile.sharedWithCount', 'Your live location is shared with')} {sharedPeople.length} {t('location.mobile.contacts', 'contacts')}.
          </Text>

          {sharedPeople.map(person => (
            <View style={styles.personCard} key={person.id}>
              <View style={styles.personAvatar}>
                <Text style={styles.avatarEmoji}>{person.avatar}</Text>
                {person.online && <View style={styles.onlineDot} />}
              </View>
              <View style={styles.personInfo}>
                <Text style={styles.personName}>{person.name}</Text>
                <Text
                  style={[
                    styles.personStatus,
                    person.online && styles.personStatusOnline,
                  ]}
                >
                  {person.status}
                </Text>
              </View>
              <View style={styles.checkCircle}>
                <CheckIcon width={20} height={20} />
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={styles.manageSettingsBtn}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ShareSettings')}
          >
            <SettingIcon width={18} height={18} />
            <Text style={styles.manageSettingsBtnText}>
              {t('location.mobile.manageShareSettings', 'Manage Share Settings')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addMoreBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.addMoreBtnText}>{t('location.mobile.addMorePeople', 'Add More People')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
