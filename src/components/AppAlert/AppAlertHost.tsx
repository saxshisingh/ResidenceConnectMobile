import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertButton,
  AlertOptions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { setAppAlertListener } from './appAlert';
import { useAppTheme } from '../../theme/ThemeProvider';
import type { ThemeColors } from '../../theme/colors';
import { useI18n } from '../../i18n';

type AlertState = {
  visible: boolean;
  title: string;
  message: string;
  buttons: AlertButton[];
  options?: AlertOptions;
};

export default function AppAlertHost() {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const defaultButton = useMemo<AlertButton>(
    () => ({ text: t('common.mobile.common.ok', 'OK') }),
    [t],
  );
  const [state, setState] = useState<AlertState>({
    visible: false,
    title: '',
    message: '',
    buttons: [defaultButton],
  });

  useEffect(() => {
    setAppAlertListener(payload => {
      const nextButtons = payload.buttons?.length ? payload.buttons : [defaultButton];
      setState({
        visible: true,
        title: payload.title || '',
        message: payload.message || '',
        buttons: nextButtons,
        options: payload.options,
      });
    });

    return () => setAppAlertListener(null);
  }, []);

  const close = () => {
    setState(prev => ({ ...prev, visible: false }));
  };

  const isVerticalButtons = useMemo(() => state.buttons.length > 2, [state.buttons.length]);

  return (
    <Modal
      visible={state.visible}
      transparent
      animationType="fade"
      onRequestClose={close}
    >
      <Pressable
        style={[styles.overlay, { backgroundColor: colors.overlay }]}
        onPress={() => {
          if (state.options?.cancelable !== false) {
            close();
          }
        }}
      >
        <Pressable style={[styles.card, { backgroundColor: colors.surface }]}>
          {!!state.title && <Text style={[styles.title, { color: colors.textPrimary }]}>{state.title}</Text>}
          {!!state.message && <Text style={[styles.message, { color: colors.textMuted }]}>{state.message}</Text>}

          <View
            style={[
              styles.actions,
              isVerticalButtons ? styles.actionsVertical : styles.actionsHorizontal,
            ]}
          >
            {state.buttons.map((button, index) => {
              const isDestructive = button.style === 'destructive';
              const isCancel = button.style === 'cancel';
              return (
                <TouchableOpacity
                  key={`${button.text || 'button'}-${index}`}
                  style={[
                    styles.button,
                    isVerticalButtons ? styles.buttonVertical : styles.buttonHorizontal,
                    { backgroundColor: colors.surfaceMuted },
                    isDestructive && styles.buttonDestructive,
                    isCancel && styles.buttonCancel,
                  ]}
                  onPress={() => {
                    close();
                    button.onPress?.();
                  }}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      { color: colors.primary },
                      isDestructive && styles.buttonTextDestructive,
                      isCancel && styles.buttonTextCancel,
                    ]}
                  >
                    {button.text || t('common.mobile.common.ok', 'OK')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    shadowColor: colors.overlay,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    marginTop: 16,
    gap: 10,
  },
  actionsHorizontal: {
    flexDirection: 'row',
  },
  actionsVertical: {
    flexDirection: 'column',
  },
  button: {
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonHorizontal: {
    flex: 1,
  },
  buttonVertical: {
    width: '100%',
  },
  buttonCancel: {
    backgroundColor: colors.textSecondary,
  },
  buttonDestructive: {
    backgroundColor: colors.surfaceMuted,
  },
  buttonText: {
    fontWeight: '700',
    fontSize: 14,
  },
  buttonTextCancel: {
    color: colors.onPrimary,
  },
  buttonTextDestructive: {
    color: colors.danger,
  },
  });
