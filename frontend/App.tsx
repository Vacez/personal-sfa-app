import React, { useState } from 'react';
import { ActivityIndicator, SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomNavigation, TabKey } from './src/components/BottomNavigation';
import { THEME } from './src/constants/theme';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LanguageProvider } from './src/i18n';
import { AuthScreen } from './src/screens/AuthScreen';
import { ContactsScreen } from './src/screens/ContactsScreen';
import { DealsScreen } from './src/screens/DealsScreen';
import { GrowthScreen } from './src/screens/GrowthScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

const MainNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<TabKey>('home');

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.brand[600]} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const renderActiveScreen = () => {
    switch (currentTab) {
      case 'home':
        return <HomeScreen />;
      case 'deals':
        return <DealsScreen />;
      case 'contacts':
        return <ContactsScreen />;
      case 'growth':
        return <GrowthScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.appContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.colors.white} />
      <View style={styles.screenContainer}>{renderActiveScreen()}</View>
      <BottomNavigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        alertsCount={3}
      />
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AuthProvider>
          <MainNavigator />
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: THEME.colors.white,
  },
  screenContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: THEME.colors.slate[950],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
