import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { createStyles } from './LocationFlow.styles';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import ThemedLoader from '../../../../components/ThemedLoader';
import { useAppTheme } from '../../../../theme/ThemeProvider';
import { useI18n } from '../../../../i18n';

export default function ShareSettingsScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [selectedDuration, setSelectedDuration] = useState('unlimited');
  const [saving, setSaving] = useState(false);
  const durations = useMemo(
    () => [
      { label: t('location.mobile.durationUntilOff', 'Until Turned Off'), value: 'unlimited' },
      { label: t('location.mobile.duration15Min', '15 minutes'), value: '15min' },
      { label: t('location.mobile.duration30Min', '30 minutes'), value: '30min' },
      { label: t('location.mobile.duration1Hour', '1 hour'), value: '1hour' },
      { label: t('location.mobile.duration3Hours', '3 hours'), value: '3hours' },
      { label: t('location.mobile.duration24Hours', '24 hours'), value: '24hours' },
    ],
    [t]
  );

  const contacts = useMemo(
    () => [
      { id: '1', name: t('location.mobile.contactFather', 'Father'), selected: true },
      { id: '2', name: t('location.mobile.contactMother', 'Mother'), selected: true },
      { id: '3', name: t('location.mobile.contactSecurityGate', 'Security Gate'), selected: true },
      { id: '4', name: t('location.mobile.contactBrother', 'Brother'), selected: false },
      { id: '5', name: t('location.mobile.contactSister', 'Sister'), selected: false },
    ],
    [t]
  );

  const [selectedContacts, setSelectedContacts] = useState(
    contacts.filter(c => c.selected).map(c => c.id)
  );

  const toggleContact = (id: string) => {
    if (selectedContacts.includes(id)) {
      setSelectedContacts(selectedContacts.filter(cid => cid !== id));
    } else {
      setSelectedContacts([...selectedContacts, id]);
    }
  };

  const handleSave = async () => {
    if (selectedContacts.length === 0) {
      Alert.alert(
        t('location.mobile.noContactsSelected', 'No Contacts Selected'),
        t('location.mobile.selectAtLeastOne', 'Please select at least one contact to share with.')
      );
      return;
    }

    setSaving(true);
    await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
    setSaving(false);

    Alert.alert(t('location.mobile.settingsSaved', 'Settings Saved'), t('location.mobile.settingsUpdated', 'Location sharing settings updated successfully!'), [
      { text: t('common.mobile.common.ok', 'OK'), onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <ScreenWrapper
      title={t('location.mobile.shareSettings', 'Share Settings')}
      onBackPress={() => navigation.goBack()}
    >
      <ScrollView style={styles.page}>
        <View style={styles.settingsContainer}>
          {/* Choose Contacts */}
          <Text style={styles.sectionTitle}>{t('location.mobile.chooseContacts', 'Choose Contacts')}</Text>
          <Text style={styles.sectionDesc}>
            {t('location.mobile.selectWhoCanSee', 'Select who can see your location')}
          </Text>

          {contacts.map(contact => {
            const isSelected = selectedContacts.includes(contact.id);
            return (
              <TouchableOpacity
                key={contact.id}
                style={[
                  styles.contactItem,
                  isSelected && styles.contactItemSelected,
                ]}
                activeOpacity={0.7}
                onPress={() => toggleContact(contact.id)}
              >
                <View style={styles.checkbox}>
                  {isSelected && <View style={styles.checkboxInner} />}
                </View>
                <Text style={styles.contactItemText}>{contact.name}</Text>
              </TouchableOpacity>
            );
          })}

          {/* Share Duration */}
          <Text style={[styles.sectionTitle, styles.sectionTitleSpacing]}>
            {t('location.mobile.shareDuration', 'Share Duration')}
          </Text>
          <Text style={styles.sectionDesc}>
            {t('location.mobile.howLongShare', 'How long should your location be shared?')}
          </Text>

          {durations.map(duration => {
            const isSelected = selectedDuration === duration.value;
            return (
              <TouchableOpacity
                key={duration.value}
                style={styles.durationItem}
                activeOpacity={0.7}
                onPress={() => setSelectedDuration(duration.value)}
              >
                <View style={styles.radioOuter}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.durationText}>{duration.label}</Text>
              </TouchableOpacity>
            );
          })}

          {/* Action Buttons */}
          <View style={styles.settingsActions}>
            <TouchableOpacity
              style={styles.saveBtn}
              activeOpacity={0.7}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ThemedLoader size="small" tone="onPrimary" />
              ) : (
                <Text style={styles.btnText}>{t('location.mobile.saveSettings', 'Save Settings')}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              activeOpacity={0.7}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.btnText}>{t('common.cancel', 'Cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
