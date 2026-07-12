/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  Linking,
  Modal,
  NativeModules,
  PermissionsAndroid,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  errorCodes as documentErrorCodes,
  isErrorWithCode as isDocumentPickerErrorWithCode,
  pick as pickDocument,
  types as documentPickerTypes,
} from '@react-native-documents/picker';
import { launchCamera, launchImageLibrary, type Asset } from 'react-native-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import Video from 'react-native-video';

import ScreenWrapper from '../../../../components/ScreenWrapper';
import ThemedLoader from '../../../../components/ThemedLoader';
import { useAppSelector } from '../../../../redux/hooks';
import { useI18n } from '../../../../i18n';
import { useAppTheme } from '../../../../theme/ThemeProvider';
import {
  hasMaxLength,
  hasMinLength,
  trimValue,
} from '../../../../shared/validation/formValidation';
import { createChatStyles } from './chatScreen.styles';

import {
  addMessageLocally,
  clearMessages,
  loadInbox,
  loadMessages,
  markConversationReadLocally,
  markMessagesSeenLocally,
  sendMessage,
  updateLocalMessageStatus,
} from '../../state/chatSlice';
import {
  fetchInbox,
  type ChatAttachmentDto,
  type ChatMessageDto,
  type ChatUploadFile,
  markChatMessageSeen,
} from '../../services/chatService';

interface SendIconProps {
  width?: number;
  height?: number;
  color?: string;
}

interface PendingAttachment extends ChatUploadFile {
  id: string;
  previewType: ChatAttachmentDto['type'];
  previewUrl: string;
}

const SendIcon: React.FC<SendIconProps> = ({
  width = 24,
  height = 24,
  color,
}) => (
  <Svg width={width} height={height} viewBox="0 0 512 512" fill={color ?? 'currentColor'}>
    <Path d="M48 448l416-192L48 64v149.333L346 256 48 298.667z" />
  </Svg>
);

const FilePreviewIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <Path d="M14 3v5h5" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    <Path d="M9 13h6M9 17h4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

const VideoPreviewIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 10.5V6.75A1.75 1.75 0 0 0 13.25 5h-7.5A1.75 1.75 0 0 0 4 6.75v10.5C4 18.216 4.784 19 5.75 19h7.5A1.75 1.75 0 0 0 15 17.25V13.5l4 3v-9l-4 3Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const AudioPreviewIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 4v16M10 8v8M6 10v4M18 7v10"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PlayIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 6.5v11l9-5.5-9-5.5Z"
      fill={color}
      stroke={color}
      strokeWidth={1.4}
      strokeLinejoin="round"
    />
  </Svg>
);

const AttachButtonIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8.5 12.5l6.59-6.59a3 3 0 114.24 4.24l-7.78 7.78a5 5 0 11-7.07-7.07l7.07-7.07"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CameraButtonIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 7h3l2-2h6l2 2h3a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 16a3 3 0 100-6 3 3 0 000 6z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CloseIcon = ({ color }: { color: string }) => (
  <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6l12 12"
      stroke={color}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const MessageStatusIcon = ({
  state,
  color,
}: {
  state?: ChatMessageDto['localSendState'];
  color: string;
}) => {
  if (state === 'failed') {
    return (
      <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
        <Path
          d="M18 6L6 18M6 6l12 12"
          stroke={color}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  return null;
};

const normalizePickerAttachmentType = (asset: Asset): PendingAttachment['previewType'] => {
  const type = String(asset.type || '').toLowerCase();
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('audio/')) return 'audio';
  return 'document';
};

const getAttachmentName = (asset: Asset, index: number) =>
  asset.fileName || `attachment-${Date.now()}-${index}`;

const ChatDetailScreen = ({ route, navigation }: any) => {
  const { conversationId: routeConversationId, receiverId, name } = route.params ?? {};
  const dispatch = useDispatch();

  const messages = useSelector((state: any) => state.chat.messages);
  const loadingMessages = useSelector((state: any) => state.chat.loadingMessages);
  const sendingMessage = useSelector((state: any) => state.chat.sendingMessage);

  const authUser = useAppSelector(state => state.auth.user);
  const userId = String(authUser?.userId ?? authUser?.data?.userId ?? '');
  const residentId = String(
    authUser?.residentId ?? authUser?.data?.residentId ?? '',
  );
  const seenById = residentId || userId;
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const chatStyles = useMemo(() => createChatStyles(colors), [colors]);
  const keyboardExtraLift = Platform.OS === 'ios' ? 14 : 34;
  const attachmentPreviewSize = Math.min(Math.max(width * 0.42, 132), 190);

  const [messageText, setMessageText] = useState('');
  const [selectedAttachments, setSelectedAttachments] = useState<PendingAttachment[]>([]);
  const [uploadError, setUploadError] = useState('');
  const [activeVideo, setActiveVideo] = useState<{ url: string; name: string } | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    routeConversationId && routeConversationId !== 'security-chat'
      ? String(routeConversationId)
      : null,
  );
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<any>(null);
  const seenMessageIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (routeConversationId && routeConversationId !== 'security-chat') {
      setActiveConversationId(String(routeConversationId));
    }
  }, [routeConversationId]);

  useEffect(() => {
    if (activeConversationId) {
      dispatch(markConversationReadLocally(activeConversationId));
    }
  }, [activeConversationId, dispatch]);

  useEffect(() => {
    let cancelled = false;
    const resolveConversationId = async () => {
      if (activeConversationId || !receiverId) return;
      try {
        const inbox = await fetchInbox();
        const match = inbox.find(item => String(item.userId) === String(receiverId));
        if (!cancelled && match?.conversationId) {
          setActiveConversationId(String(match.conversationId));
        }
      } catch {
        // Keep the screen usable for first-message flows.
      }
    };
    resolveConversationId();
    return () => {
      cancelled = true;
    };
  }, [activeConversationId, receiverId]);

  useEffect(() => {
    dispatch(clearMessages());
    seenMessageIdsRef.current.clear();
    if (activeConversationId) {
      dispatch(loadMessages(activeConversationId) as any);
    }
  }, [activeConversationId, dispatch]);

  useEffect(() => {
    if (!seenById || !activeConversationId || messages.length === 0) {
      return;
    }

    const incomingMessageIds = messages
      .filter((item: ChatMessageDto) => {
        const messageId = String(item?.messageId || '').trim();
        if (!messageId || messageId.startsWith('temp-')) {
          return false;
        }

        const senderId = String(item?.senderId ?? '');
        return senderId !== userId && !seenMessageIdsRef.current.has(messageId);
      })
      .map((item: ChatMessageDto) => String(item.messageId));

    if (incomingMessageIds.length === 0) {
      return;
    }

    incomingMessageIds.forEach((messageId: string) => {
      seenMessageIdsRef.current.add(messageId);
    });

    let cancelled = false;

    const syncSeenState = async () => {
      const results: PromiseSettledResult<unknown>[] = await Promise.allSettled(
        incomingMessageIds.map((messageId: string) =>
          markChatMessageSeen(messageId, seenById),
        ),
      );

      if (cancelled) {
        return;
      }

      const successfulIds = incomingMessageIds.filter((_: string, index: number) => {
        return results[index]?.status === 'fulfilled';
      });

      const failedIds = incomingMessageIds.filter((_: string, index: number) => {
        return results[index]?.status === 'rejected';
      });

      failedIds.forEach((messageId: string) => {
        seenMessageIdsRef.current.delete(messageId);
      });

      if (successfulIds.length > 0) {
        dispatch(markConversationReadLocally(activeConversationId));
        dispatch(markMessagesSeenLocally(successfulIds));
        dispatch(loadInbox() as any);
      }
    };

    syncSeenState();

    return () => {
      cancelled = true;
    };
  }, [activeConversationId, dispatch, messages, seenById, userId]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = Keyboard.addListener(showEvent, e => {
      const kbHeight = e.endCoordinates.height - (Platform.OS === 'ios' ? insets.bottom : 0);
      setKeyboardHeight(Math.max(0, kbHeight + keyboardExtraLift));
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    });

    const onHide = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, [insets.bottom, keyboardExtraLift]);

  const appendAssets = (assets: Asset[] = []) => {
    const mapped = assets
      .filter(asset => Boolean(asset.uri))
      .map((asset, index) => ({
        id: `${Date.now()}-${index}-${asset.fileName || 'file'}`,
        uri: String(asset.uri),
        type: asset.type || 'application/octet-stream',
        name: getAttachmentName(asset, index),
        previewType: normalizePickerAttachmentType(asset),
        previewUrl: String(asset.uri),
      }));

    if (mapped.length === 0) {
      return;
    }

    setSelectedAttachments(mapped);
    setUploadError('');
  };

  const handlePickerError = (title: string, fallbackMessage: string, responseOrError: any) => {
    setUploadError(
      responseOrError?.errorMessage || responseOrError?.message || fallbackMessage || title,
    );
  };

  const openImageLibrary = async () => {
    try {
      const response = await launchImageLibrary({
        mediaType: 'mixed',
        selectionLimit: 1,
        includeBase64: false,
      });

      if (response?.didCancel) return;
      if (response?.errorCode) {
        handlePickerError(
          t('common.error', 'Error'),
          t('chat.mobile.galleryFailed', 'Unable to open gallery.'),
          response,
        );
        return;
      }

      appendAssets(response.assets);
    } catch (error: any) {
      handlePickerError(
        t('common.error', 'Error'),
        t('chat.mobile.galleryFailed', 'Unable to open gallery.'),
        error,
      );
    }
  };

  const openDocumentPicker = async () => {
    if (!NativeModules?.RNDocumentPicker) {
      setUploadError(
        t(
          'chat.mobile.documentUnavailable',
          'Document upload is not available in this installed app build yet.',
        ),
      );
      return;
    }

    try {
      const [response] = await pickDocument({
        type: [
          documentPickerTypes.pdf,
          documentPickerTypes.doc,
          documentPickerTypes.docx,
          documentPickerTypes.plainText,
          documentPickerTypes.images,
          documentPickerTypes.zip,
        ],
        presentationStyle: 'fullScreen',
      });

      appendAssets([
        {
          uri: response.uri,
          type: response.type || 'application/octet-stream',
          fileName: response.name || `document-${Date.now()}`,
        } as Asset,
      ]);
    } catch (error: any) {
      if (
        isDocumentPickerErrorWithCode(error) &&
        error.code === documentErrorCodes.OPERATION_CANCELED
      ) {
        return;
      }
      handlePickerError(
        t('common.error', 'Error'),
        t('chat.mobile.documentFailed', 'Unable to open document picker.'),
        error,
      );
    }
  };

  const requestCameraPermission = async () => {
    if (Platform.OS !== 'android') return true;

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: t('chat.mobile.cameraPermissionTitle', 'Camera Permission'),
        message: t('chat.mobile.cameraPermissionMessage', 'App needs camera access to take a photo.'),
        buttonPositive: t('common.mobile.common.gotIt', 'Got it'),
      },
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const openCamera = async () => {
    try {
      const granted = await requestCameraPermission();
      if (!granted) {
        setUploadError(
          t('chat.mobile.cameraPermissionRequired', 'Camera permission is required to take a photo.'),
        );
        return;
      }

      const response = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: true,
        includeBase64: false,
      });

      if (response?.didCancel) return;
      if (response?.errorCode) {
        handlePickerError(
          t('common.error', 'Error'),
          t('chat.mobile.cameraFailed', 'Unable to open camera.'),
          response,
        );
        return;
      }

      appendAssets(response.assets);
    } catch (error: any) {
      handlePickerError(
        t('common.error', 'Error'),
        t('chat.mobile.cameraFailed', 'Unable to open camera.'),
        error,
      );
    }
  };

  const openAttachmentOptions = () => {
    Alert.alert(
      t('chat.mobile.addAttachmentTitle', 'Add attachment'),
      t('chat.mobile.addAttachmentMessage', 'Choose how you want to attach media.'),
      [
        { text: t('chat.mobile.photo', 'Photo'), onPress: openImageLibrary },
        { text: t('chat.mobile.document', 'Document'), onPress: openDocumentPicker },
        { text: t('chat.mobile.camera', 'Camera'), onPress: openCamera },
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
      ],
    );
  };

  const removePendingAttachment = (attachmentId: string) => {
    setSelectedAttachments(prev => prev.filter(item => item.id !== attachmentId));
  };

  const handleSend = async () => {
    const messageToSend = trimValue(messageText);
    const hasAttachments = selectedAttachments.length > 0;

    if (!messageToSend && !hasAttachments) return;

    if (messageToSend && (!hasMinLength(messageToSend, 1) || !hasMaxLength(messageToSend, 500))) {
      Alert.alert(
        t('common.error', 'Error'),
        t('chat.mobile.invalidMessageLength', 'Message must be between 1 and 500 characters'),
      );
      return;
    }

    if (!receiverId) {
      Alert.alert(
        t('common.error', 'Error'),
        t('chat.mobile.unableToSendNow', 'Unable to send message right now.'),
      );
      return;
    }

    const tempMessageId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const filesToSend: ChatUploadFile[] = selectedAttachments.map(item => ({
      uri: item.uri,
      type: item.type,
      name: item.name,
    }));

    const optimisticAttachments: ChatAttachmentDto[] = selectedAttachments.map(item => ({
      id: item.id,
      name: item.name,
      type: item.previewType,
      url: item.previewUrl,
      duration: null,
    }));

    const tempMessage = {
      messageId: tempMessageId,
      senderId: userId,
      senderName: null,
      messageText: messageToSend || null,
      mediaPath: optimisticAttachments[0]?.url || null,
      mediaType: optimisticAttachments[0]?.type || null,
      conversationId: activeConversationId || 'pending',
      status: 0,
      createdAt: new Date().toISOString(),
      attachments: optimisticAttachments,
      __optimistic: true,
      localSendState: 'sending' as const,
    };

    setMessageText('');
    setSelectedAttachments([]);
    setUploadError('');

    try {
      dispatch(addMessageLocally(tempMessage));
      const result = await dispatch(
        sendMessage({
          receiverId,
          message: messageToSend,
          files: filesToSend,
          tempMessageId,
        }) as any,
      );

      if (result.error) {
        throw new Error(result.error.message || 'Failed to send');
      }

      const payload = result?.payload?.response || result?.payload;
      const returnedConversationId =
        payload?.data?.conversationId ||
        payload?.data?.ConversationId ||
        payload?.conversationId ||
        payload?.ConversationId ||
        payload?.chatConversationId ||
        activeConversationId;

      if (returnedConversationId) {
        setActiveConversationId(String(returnedConversationId));
        dispatch(loadMessages(String(returnedConversationId)) as any);
      }
    } catch (error: any) {
      dispatch(updateLocalMessageStatus({ messageId: tempMessageId, localSendState: 'failed' }));

      const normalizedMessage = String(error?.message || '').trim();
      if (normalizedMessage && normalizedMessage !== 'Failed to send') {
        const errorMessage = normalizedMessage.includes('Attachment is too large')
          ? t(
              'chat.mobile.attachmentTooLarge',
              'This file is too large to send. Please choose a smaller photo or video.',
            )
          : normalizedMessage;
        setUploadError(errorMessage);
      } else {
        setUploadError(t('chat.mobile.sendFailed', 'Unable to send this attachment right now.'));
      }
    }
  };

  const openAttachment = async (url?: string | null) => {
    const normalizedUrl = String(url || '').trim();
    if (!normalizedUrl) return;

    const encodedUrl = /^https?:\/\//i.test(normalizedUrl)
      ? encodeURI(normalizedUrl)
      : normalizedUrl;

    try {
      await Linking.openURL(encodedUrl);
      return;
    } catch {}

    try {
      const canOpen = await Linking.canOpenURL(encodedUrl);
      if (canOpen) {
        await Linking.openURL(encodedUrl);
        return;
      }
    } catch {}

    Alert.alert(
      t('common.error', 'Error'),
      t('chat.mobile.unableToOpenAttachment', 'Unable to open this attachment.'),
    );
  };

  const getAttachmentPresentation = (attachment: ChatAttachmentDto) => {
    if (attachment.type === 'video') {
      return {
        label: t('chat.mobile.video', 'Video'),
        action: t('chat.mobile.openVideo', 'Open Video'),
        icon: <VideoPreviewIcon color={colors.textPrimary} />,
      };
    }

    if (attachment.type === 'audio') {
      return {
        label: t('chat.mobile.audio', 'Audio'),
        action: t('chat.mobile.playAudio', 'Play Audio'),
        icon: <AudioPreviewIcon color={colors.textPrimary} />,
      };
    }

    return {
      label: t('chat.mobile.document', 'Document'),
      action: t('chat.mobile.openDocument', 'Open Document'),
      icon: <FilePreviewIcon color={colors.textPrimary} />,
    };
  };

  const renderAttachment = (attachment: ChatAttachmentDto, isSender: boolean) => {
    if (attachment.type === 'image' && attachment.url) {
      return (
        <TouchableOpacity
          key={attachment.id}
          activeOpacity={0.85}
          onPress={() => openAttachment(attachment.url)}
          style={[
            chatStyles.attachmentCard,
            { width: attachmentPreviewSize, height: attachmentPreviewSize },
          ]}
        >
          <Image source={{ uri: attachment.url }} style={chatStyles.attachmentImage} />
        </TouchableOpacity>
      );
    }

    if (attachment.type === 'video' && attachment.url) {
      return (
        <TouchableOpacity
          key={attachment.id}
          activeOpacity={0.9}
          onPress={() =>
            setActiveVideo({
              url: attachment.url,
              name: attachment.name || t('chat.mobile.video', 'Video'),
            })
          }
          style={[
            chatStyles.videoAttachmentCard,
            isSender ? chatStyles.senderVideoAttachmentCard : chatStyles.receiverVideoAttachmentCard,
          ]}
        >
          <View style={chatStyles.videoAttachmentBackdrop} />
          <View style={chatStyles.videoAttachmentCenter}>
            <View style={chatStyles.videoPlayButton}>
              <PlayIcon color={colors.primary} />
            </View>
          </View>
          <View style={chatStyles.videoAttachmentFooter}>
            <Text style={chatStyles.videoAttachmentLabel}>
              {t('chat.mobile.video', 'Video')}
            </Text>
            <Text style={chatStyles.videoAttachmentName} numberOfLines={2}>
              {attachment.name || t('chat.mobile.video', 'Video')}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    const presentation = getAttachmentPresentation(attachment);

    return (
      <TouchableOpacity
        key={attachment.id}
        activeOpacity={0.85}
        onPress={() => openAttachment(attachment.url)}
        style={[
          chatStyles.attachmentFileCard,
          isSender ? chatStyles.senderAttachmentFileCard : chatStyles.receiverAttachmentFileCard,
        ]}
      >
        <View style={chatStyles.attachmentFileTop}>
          <View
            style={[
              chatStyles.attachmentIconWrap,
              isSender ? chatStyles.senderAttachmentIconWrap : null,
            ]}
          >
            {presentation.icon}
          </View>
          <View style={chatStyles.attachmentMeta}>
            <Text
              style={[
                chatStyles.attachmentTypeLabel,
                isSender ? chatStyles.senderText : chatStyles.receiverText,
              ]}
            >
              {presentation.label}
            </Text>
            <Text
              style={[
                chatStyles.attachmentChipText,
                isSender ? chatStyles.senderText : chatStyles.receiverText,
              ]}
              numberOfLines={2}
            >
              {attachment.name}
            </Text>
          </View>
        </View>
        <View
          style={[
            chatStyles.attachmentFileAction,
            isSender ? chatStyles.senderAttachmentFileAction : null,
          ]}
        >
          <Text
            style={[
              chatStyles.attachmentFileActionText,
              isSender ? chatStyles.senderText : chatStyles.receiverText,
            ]}
          >
            {presentation.action}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMessage = (item: any) => {
    const isSender =
      item.__optimistic === true ||
      (item.senderId != null && String(item.senderId) === userId);

    const attachments: ChatAttachmentDto[] = Array.isArray(item.attachments) ? item.attachments : [];
    const hasOnlyAttachment = attachments.length > 0 && !item.messageText;
    const messageStatusColor = '#FCA5A5';

    return (
      <View
        key={item.messageId}
        style={[
          chatStyles.messageRow,
          isSender ? chatStyles.senderRow : chatStyles.receiverRow,
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          style={[
            chatStyles.messageBubble,
            isSender ? chatStyles.senderBubble : chatStyles.receiverBubble,
            hasOnlyAttachment && chatStyles.attachmentOnlyBubble,
          ]}
        >
          {attachments.length > 0 && (
            <View style={chatStyles.attachmentList}>
              {attachments.map(attachment => renderAttachment(attachment, isSender))}
            </View>
          )}

          {!!item.messageText && (
            <Text
              style={[
                chatStyles.messageText,
                isSender ? chatStyles.senderText : chatStyles.receiverText,
                attachments.length > 0 && { marginTop: 8 },
              ]}
            >
              {item.messageText}
            </Text>
          )}
          {isSender && item.localSendState === 'failed' && (
            <View style={chatStyles.messageFooter}>
              <View style={chatStyles.failedMessageBadge}>
                <View style={chatStyles.failedMessageIconWrap}>
                  <MessageStatusIcon state={item.localSendState} color="#FFFFFF" />
                </View>
                <Text style={chatStyles.failedMessageText}>
                  {t('chat.mobile.failedLabel', 'Failed')}
                </Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScreenWrapper title={name} onBackPress={() => navigation.goBack()}>
      <View style={{ flex: 1, paddingBottom: keyboardHeight }}>
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flex: 1, paddingBottom: 4 }}>
            {loadingMessages && (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <ThemedLoader size="large" />
                <Text style={{ marginTop: 10, color: colors.textMuted }}>
                  {t('chat.mobile.loadingMessages', 'Loading messages...')}
                </Text>
              </View>
            )}

            {!loadingMessages && messages.length === 0 && (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <Text style={{ color: colors.textMuted, fontSize: 16 }}>
                  {t('chat.mobile.noMessagesYet', 'No messages yet')}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 8 }}>
                  {t('chat.mobile.startConversation', 'Start the conversation!')}
                </Text>
              </View>
            )}

            {!loadingMessages && messages.length > 0 && (
              <View style={chatStyles.listContainer}>
                {messages.map((item: any) => renderMessage(item))}
              </View>
            )}
          </View>
        </ScrollView>

        <View
          style={[
            chatStyles.inputContainer,
            { paddingBottom: keyboardHeight > 0 ? 12 : (insets.bottom > 0 ? insets.bottom : 12) },
          ]}
        >
          <View style={{ flex: 1 }}>
            {selectedAttachments.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={chatStyles.pendingAttachmentsContent}
                style={chatStyles.pendingAttachmentsRow}
              >
                {selectedAttachments.map(item => (
                  <View key={item.id} style={chatStyles.pendingAttachmentCard}>
                    {item.previewType === 'image' ? (
                      <Image
                        source={{ uri: item.previewUrl }}
                        style={chatStyles.pendingAttachmentImage}
                      />
                    ) : (
                      <>
                        <FilePreviewIcon color={colors.textPrimary} />
                        <Text
                          style={chatStyles.pendingAttachmentTypeLabel}
                          numberOfLines={1}
                        >
                          {item.previewType === 'audio'
                            ? t('chat.mobile.audio', 'Audio')
                            : item.previewType === 'video'
                              ? t('chat.mobile.video', 'Video')
                              : t('chat.mobile.document', 'Document')}
                        </Text>
                        <Text
                          style={chatStyles.pendingAttachmentLabel}
                          numberOfLines={2}
                        >
                          {item.name}
                        </Text>
                      </>
                    )}

                    <TouchableOpacity
                      style={chatStyles.pendingAttachmentRemove}
                      onPress={() => removePendingAttachment(item.id)}
                    >
                      <CloseIcon color={colors.onPrimary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            <View style={chatStyles.inputWrapper}>
            <TouchableOpacity style={chatStyles.iconButton} onPress={openAttachmentOptions}>
              <AttachButtonIcon color={colors.textMuted} />
            </TouchableOpacity>

            <TextInput
              style={chatStyles.input}
              placeholder={t('chat.mobile.messagePlaceholder', 'Message..')}
              placeholderTextColor={colors.textMuted}
              value={messageText}
              onChangeText={setMessageText}
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 120);
              }}
              multiline
              maxLength={500}
              editable={!sendingMessage}
              textAlignVertical="center"
            />
            <TouchableOpacity style={chatStyles.iconButton} onPress={openCamera}>
              <CameraButtonIcon color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSend}
              style={[
                chatStyles.sendIconButton,
                ((!messageText.trim() && selectedAttachments.length === 0) || sendingMessage) &&
                  chatStyles.sendIconButtonDisabled,
              ]}
              disabled={(!messageText.trim() && selectedAttachments.length === 0) || sendingMessage}
            >
              {sendingMessage ? (
                <ThemedLoader size="small" tone="onPrimary" />
              ) : (
                <SendIcon width={18} height={18} color={colors.onPrimary} />
              )}
            </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <Modal
        transparent
        animationType="fade"
        visible={!!uploadError}
        onRequestClose={() => setUploadError('')}
      >
        <View style={chatStyles.errorModalOverlay}>
          <Pressable style={chatStyles.errorModalBackdrop} onPress={() => setUploadError('')} />
          <View style={chatStyles.errorModalCard}>
            <View style={chatStyles.errorModalIconWrap}>
              <MessageStatusIcon state="failed" color="#FFFFFF" />
            </View>
            <Text style={chatStyles.errorModalTitle}>{t('chat.mobile.uploadErrorTitle', 'Upload Error')}</Text>
            <Text style={chatStyles.errorModalText}>{uploadError}</Text>
            <TouchableOpacity
              style={chatStyles.errorModalButton}
              onPress={() => setUploadError('')}
            >
              <Text style={chatStyles.errorModalButtonText}>{t('common.mobile.common.ok', 'OK')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        animationType="fade"
        visible={!!activeVideo}
        onRequestClose={() => setActiveVideo(null)}
      >
        <View style={chatStyles.videoModalOverlay}>
          <View style={chatStyles.videoModalCard}>
            <View style={chatStyles.videoModalHeader}>
              <Text style={chatStyles.videoModalTitle} numberOfLines={1}>
                {activeVideo?.name || t('chat.mobile.video', 'Video')}
              </Text>
              <TouchableOpacity
                style={chatStyles.videoModalClose}
                onPress={() => setActiveVideo(null)}
              >
                <Text style={chatStyles.videoModalCloseText}>
                  {t('common.close', 'Close')}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={chatStyles.videoPlayerWrap}>
              {activeVideo ? (
                <Video
                  source={{ uri: activeVideo.url }}
                  style={chatStyles.videoPlayer}
                  controls
                  paused={false}
                  resizeMode="contain"
                  playInBackground={false}
                  playWhenInactive={false}
                  onError={() => {
                    setActiveVideo(null);
                    setUploadError(
                      t('chat.mobile.unableToOpenAttachment', 'Unable to open this attachment.'),
                    );
                  }}
                />
              ) : null}
            </View>
          </View>
        </View>
      </Modal>

    </ScreenWrapper>
  );
};

export default ChatDetailScreen;
