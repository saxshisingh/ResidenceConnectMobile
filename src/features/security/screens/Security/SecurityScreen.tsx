import React, { useMemo, useState } from 'react';
import { Alert, Linking, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { createStyles } from './SecurityScreen.styles';
import CallIcon from '../../../../assets/Icons/Call.svg';
import ChatIcon from '../../../../assets/Icons/comment.svg';
import CardArt from '../../../../assets/Icons/ChatGPT Image Dec 11, 2025, 10_33_08 AM 1.svg';
import CardArt2 from '../../../../assets/Icons/ChatGPT Image Dec 11, 2025, 10_45_17 AM 1.svg';
import Illustration from '../../../../assets/Icons/ChatGPT Image Dec 11, 2025, 10_40_49 AM 1.svg';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import { fetchSecurityContact } from '../../state/securitySlice';
import { fetchInbox } from '../../../chat/services/chatService';
import { startSecurityCall } from '../../services/securityService';
import { useAppTheme } from '../../../../theme/ThemeProvider';
import { useI18n } from '../../../../i18n';

export default function SecurityScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { colors } = useAppTheme();
  const { language, t } = useI18n();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const user = useAppSelector(state => state.auth.user);
  const contactInfo = useAppSelector(state => state.security.contact);
  const loading = useAppSelector(state => state.security.loading);
  const [startingCall, setStartingCall] = useState(false);

  const residenceId = user?.data?.residenceId;
  const blockId = user?.data?.blockId;
  const calledByUserId = user?.data?.userId;
  const rawFromNumber =
    user?.data?.mobileNumber ||
    user?.data?.mobile ||
    user?.data?.phoneNumber ||
    '';

  const securityCopy = useMemo(() => {
    if (language === 'ar') {
      return {
        oops: 'عذرًا',
        title: 'الأمن',
        callSecurity: 'الاتصال بالأمن',
        callConfirm: 'هل تريد الاتصال بفريق الأمن؟',
        call: 'اتصال',
        available247: 'متاح على مدار الساعة للأمور العاجلة',
        callNow: 'اتصل الآن',
        messageSecurity: 'مراسلة الأمن',
        chatSubtitle: 'دردشة للاستفسارات غير العاجلة',
        openChat: 'فتح الدردشة',
        securityTeam: 'فريق الأمن',
        noSecurityAssigned:
          'لا يوجد فريق أمن مخصص حاليًا. يرجى المحاولة بعد قليل.',
      };
    }

    if (language === 'fr') {
      return {
        oops: 'Oups',
        title: 'Securite',
        callSecurity: 'Appeler la securite',
        callConfirm: 'Voulez-vous appeler l’equipe de securite ?',
        call: 'Appeler',
        available247: 'Disponible 24 h/24 pour les urgences',
        callNow: 'Appeler maintenant',
        messageSecurity: 'Envoyer un message a la securite',
        chatSubtitle: 'Discussion pour les demandes non urgentes',
        openChat: 'Ouvrir le chat',
        securityTeam: 'Equipe de securite',
        noSecurityAssigned:
          'Aucune equipe de securite n’est affectee pour le moment. Veuillez reessayer un peu plus tard.',
      };
    }

    return null;
  }, [language]);

  const showSecurityMessage = (message: string, title?: string) => {
    Alert.alert(title || securityCopy?.oops || t('common.oops', 'Oops'), message);
  };

  const normalizeSecurityMessage = (message?: string) => {
    const rawMessage = String(message || '').trim();
    if (/no active security staff found/i.test(rawMessage)) {
      return (
        securityCopy?.noSecurityAssigned ||
        t(
          'security.mobile.noSecurityAssigned',
          'No security team is assigned right now. Please try again a little later.',
        )
      );
    }

    return rawMessage || t(
      'security.mobile.contactFetchFailed',
      'Unable to fetch security contact.',
    );
  };

  const loadSecurityContact = async () => {
    if (contactInfo) {
      return contactInfo;
    }

    if (!residenceId || !blockId) {
      showSecurityMessage(
        t(
          'security.mobile.residenceOrBlockMissing',
          'Residence or block information is missing.',
        ),
      );
      return null;
    }

    try {
      const data = await dispatch(fetchSecurityContact({ residenceId, blockId })).unwrap();
      return data;
    } catch (e: any) {
      const errorMessage = typeof e === 'string' ? e : e?.message;
      showSecurityMessage(normalizeSecurityMessage(errorMessage));
      return null;
    }
  };

  const handleCallSecurity = async () => {
    const data = await loadSecurityContact();
    if (!data) {
      return;
    }

    const phone = data.phoneNumber || data.mobile || data.contact || '+1234567890';
    const toNumber = String(phone).replace(/[^\d]/g, '');
    const fromNumber = String(rawFromNumber || '').replace(/[^\d]/g, '');

    Alert.alert(
      securityCopy?.callSecurity || t('security.mobile.callSecurity', 'Call Security'),
      securityCopy?.callConfirm ||
        t('security.mobile.callConfirm', 'Do you want to call the security team?'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: securityCopy?.call || t('security.mobile.call', 'Call'),
          onPress: async () => {
            if (!calledByUserId || !residenceId || !blockId) {
              showSecurityMessage(
                t(
                  'security.mobile.requiredUserDetailsMissing',
                  'Required user details are missing for this call.',
                ),
              );
              return;
            }

            if (!fromNumber) {
              showSecurityMessage(
                t(
                  'security.mobile.mobileMissing',
                  'Your mobile number is missing. Please update your profile.',
                ),
              );
              return;
            }

            if (!toNumber) {
              showSecurityMessage(
                t(
                  'security.mobile.invalidContactNumber',
                  'Security contact number is invalid.',
                ),
              );
              return;
            }

            setStartingCall(true);
            try {
              await startSecurityCall({
                calledByUserId,
                residenceId,
                blockId,
                fromNumber,
                toNumber,
              });

              const telUrl = `tel:${toNumber}`;
              const telPromptUrl = `telprompt:${toNumber}`;

              try {
                await Linking.openURL(telUrl);
              } catch {
                try {
                  await Linking.openURL(telPromptUrl);
                } catch {
                  Alert.alert(
                    securityCopy?.oops || t('common.oops', 'Oops'),
                    t(
                      'security.mobile.dialerUnavailable',
                      'Phone dialer is not available on this device. Please try on a physical phone.',
                    ),
                  );
                }
              }
            } catch (e: any) {
              const message =
                typeof e === 'string'
                  ? e
                  : e?.message ||
                    t('security.mobile.callStartFailed', 'Failed to start security call.');
              showSecurityMessage(normalizeSecurityMessage(message));
            } finally {
              setStartingCall(false);
            }
          },
        },
      ],
    );
  };

  const handleMessageSecurity = async () => {
    const data = await loadSecurityContact();
    if (!data) {
      return;
    }

    const receiverId = data.userId || data.receiverId || data.securityUserId;
    if (!receiverId) {
      showSecurityMessage(
        t(
          'security.mobile.chatUnavailable',
          'Security user is unavailable for chat right now.',
        ),
      );
      return;
    }

    let conversationId = data.conversationId;
    if (!conversationId) {
      try {
        const inbox = await fetchInbox();
        const match = inbox.find(item => String(item.userId) === String(receiverId));
        conversationId = match?.conversationId;
      } catch {
        // Chat screen can still create the conversation on first message.
      }
    }

    navigation.navigate('ChatDetail', {
      conversationId,
      receiverId,
      name: data.name || securityCopy?.securityTeam || t('security.mobile.securityTeam', 'Security Team'),
    });
  };

  return (
    <ScreenWrapper
      title={securityCopy?.title || t('security.mobile.title', 'Security')}
      onBackPress={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.overlay }]}
          activeOpacity={0.7}
          onPress={handleCallSecurity}
          disabled={loading || startingCall}
        >
          <View style={styles.cardLeft}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              {securityCopy?.callSecurity || t('security.mobile.callSecurity', 'Call Security')}
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
              {securityCopy?.available247 || t('security.mobile.available247', 'Available 24/7 for urgent matters')}
            </Text>
            <View style={[styles.actionPill, { backgroundColor: colors.surfaceMuted }]}>
              <CallIcon width={12} height={12} />
              <Text style={[styles.actionPillText, { color: colors.primary }]}>
                {securityCopy?.callNow || t('security.mobile.callNow', 'Call Now')}
              </Text>
            </View>
          </View>
          <CardArt width={60} height={60} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.overlay }]}
          activeOpacity={0.7}
          onPress={handleMessageSecurity}
          disabled={loading}
        >
          <View style={styles.cardLeft}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              {securityCopy?.messageSecurity || t('security.mobile.messageSecurity', 'Message Security')}
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
              {securityCopy?.chatSubtitle || t('security.mobile.chatSubtitle', 'Chat for non-urgent inquiries')}
            </Text>
            <View
              style={[
                styles.actionPill,
                styles.chatPill,
                { backgroundColor: colors.surfaceMuted },
              ]}
            >
              <ChatIcon width={12} height={12} />
              <Text style={[styles.actionPillText, { color: colors.primary }]}>
                {securityCopy?.openChat || t('security.mobile.openChat', 'Open Chat')}
              </Text>
            </View>
          </View>
          <CardArt2 width={60} height={60} />
        </TouchableOpacity>

        <View style={styles.illustrationWrap}>
          <Illustration width={240} height={180} />
        </View>
      </View>
    </ScreenWrapper>
  );
}
