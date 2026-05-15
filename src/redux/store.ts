import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/state/authSlice';
import neighborsReducer from '../features/neighbors/state/neighborsSlice';
import editProfileReducer from '../features/profile/state/editProfileSlice';
import parkingReducer from '../features/parking/state/parkingSlice';
import vehicleReducer from '../features/vehicle/state/vehicleSlice';
import notificationReducer from '../features/notifications/state/notificationSlice';
import postsReducer from '../features/community/state/communitySlice';
import billsReducer from '../features/bills/state/billsSlice';
import chatReducer from '../features/chat/state/chatSlice';
import maintenanceReducer from '../features/maintenance/state/maintenanceSlice';
import securityReducer from '../features/security/state/securitySlice';
import familyReducer from '../features/member/state/familySlice';


export const store = configureStore({
  reducer: {
    auth: authReducer,
    neighbors: neighborsReducer,
    editProfile: editProfileReducer,
    parking:parkingReducer,
    vehicles:vehicleReducer,
    notifications: notificationReducer,
    posts: postsReducer,
    bills:billsReducer,
    chat:chatReducer,
    maintenance: maintenanceReducer,
    security: securityReducer,
    familyMembers: familyReducer,

  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
