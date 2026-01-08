import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type CallType = 'audio' | 'video';
export type CallStatus = 'incoming' | 'active' | 'ended' | 'missed';

export interface Call {
  fromUserId: string;
  type: CallType;
  status: CallStatus;
  startedAt?: string;
  endedAt?: string;
}

interface CallsState {
  activeCall: Call | null;
  history: Call[];
}

const initialState: CallsState = {
  activeCall: null,
  history: [],
};

const callsSlice = createSlice({
  name: 'calls',
  initialState,
  reducers: {
    callIncoming(state, action: PayloadAction<{ fromUserId: string; type: CallType }>) {
      state.activeCall = {
        fromUserId: action.payload.fromUserId,
        type: action.payload.type,
        status: 'incoming',
      };
    },

    callAccepted(state) {
      if (state.activeCall) {
        state.activeCall.status = 'active';
        state.activeCall.startedAt = new Date().toISOString();
      }
    },

    callEnded(state) {
      if (state.activeCall) {
        state.activeCall.status = 'ended';
        state.activeCall.endedAt = new Date().toISOString();
        state.history.unshift(state.activeCall);
        state.activeCall = null;
      }
    },

    callMissed(state) {
      if (state.activeCall) {
        state.activeCall.status = 'missed';
        state.history.unshift(state.activeCall);
        state.activeCall = null;
      }
    },

    resetCalls() {
      return initialState;
    },
  },
});

export const { callIncoming, callAccepted, callEnded, callMissed, resetCalls } = callsSlice.actions;

export default callsSlice.reducer;
