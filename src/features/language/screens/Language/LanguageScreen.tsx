/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Svg, { Ellipse, Path, Rect } from 'react-native-svg';
import { createStyles } from './LanguageScreen.styles';
import {
  fetchLanguages,
  selectLanguage,
  Language,
} from '../../services/languageService';
import { LanguageCode, useI18n } from '../../../../i18n';
import { useAppTheme } from '../../../../theme/ThemeProvider';

const languageFlags: { [key: string]: string } = {
  en: '🇬🇧',
  fr: '🇫🇷',
  ar: '🇩🇿',
  vi: '🇻🇳',
  ja: '🇯🇵',
  pt: '🇵🇹',
  zh: '🇨🇳',
  ko: '🇰🇷',
  ni: '🇳🇮',
  ru: '🇷🇺',
  es: '🇪🇸',
  de: '🇩🇪',
  it: '🇮🇹',
};

const getNormalizedCode = (value: string): LanguageCode | null => {
  if (value === 'en' || value === 'fr' || value === 'ar') {
    return value;
  }
  return null;
};

const ProceedIcon = ({
  color,
  size = 18,
}: {
  color: string;
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 12h14M12 5l7 7-7 7"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const AlgeriaFlag = () => (
  <View style={{ width: 30, alignItems: 'flex-start', marginRight: 12 }}>
    <Svg width={28} height={21} viewBox="0 0 336 280" fill="none">
      <Rect x="0" y="0" width="112" height="280" fill="#008751" />
      <Rect x="112" y="0" width="112" height="280" fill="#FFFFFF" />
      <Rect x="224" y="0" width="112" height="280" fill="#008751" />
    </Svg>
  </View>
);

export default function LanguageScreen({ navigation }: any) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { language, setLanguage, t } = useI18n();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedLanguage = useMemo(
    () => languages.find(item => item.languageId === selected),
    [languages, selected],
  );

  useEffect(() => {
    loadLanguages();
  }, []);

  const loadLanguages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchLanguages();
      setLanguages(data);

      const current = data.find(
        lang => lang.languageCode.toLowerCase() === language.toLowerCase(),
      );
      if (current) {
        setSelected(current.languageId);
      } else {
        const english = data.find(lang => lang.languageCode === 'en');
        if (english) {
          setSelected(english.languageId);
        } else if (data.length > 0) {
          setSelected(data[0].languageId);
        }
      }
    } catch (err: any) {
      setError(err.message);
      Alert.alert(t('common.error', 'Error'), err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = async () => {
    if (!selected) {
      Alert.alert(
        t('common.error', 'Error'),
        t('common.mobile.language.validation.selectLanguage', 'Please select a language'),
      );
      return;
    }

    try {
      setSubmitting(true);
      await selectLanguage(selected);

      const localCode = getNormalizedCode(
        String(selectedLanguage?.languageCode || '').toLowerCase(),
      );
      if (localCode) {
        await setLanguage(localCode);
      }

      navigation.replace('MainTabs');
    } catch (err: any) {
      Alert.alert(t('common.error', 'Error'), err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderItem = ({ item }: { item: Language }) => {
    const normalizedCode = String(item.languageCode || '').toLowerCase();
    const flag = languageFlags[item.languageCode] || '🌐';

    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => setSelected(item.languageId)}
        disabled={submitting}
      >
        {normalizedCode === 'ar' ? (
          <AlgeriaFlag />
        ) : (
          <Text style={styles.flag}>{flag}</Text>
        )}
        <Text style={styles.language}>{item.languageName}</Text>
        {selected === item.languageId && <Text style={styles.check}>✓</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topCircle1} />
      <View style={styles.topCircle2} />
      <View style={styles.topCircle3} />

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>
              {t('common.mobile.language.loading', 'Loading languages...')}
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={loadLanguages}>
              <Text style={styles.retryText}>
                {t('common.mobile.common.retry', 'Retry')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={languages}
              keyExtractor={item => item.languageId}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
            />

            <TouchableOpacity
              style={[
                styles.proceedBtn,
                submitting && styles.proceedBtnDisabled,
              ]}
              onPress={handleProceed}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={colors.onPrimary} />
              ) : (
                <View style={styles.proceedContent}>
                  <Text style={styles.proceedText}>
                    {t('common.mobile.language.proceed', 'Proceed')}
                  </Text>
                  <ProceedIcon color={colors.onPrimary} size={18} />
                </View>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={{ position: 'absolute', bottom: -80, right: -190, zIndex: 1 }}>
        <Svg width={320} height={260} viewBox="0 0 320 260">
          <Ellipse
            cx="240"
            cy="200"
            rx="180"
            ry="150"
            fill={colors.primary}
            fillOpacity={0.5}
          />
        </Svg>
      </View>

      <View style={{ position: 'absolute', bottom: -170, right: -10, zIndex: 2 }}>
        <Svg width={300} height={240} viewBox="0 0 300 240">
          <Ellipse
            cx="220"
            cy="180"
            rx="180"
            ry="150"
            fill={colors.primary}
            fillOpacity={0.7}
          />
        </Svg>
      </View>
    </View>
  );
}
