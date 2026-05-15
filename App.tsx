/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar } from 'react-native';
import {
  SafeAreaProvider
} from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation';
import { store } from './src/redux/store';
import { Provider } from 'react-redux';
import AuthWatcher from './src/app/AuthWatcher';
import AppAlertHost from './src/components/AppAlert/AppAlertHost';
import { installAppAlertPatch } from './src/components/AppAlert/appAlert';
import { I18nProvider, installI18nRuntimePatch } from './src/i18n';
import { ThemeProvider, useAppTheme } from './src/theme/ThemeProvider';
import ForegroundSosAlertWatcher from './src/features/alerts/components/ForegroundSosAlertWatcher';
import ForegroundSosAlertOverlay from './src/features/alerts/components/ForegroundSosAlertOverlay';

installAppAlertPatch();
installI18nRuntimePatch();

function AppContent() {
  const { resolvedTheme, colors } = useAppTheme();
  const isDarkMode = resolvedTheme === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <AuthWatcher />
      <AppNavigator />
      <ForegroundSosAlertWatcher />
      <ForegroundSosAlertOverlay />
      <AppAlertHost />
    </SafeAreaProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <I18nProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </I18nProvider>
    </Provider>
  );
}





export default App;
