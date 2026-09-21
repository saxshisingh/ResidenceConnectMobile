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

const Stack =
  createNativeStackNavigator();

export default function AppNavigator() {
  /* ============================================================
   * THEME
   * ============================================================ */

  const {
    resolvedTheme,
    colors,
  } = useAppTheme();

  /* ============================================================
   * REDUX AUTH STATE
   * ============================================================ */

  const authUser =
    useAppSelector(
      state => state.auth.user,
    );

  const isFirstLogin =
    useAppSelector(
      state => state.auth.isFirstLogin,
    );

  /* ============================================================
   * LANGUAGE
   * ============================================================ */

  const {
    language,
    setLanguage,
  } = useI18n();

  /* ============================================================
   * AUTH CONTEXT
   * ============================================================ */

  const {
    status,
  } = useAuth();

  /* ============================================================
   * DEBUG AUTH STATE
   * ============================================================ */

  console.log(
    '[AppNavigator] AUTH STATUS:',
    status,
  );

  console.log(
    '[AppNavigator] AUTH STATE:',
    {
      status,
      isFirstLogin,
      hasAuthUser: Boolean(authUser),
      userId:
        authUser?.userId ??
        null,
      residentId:
        authUser?.residentId ??
        null,
      languageCode:
        authUser?.languageCode ??
        null,
    },
  );

  /* ============================================================
   * APPLY USER LANGUAGE
   * ============================================================ */

  /**
   * IMPORTANT:
   *
   * fetchUserProfile() now returns `json.data`
   * directly.
   *
   * Therefore:
   *
   * authUser.languageCode
   *
   * NOT:
   *
   * authUser.data.languageCode
   */
  useEffect(() => {
    const nextLanguage =
      normalizeSupportedLanguageCode(
        authUser?.languageCode,
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
          '[AppNavigator] Unable to apply user language preference:',
          error,
        );
      },
    );
  }, [
    authUser?.languageCode,
    language,
    setLanguage,
  ]);

  /* ============================================================
   * NAVIGATION THEME
   * ============================================================ */

  const navigationTheme =
    resolvedTheme === 'dark'
      ? {
          ...DarkTheme,

          colors: {
            ...DarkTheme.colors,
            background:
              colors.background,
            card: colors.surface,
            text:
              colors.textPrimary,
            border:
              colors.border,
            primary:
              colors.primary,
          },
        }
      : {
          ...DefaultTheme,

          colors: {
            ...DefaultTheme.colors,
            background:
              colors.background,
            card: colors.surface,
            text:
              colors.textPrimary,
            border:
              colors.border,
            primary:
              colors.primary,
          },
        };

  /* ============================================================
   * AUTHENTICATION LOADING
   * ============================================================ */

  /**
   * SplashScreen is displayed ONLY while AuthProvider
   * is determining the authentication state.
   *
   * Once status becomes AUTHENTICATED or
   * UNAUTHENTICATED, SplashScreen is removed.
   */
  if (status === 'LOADING') {
    console.log(
      '[AppNavigator] Rendering SplashScreen',
    );

    return <SplashScreen />;
  }

  /* ============================================================
   * NAVIGATION CONTAINER
   * ============================================================ */

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

        {/* ======================================================
         * UNAUTHENTICATED FLOW
         * ====================================================== */}

        {status === 'UNAUTHENTICATED' && (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
            />

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

        {/* ======================================================
         * AUTHENTICATED FLOW
         * ====================================================== */}

        {status === 'AUTHENTICATED' && (
          <>
            {/* --------------------------------------------------
             * DEFAULT AUTHENTICATED SCREEN
             * -------------------------------------------------- */}

            {isFirstLogin ? (
              <>
                {console.log(
                  '[AppNavigator] First login detected -> ConfirmPassword',
                )}

                <Stack.Screen
                  name="ConfirmPassword"
                  component={
                    ConfirmPasswordScreen
                  }
                />
              </>
            ) : (
              <>
                {console.log(
                  '[AppNavigator] Normal login -> MainTabs',
                )}

                <Stack.Screen
                  name="MainTabs"
                  component={
                    MainTabNavigator
                  }
                />
              </>
            )}

            {/* --------------------------------------------------
             * COMMON AUTHENTICATED SCREENS
             * -------------------------------------------------- */}

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
              component={
                ProfileSettingsScreen
              }
            />

            <Stack.Screen
              name="Policies"
              component={PoliciesScreen}
            />

            {/* --------------------------------------------------
             * PARKING
             * -------------------------------------------------- */}

            <Stack.Screen
              name="AddParkingInfo"
              component={ParkingInfo}
            />

            <Stack.Screen
              name="Parking"
              component={ParkingStack}
            />

            {/* --------------------------------------------------
             * VEHICLES
             * -------------------------------------------------- */}

            <Stack.Screen
              name="VehicleInfo"
              component={VehicleInfo}
            />

            <Stack.Screen
              name="Vehicle"
              component={VehicleStack}
            />

            {/* --------------------------------------------------
             * FAMILY
             * -------------------------------------------------- */}

            <Stack.Screen
              name="Familydetial"
              component={FamilyDetails}
            />

            <Stack.Screen
              name="AddEditFamilydetial"
              component={
                AddEditFamilyMember
              }
            />

            {/* --------------------------------------------------
             * DOCUMENTS
             * -------------------------------------------------- */}

            <Stack.Screen
              name="Documents"
              component={
                DocumentsListScreen
              }
            />

            <Stack.Screen
              name="DocumentViewer"
              component={
                DocumentViewerScreen
              }
            />

            {/* --------------------------------------------------
             * ALERTS
             * -------------------------------------------------- */}

            <Stack.Screen
              name="AlertSystem"
              component={
                AlertSystemScreen
              }
            />

            <Stack.Screen
              name="AlertMyBlock"
              component={
                AlertBlockScreen
              }
            />

            <Stack.Screen
              name="AllAlerts"
              component={
                AllAlertsScreen
              }
            />

            <Stack.Screen
              name="AlertDetail"
              component={
                AlertDetailScreen
              }
            />

            {/* --------------------------------------------------
             * NOTIFICATIONS
             * -------------------------------------------------- */}

            <Stack.Screen
              name="Notification"
              component={
                NotificationsScreen
              }
            />

            <Stack.Screen
              name="NotificationDetail"
              component={
                NotificationDetailScreen
              }
            />

            {/* --------------------------------------------------
             * COMMUNITY
             * -------------------------------------------------- */}

            <Stack.Screen
              name="Community"
              component={
                CommunityBoard
              }
            />

            <Stack.Screen
              name="CreatePost"
              component={
                CreatePostScreen
              }
            />

            {/* --------------------------------------------------
             * BILLS
             * -------------------------------------------------- */}

            <Stack.Screen
              name="MyBills"
              component={MyBills}
            />

            {/* --------------------------------------------------
             * SECURITY
             * -------------------------------------------------- */}

            <Stack.Screen
              name="Security"
              component={SecurityScreen}
            />

            {/* --------------------------------------------------
             * CALL LOGS
             * -------------------------------------------------- */}

            <Stack.Screen
              name="CallLogs"
              component={CallLogsScreen}
            />

            {/* --------------------------------------------------
             * SMART ACCESS
             * -------------------------------------------------- */}

            <Stack.Screen
              name="SmartAccess"
              component={
                SmartAccessScreen
              }
            />

            <Stack.Screen
              name="SmartAccessHistory"
              component={
                SmartAccessHistoryScreen
              }
            />

            <Stack.Screen
              name="UnlockDoor"
              component={
                UnlockDoorScreen
              }
            />

            <Stack.Screen
              name="TTLockAdmin"
              component={
                TTLockAdminScreen
              }
            />

            <Stack.Screen
              name="TTLockScreen"
              component={
                TTLockScreen
              }
            />

            {/* --------------------------------------------------
             * CHAT
             * -------------------------------------------------- */}

            <Stack.Screen
              name="ChatDetail"
              component={
                ChatDetailScreen
              }
            />

            {/* --------------------------------------------------
             * MAINTENANCE
             * -------------------------------------------------- */}

            <Stack.Screen
              name="Maintenance"
              component={
                MaintenanceHistoryScreen
              }
            />

            <Stack.Screen
              name="MaintenanceHistory"
              component={
                MaintenanceHistoryScreen
              }
            />

            <Stack.Screen
              name="MaintenanceRaiseCategory"
              component={
                MaintenanceScreen
              }
            />

            <Stack.Screen
              name="MaintenanceRaiseRequest"
              component={
                MaintenanceRaiseRequestScreen
              }
            />

            <Stack.Screen
              name="MaintenanceRequestSuccess"
              component={
                MaintenanceRequestSuccessScreen
              }
            />

            <Stack.Screen
              name="MaintenanceRequestDetail"
              component={
                MaintenanceRequestDetailScreen
              }
            />

            <Stack.Screen
              name="TechnicianDetail"
              component={
                TechnicianDetailScreen
              }
            />
          </>
        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
}