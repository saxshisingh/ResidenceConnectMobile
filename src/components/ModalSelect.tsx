import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAppTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n';

type SelectOption = {
  label: string;
  value: string;
};

interface ModalSelectProps {
  value: string;
  placeholder: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  title?: string;
}

export default function ModalSelect({
  value,
  placeholder,
  options,
  onChange,
  disabled = false,
  title,
}: ModalSelectProps) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [visible, setVisible] = useState(false);

  const selectedOption = options.find(option => option.value === value);
  const displayText = selectedOption?.label || placeholder;

  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    setVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.trigger, disabled && styles.triggerDisabled]}
        onPress={() => {
          if (!disabled) {
            setVisible(true);
          }
        }}
        disabled={disabled}
      >
        <Text
          style={[
            styles.triggerText,
            !selectedOption && styles.placeholderText,
            disabled && styles.disabledText,
          ]}
          numberOfLines={1}
        >
          {displayText}
        </Text>
        <Text style={[styles.chevron, disabled && styles.disabledText]}>›</Text>
      </TouchableOpacity>

      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <Pressable style={styles.sheet} onPress={() => null}>
            <Text style={styles.sheetTitle}>{title || placeholder}</Text>
            <FlatList
              data={options}
              keyExtractor={item => item.value}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.option, isSelected && styles.optionSelected]}
                    onPress={() => handleSelect(item.value)}
                  >
                    <Text
                      style={[styles.optionText, isSelected && styles.optionTextSelected]}
                    >
                      {item.label}
                    </Text>
                    {isSelected ? (
                      <Text style={styles.selectedMark}>
                        {t('common.mobile.common.ok', 'OK')}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    {t('common.noOptions', 'No options available')}
                  </Text>
                </View>
              }
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors']) =>
  StyleSheet.create({
    trigger: {
      minHeight: 50,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.surface,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    triggerDisabled: {
      backgroundColor: colors.surfaceMuted,
    },
    triggerText: {
      flex: 1,
      fontSize: 15,
      color: colors.textPrimary,
    },
    placeholderText: {
      color: colors.textMuted,
    },
    disabledText: {
      color: colors.textMuted,
    },
    chevron: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textMuted,
    },
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'flex-end',
      paddingHorizontal: 16,
      paddingBottom: 24,
    },
    sheet: {
      maxHeight: '70%',
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 16,
    },
    sheetTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 12,
    },
    option: {
      minHeight: 48,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginBottom: 8,
      backgroundColor: colors.surfaceMuted,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    optionSelected: {
      backgroundColor: colors.backgroundAlt,
    },
    optionText: {
      flex: 1,
      fontSize: 14,
      color: colors.textPrimary,
    },
    optionTextSelected: {
      fontWeight: '700',
    },
    selectedMark: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
    },
    emptyState: {
      paddingVertical: 20,
      alignItems: 'center',
    },
    emptyStateText: {
      fontSize: 13,
      color: colors.textMuted,
    },
  });
