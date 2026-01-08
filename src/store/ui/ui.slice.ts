import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ChatTab = 'chats' | 'calls' | 'users';

interface UIState {
  showConversationList: boolean;
  activeTab: ChatTab;
  activeConversationId: string | null;
}

const initialState: UIState = {
  showConversationList: true,
  activeTab: 'chats',
  activeConversationId: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    /* Sidebar */
    showSidebar(state) {
      state.showConversationList = true;
    },
    hideSidebar(state) {
      state.showConversationList = false;
    },

    /* Tabs */
    setActiveTab(state, action: PayloadAction<ChatTab>) {
      state.activeTab = action.payload;
    },

    /* Conversations */
    setActiveConversationId(state, action: PayloadAction<string | null>) {
      state.activeConversationId = action.payload;

      // Mobile UX: hide sidebar when opening chat
      if (action.payload) {
        state.showConversationList = false;
      }
    },

    /* Reset */
    resetUI() {
      return initialState;
    },
  },
});

export const { showSidebar, hideSidebar, setActiveTab, setActiveConversationId, resetUI } =
  uiSlice.actions;

export default uiSlice.reducer;
