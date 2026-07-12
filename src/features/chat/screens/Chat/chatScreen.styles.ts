import { StyleSheet } from 'react-native';
import type { ThemeColors } from '../../../../theme/colors';

export const createChatStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  
  /* FIXED TYPO */
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  listContainer: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },

  /* =========================
     OLD STYLES (UNCHANGED)
     ========================= */

  messageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.overlay,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 14,
    backgroundColor: colors.surfaceMuted,
  },
  avatarFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  messageContent: { flex: 1 },

  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  date: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '400',
  },

  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  message: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },

  chatContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },

  dateLabel: {
    alignItems: 'center',
    paddingVertical: 12,
  },

  dateLabelText: {
    fontSize: 12,
    color: colors.textMuted,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },

  messagesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

//   messageRow: {
//     flexDirection: 'row',
//     marginVertical: 6,
//     alignItems: 'flex-end',
//   },

  sentMessageRow: { justifyContent: 'flex-start' },
  receivedMessageRow: { justifyContent: 'flex-end' },

  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: colors.surfaceMuted,
  },

//   messageBubble: {
//     maxWidth: '75%',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderRadius: 16,
//     marginVertical: 2,
//   },

  sentMessage: {
    backgroundColor: colors.backgroundAlt,
  },

  receivedMessage: {
    backgroundColor: colors.surfaceMuted,
  },

  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },

  sentMessageText: { color: colors.textPrimary },
  receivedMessageText: { color: colors.textPrimary },

  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },

  sentTimeStyle: {
    color: colors.textMuted,
    textAlign: 'left',
    marginLeft: 40,
  },

  receivedTimeStyle: {
    color: colors.textMuted,
    textAlign: 'right',
  },

  /* =========================
     🔥 NEW UNIFIED CHAT FLOW
     ========================= */



//   messageBubbleUnified: {
//     maxWidth: '90%',
//     borderRadius: 14,
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//   },

  messageTimeUnified: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    marginLeft: 6,
  },

  /* =========================
     VOICE MESSAGE (REUSED)
     ========================= */

  voiceMessage: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  voiceMessageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },

  playIcon: {
    fontSize: 12,
    marginLeft: 2,
  },

  waveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
    gap: 2,
  },

  waveformBar: {
    width: 2,
    backgroundColor: colors.textMuted,
    borderRadius: 1,
  },

  voiceTime: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },

  /* =========================
     INPUT AREA (UNCHANGED)
     ========================= */




  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    overflow: 'visible',
  },

  iconText: {
    fontSize: 20,
  },
  /* INPUT BOX WITH ICONS INSIDE */
inputWrapper: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'flex-end',
  backgroundColor: colors.backgroundAlt,
  borderRadius: 28,
  paddingLeft: 8,
  paddingRight: 6,
  paddingVertical: 6,
  gap: 6,
  minHeight: 56,
  borderWidth: 1,
  borderColor: colors.border,
},

input: {
  flex: 1,
  fontSize: 15,
  paddingTop: 10,
  paddingBottom: 10,
  color: colors.textPrimary,
  maxHeight: 110,
},

micButton: {
  marginLeft: 10,
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: colors.primary,
  justifyContent: 'center',
  alignItems: 'center',
},

/* CHAT FEELING FIX */
sentIndent: {
  marginLeft: 24,
},

receivedIndent: {
  marginLeft: 0,
},

messageBubbleUnified: {
  maxWidth: '78%', // important!
  borderRadius: 16,
  paddingHorizontal: 14,
  paddingVertical: 10,
},

messageRowUnified: {
  marginVertical: 4, // tighter spacing = chat feel
},

/* MESSAGE ROW */
messageRow: {
  flexDirection: 'row',
  marginVertical: 6,
},

/* ALIGNMENT */
senderRow: {
  justifyContent: 'flex-end',
},

receiverRow: {
  justifyContent: 'flex-start',
},

/* BUBBLES */
messageBubble: {
  maxWidth: '75%',
  paddingHorizontal: 16,
  paddingTop: 12,
  paddingBottom: 8,
  borderRadius: 18,
},
attachmentOnlyBubble: {
  paddingHorizontal: 0,
  paddingTop: 0,
  paddingBottom: 0,
  backgroundColor: 'transparent',
  borderWidth: 0,
},

senderBubble: {
  backgroundColor: colors.primary,
  borderTopLeftRadius: 4,
},

receiverBubble: {
  backgroundColor: colors.surface,
  borderTopRightRadius: 4,
  borderWidth: 1,
  borderColor: colors.border,
},

/* TEXT */
senderText: {
  color: colors.onPrimary,
},

receiverText: {
  color: colors.textPrimary,
},
inputContainer: {
  flexDirection: 'row',
  alignItems: 'flex-end',
  paddingHorizontal: 16,
  paddingTop: 10,
  backgroundColor: colors.background,
  borderTopWidth: 1,
  borderTopColor: colors.border,
  gap: 10,
},

  sendIconButton: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 0,
  },
  sendButtonText: {
    color: colors.onPrimary,
    fontSize: 12,
    fontWeight: '700',
    flexShrink: 1,
  },
  sendIcon: {
    color: colors.onPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  sendIconButtonDisabled: {
    backgroundColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  attachmentList: {
    gap: 8,
  },
  attachmentCard: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  videoAttachmentCard: {
    width: 220,
    height: 156,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'flex-end',
  },
  senderVideoAttachmentCard: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderColor: 'rgba(255,255,255,0.18)',
  },
  receiverVideoAttachmentCard: {
    backgroundColor: colors.surfaceMuted,
  },
  videoAttachmentBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.24)',
  },
  videoAttachmentCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlayButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.88)',
  },
  videoAttachmentFooter: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.58)',
  },
  videoAttachmentLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  videoAttachmentName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  attachmentFileCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    minHeight: 84,
    justifyContent: 'space-between',
  },
  senderAttachmentFileCard: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderColor: 'rgba(255,255,255,0.18)',
  },
  receiverAttachmentFileCard: {
    backgroundColor: colors.background,
  },
  attachmentFileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  attachmentIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  senderAttachmentIconWrap: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  attachmentMeta: {
    flex: 1,
    minWidth: 0,
  },
  attachmentTypeLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  attachmentImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  attachmentChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  attachmentFileAction: {
    marginTop: 12,
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.surfaceMuted,
  },
  senderAttachmentFileAction: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  attachmentFileActionText: {
    fontSize: 11,
    fontWeight: '800',
  },
  pendingAttachmentsRow: {
    marginBottom: 8,
  },
  pendingAttachmentsContent: {
    gap: 8,
    paddingRight: 8,
  },
  pendingAttachmentCard: {
    width: 82,
    height: 82,
    borderRadius: 16,
    backgroundColor: colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pendingAttachmentImage: {
    width: '100%',
    height: '100%',
  },
  pendingAttachmentTypeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 2,
    paddingHorizontal: 6,
  },
  pendingAttachmentLabel: {
    fontSize: 11,
    color: colors.textPrimary,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  pendingAttachmentRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  failedMessageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#991B1B',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  failedMessageIconWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  failedMessageText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  errorModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  errorModalCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    alignItems: 'center',
  },
  errorModalIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  errorModalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorModalText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorModalButton: {
    minWidth: 110,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  errorModalButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  videoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.94)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  videoModalCard: {
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  videoModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
  },
  videoModalTitle: {
    flex: 1,
    marginRight: 12,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  videoModalClose: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  videoModalCloseText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  videoPlayerWrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000000',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },
  });
