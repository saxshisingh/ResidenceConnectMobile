import {useEffect} from 'react';

import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import SplashScreen from '../../features/splash/screens/SplashScreen/SplashScreen';

import {
  DetailsStepOne,
  DetailsStepTwo,
  DetailsStepThree,
} from '../../features/onboarding/screens/OnBoardingScreens/OnboardingScreens';

import LoginScreen from '../../features/auth/screens/Login/LoginScreen';
import ConfirmPasswordScreen from '../../features/auth/screens/ConfirmPassword/ConfirmPasswordScreen';
import ForgotPasswordScreen from '../../features/auth/screens/ForgotPassword/ForgotPasswordScreen';

import LanguageScreen from '../../features/language/screens/Language/LanguageScreen';

import MainTabNavigator from './MainTabNavigator';

import MyNeighborsScreen from '../../features/neighbors/screens/MyNeighborsScreen';

import EditProfileScreen from '../../features/profile/screens/EditProfile/EditProfileScreen';
import ProfileSettingsScreen from '../../features/profile/screens/Settings/ProfileSettingsScreen';
import PoliciesScreen from '../../features/profile/screens/Settings/PoliciesScreen';

import ParkingInfo from '../../features/parking/screens/Parking/ParkingInfo';
import ParkingStack from '../../features/parking/navigation/ParkingNavigator';

import VehicleStack from '../../features/vehicle/navigation/VehicleNavigator';
import VehicleInfo from '../../features/vehicle/screens/Vehicles/VehicleInfo';

import FamilyDetails from '../../features/member/screens/Member/FamilyDetails';
import AddEditFamilyMember from '../../features/member/screens/Member/AddEditFamily';

import DocumentsListScreen from '../../features/documents/screens/Documents/DocumentsList';
import DocumentViewerScreen from '../../features/documents/screens/Documents/DocumentViewerScreen';

import {navigationRef} from '../navigationRef';

import AlertBlockScreen from '../../features/alerts/screens/AlertSystem/AlertBlockScreen';
import AlertSystemScreen from '../../features/alerts/screens/AlertSystem/AlertSystemScreen';
import AllAlertsScreen from '../../features/alerts/screens/AlertSystem/AllAlertsScreen';
import AlertDetailScreen from '../../features/alerts/screens/AlertSystem/AlertDetailScreen';

import NotificationsScreen from '../../features/notifications/screens/Notifictaion/NotificationsScreen';
import NotificationDetailScreen from '../../features/notifications/screens/Notifictaion/NotificationDetailScreen';

import CommunityBoard from '../../features/community/screens/CommunityBoard/CommunityBoard';
import CreatePostScreen from '../../features/community/screens/CommunityBoard/CreatePostScreen';

import MyBills from '../../features/bills/screens/MyBills/MyBills';

import ChatDetailScreen from '../../features/chat/screens/Chat/ChatDetailScreen';

import MaintenanceScreen from '../../features/maintenance/screens/Maintenance/MaintenanceScreen';
import MaintenanceHistoryScreen from '../../features/maintenance/screens/Maintenance/MaintenanceHistoryScreen';
import MaintenanceRaiseRequestScreen from '../../features/maintenance/screens/Maintenance/MaintenanceRaiseRequestScreen';
import MaintenanceRequestSuccessScreen from '../../features/maintenance/screens/Maintenance/MaintenanceRequestSuccessScreen';
import MaintenanceRequestDetailScreen from '../../features/maintenance/screens/Maintenance/MaintenanceRequestDetailScreen';
import TechnicianDetailScreen from '../../features/maintenance/screens/Maintenance/TechnicianDetailScreen';

import SecurityScreen from '../../features/security/screens/Security/SecurityScreen';

import CallLogsScreen from '../../features/calllogs/screens/CallLogs/CallLogsScreen';

import SmartAccessScreen from '../../features/smartaccess/screens/SmartAccess/SmartAccessScreen';
import UnlockDoorScreen from '../../features/smartaccess/screens/SmartAccess/UnlockDoorScreen';
import TTLockAdminScreen from '../../features/smartaccess/screens/SmartAccess/TTLockAdminScreen';
import TTLockScreen from '../../features/smartaccess/screens/SmartAccess/TTLockScreen';
import SmartAccessHistoryScreen from '../../features/smartaccess/screens/SmartAccess/SmartAccessHistoryScreen';

import {
  useAppTheme,
} from '../../theme/ThemeProvider';

import {
  useAppSelector,
} from '../../redux/hooks';

import {
  normalizeSupportedLanguageCode,
} from '../../features/language/services/languageService';

import {
  useI18n,
} from '../../i18n';

