import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchInbox,
  fetchMessages,
  sendMessageApi,
  reactToMessageApi,
  InboxItem,
  ChatMessageDto,
  ChatUploadFile,
  extractMessageFromSendResponse,
} from '../services/chatService';

export const loadInbox = createAsyncThunk(
  'chat/loadInbox',
  async () => await fetchInbox(),
);

export const loadMessages = createAsyncThunk(
  'chat/loadMessages',
  async (conversationId: string) => await fetchMessages(conversationId),
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({
    receiverId,
    message,
    files,
    tempMessageId,
  }: {
    receiverId: string;
    message?: string;
    files?: ChatUploadFile[];
    tempMessageId?: string;
  }) => {
    const response = await sendMessageApi(receiverId, message, files ?? []);
    return { response, tempMessageId };
  },
);

export const reactToMessage = createAsyncThunk(
  'chat/reactToMessage',
  async ({ messageId, reaction }: { messageId: string; reaction: string }) => {
    await reactToMessageApi(messageId, reaction);
    return { messageId, reaction };
  },
);

interface ChatState {
  inbox: InboxItem[];
  messages: ChatMessageDto[];
  loadingInbox: boolean;
  loadingMessages: boolean;
  sendingMessage: boolean;
  pendingReadConversationIds: string[];
}

const initialState: ChatState = {
  inbox: [],
  messages: [],
  loadingInbox: false,
  loadingMessages: false,
  sendingMessage: false,
  pendingReadConversationIds: [],
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearMessages(state) {
      state.messages = [];
    },
    markConversationReadLocally(state, action) {
      const conversationId = String(action.payload || '');
      if (!conversationId) {
        return;
      }

      const inboxItem = state.inbox.find(
        item => String(item.conversationId) === conversationId,
      );
      if (inboxItem) {
        (inboxItem as any).unreadCount = 0;
        (inboxItem as any).totalUnSeenCount = 0;
      }
      if (!state.pendingReadConversationIds.includes(conversationId)) {
        state.pendingReadConversationIds.push(conversationId);
      }
    },
    markMessagesSeenLocally(state, action) {
      const seenMessageIds = new Set(
        (Array.isArray(action.payload) ? action.payload : []).map((id: any) =>
          String(id),
        ),
      );

      state.messages.forEach(message => {
        if (seenMessageIds.has(String(message.messageId))) {
          message.status = 1;
        }
      });
    },
    addMessageLocally(state, action) {
      state.messages.push(action.payload);
    },
    updateLocalMessageStatus(state, action) {
      const { messageId, localSendState } = action.payload;
      const message = state.messages.find(item => item.messageId === messageId);
      if (message) {
        message.localSendState = localSendState;
      }
    },
  },
  extraReducers: builder => {
    builder
     
      .addCase(loadInbox.pending, state => {
        state.loadingInbox = true;
      })
      .addCase(loadInbox.fulfilled, (state, action) => {
        const rawInbox = action.payload;

        state.inbox = rawInbox.map(item => {
          const conversationId = String(item?.conversationId || '');
          if (!state.pendingReadConversationIds.includes(conversationId)) {
            return item;
          }

          return {
            ...item,
            unreadCount: 0,
            totalUnSeenCount: 0,
          };
        });
        state.pendingReadConversationIds = state.pendingReadConversationIds.filter(
          conversationId =>
            !rawInbox.some(
              item =>
                String(item?.conversationId) === conversationId &&
                Number(item?.unreadCount || 0) === 0,
            ),
        );
        state.loadingInbox = false;
      })

     
      .addCase(loadMessages.pending, state => {
        state.loadingMessages = true;
        state.messages = [];
      })
      .addCase(loadMessages.fulfilled, (state, action) => {
        state.messages = action.payload; 
        state.loadingMessages = false;
      })
      .addCase(loadMessages.rejected, state => {
        state.loadingMessages = false;
      })
      .addCase(sendMessage.pending, state => {
        state.sendingMessage = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sendingMessage = false;

        const tempMessageId = action.payload?.tempMessageId;
        const serverMessage = extractMessageFromSendResponse(action.payload?.response);
        const tempIndex = tempMessageId
          ? state.messages.findIndex(item => item.messageId === tempMessageId)
          : -1;

        if (tempIndex >= 0) {
          if (serverMessage?.messageId) {
            state.messages[tempIndex] = {
              ...state.messages[tempIndex],
              ...serverMessage,
              localSendState: 'sent',
            };
          } else {
            state.messages[tempIndex].localSendState = 'sent';
          }
        } else if (
          serverMessage &&
          serverMessage.messageId &&
          !state.messages.some(item => item.messageId === serverMessage.messageId)
        ) {
          state.messages.push({
            ...serverMessage,
            localSendState: 'sent',
          });
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sendingMessage = false;
        const tempMessageId = action.meta.arg?.tempMessageId;
        if (tempMessageId) {
          const message = state.messages.find(item => item.messageId === tempMessageId);
          if (message) {
            message.localSendState = 'failed';
          }
        }
      })
      .addCase(reactToMessage.fulfilled, (state, action) => {
        const { messageId, reaction } = action.payload;
        const message = state.messages.find(item => item.messageId === messageId);
        if (message) {
          (message as any).reaction = reaction;
        }
      });
  },
});

export const {
  clearMessages,
  markConversationReadLocally,
  markMessagesSeenLocally,
  addMessageLocally,
  updateLocalMessageStatus,
} = chatSlice.actions;
export default chatSlice.reducer;
