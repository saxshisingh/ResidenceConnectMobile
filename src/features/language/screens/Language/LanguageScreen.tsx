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
import Svg, { Ellipse, Path, Rect, Polygon} from 'react-native-svg';
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

const AlgeriaFlag = () => (
  <View style={{ width: 30, alignItems: 'flex-start', marginRight: 12 }}>
    <Svg width={28} height={20} viewBox="0 0 28 20">
      {/* Left Half */}
      <Rect x="0" y="0" width="14" height="20" fill="#006233" />

      {/* Right Half */}
      <Rect x="14" y="0" width="14" height="20" fill="#FFFFFF" />

      {/* Crescent */}
      <Path
        d="M16.2 4.3
           A5.6 5.6 0 1 0 16.2 15.7
           A4.3 4.3 0 1 1 16.2 4.3"
        fill="#D21034"
      />

      {/* Star */}
      <Polygon
        points="16.7,10 17.5,11.9 19.5,12 17.9,13.2 18.5,15 16.7,13.9 14.9,15 15.5,13.2 13.9,12 15.9,11.9"
        fill="#D21034"
      />
    </Svg>
  </View>
);

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
    const flag = languageFlags[normalizedCode] || '🌐';

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

        {selected === item.languageId && (
          <Text style={styles.check}>✓</Text>
        )}
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