import {
  useAuth,
} from '../../features/auth/context/AuthProvider';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const {
    resolvedTheme,
    colors,
  } = useAppTheme();

  const authUser = useAppSelector(
    state => state.auth.user,
  );

  const isFirstLogin = useAppSelector(
    state => state.auth.isFirstLogin,
  );

  const {
    language,
    setLanguage,
  } = useI18n();

  const {
    status,
  } = useAuth();

  console.log(
    '[AppNavigator] AUTH STATUS:',
    status,
  );

  useEffect(() => {
    const nextLanguage =
      normalizeSupportedLanguageCode(
        authUser?.data?.languageCode,
      );

    if (
      !nextLanguage ||
      nextLanguage === language
    ) {
      return;
    }

    setLanguage(nextLanguage).catch(
      error => {
        console.warn(
          'Unable to apply user language preference:',
          error,
        );
      },
    );
  }, [
    authUser?.data?.languageCode,
    language,
    setLanguage,
  ]);

  const navigationTheme =
    resolvedTheme === 'dark'
      ? {
          ...DarkTheme,
          colors: {
            ...DarkTheme.colors,
            background: colors.background,
            card: colors.surface,
            text: colors.textPrimary,
            border: colors.border,
            primary: colors.primary,
          },
        }
      : {
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            background: colors.background,
            card: colors.surface,
            text: colors.textPrimary,
            border: colors.border,
            primary: colors.primary,
          },
        };

  /*
   * =========================================
   * AUTHENTICATION LOADING
   * =========================================
   *
   * SplashScreen is only a visual loading screen.
   *
   * It is NOT registered as a navigation route.
   * It must NOT call navigation.replace().
   */
  if (status === 'LOADING') {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={navigationTheme}>

      <Stack.Navigator
        id="root"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          gestureEnabled: false,
        }}>

        {/* =========================================
            UNAUTHENTICATED FLOW
           ========================================= */}

        {status === 'UNAUTHENTICATED' && (
          <>

            {/* =====================================
                DEFAULT SCREEN AFTER LOGOUT
                ===================================== */}

            <Stack.Screen
              name="Login"
              component={LoginScreen}
            />

            {/* =====================================
                REGISTRATION / ONBOARDING

                These are NOT the default screen.
                They must be reached explicitly from
                the registration flow.
                ===================================== */}

            <Stack.Screen
              name="StepOne"
              component={DetailsStepOne}
            />

            <Stack.Screen
              name="StepTwo"
              component={DetailsStepTwo}
            />

            <Stack.Screen
              name="StepThree"
              component={DetailsStepThree}
            />

            {/* =====================================
                OTHER UNAUTHENTICATED SCREENS
                ===================================== */}

            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
            />

            <Stack.Screen
              name="Language"
              component={LanguageScreen}
            />

          </>
        )}

        {/* =========================================
            AUTHENTICATED FLOW
           ========================================= */}

        {status === 'AUTHENTICATED' && (
          <>

            {/* =====================================
                FIRST LOGIN
                ===================================== */}

            {isFirstLogin ? (
              <Stack.Screen
                name="ConfirmPassword"
                component={ConfirmPasswordScreen}
              />
            ) : (
              <Stack.Screen
                name="MainTabs"
                component={MainTabNavigator}
              />
            )}

            {/* =====================================
                COMMON AUTHENTICATED SCREENS
               ===================================== */}

            <Stack.Screen
              name="Language"
              component={LanguageScreen}
            />

            <Stack.Screen
              name="MyNeighbors"
              component={MyNeighborsScreen}
            />

            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
            />

            <Stack.Screen
              name="ProfileSettings"
              component={ProfileSettingsScreen}
            />

            <Stack.Screen
              name="Policies"
              component={PoliciesScreen}
            />

            <Stack.Screen
              name="AddParkingInfo"
              component={ParkingInfo}
            />

            <Stack.Screen
              name="VehicleInfo"
              component={VehicleInfo}
            />

            <Stack.Screen
              name="Parking"
              component={ParkingStack}
            />

            <Stack.Screen
              name="Vehicle"
              component={VehicleStack}
            />

            <Stack.Screen
              name="Familydetial"
              component={FamilyDetails}
            />

            <Stack.Screen
              name="AddEditFamilydetial"
              component={AddEditFamilyMember}
            />

            <Stack.Screen
              name="Documents"
              component={DocumentsListScreen}
            />

            <Stack.Screen
              name="DocumentViewer"
              component={DocumentViewerScreen}
            />

            <Stack.Screen
              name="AlertSystem"
              component={AlertSystemScreen}
            />

            <Stack.Screen
              name="AlertMyBlock"
              component={AlertBlockScreen}
            />

            <Stack.Screen
              name="AllAlerts"
              component={AllAlertsScreen}
            />

            <Stack.Screen
              name="AlertDetail"
              component={AlertDetailScreen}
            />

            <Stack.Screen
              name="Notification"
              component={NotificationsScreen}
            />

            <Stack.Screen
              name="NotificationDetail"
              component={NotificationDetailScreen}
            />

            <Stack.Screen
              name="Community"
              component={CommunityBoard}
            />

            <Stack.Screen
              name="CreatePost"
              component={CreatePostScreen}
            />

            <Stack.Screen
              name="MyBills"
              component={MyBills}
            />

            <Stack.Screen
              name="Security"
              component={SecurityScreen}
            />

            <Stack.Screen
              name="CallLogs"
              component={CallLogsScreen}
            />

            <Stack.Screen
              name="SmartAccess"
              component={SmartAccessScreen}
            />

            <Stack.Screen
              name="SmartAccessHistory"
              component={SmartAccessHistoryScreen}
            />

            <Stack.Screen
              name="UnlockDoor"
              component={UnlockDoorScreen}
            />

            <Stack.Screen
              name="TTLockAdmin"
              component={TTLockAdminScreen}
            />

            <Stack.Screen
              name="TTLockScreen"
              component={TTLockScreen}
            />

            <Stack.Screen
              name="ChatDetail"
              component={ChatDetailScreen}
            />

            <Stack.Screen
              name="Maintenance"
              component={MaintenanceHistoryScreen}
            />

            <Stack.Screen
              name="MaintenanceHistory"
              component={MaintenanceHistoryScreen}
            />

            <Stack.Screen
              name="MaintenanceRaiseCategory"
              component={MaintenanceScreen}
            />

            <Stack.Screen
              name="MaintenanceRaiseRequest"
              component={MaintenanceRaiseRequestScreen}
            />

            <Stack.Screen
              name="MaintenanceRequestSuccess"
              component={MaintenanceRequestSuccessScreen}
            />

            <Stack.Screen
              name="MaintenanceRequestDetail"
              component={MaintenanceRequestDetailScreen}
            />

            <Stack.Screen
              name="TechnicianDetail"
              component={TechnicianDetailScreen}
            />

          </>
        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
}