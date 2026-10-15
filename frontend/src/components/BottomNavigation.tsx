import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { THEME } from '../constants/theme';
import { useLanguage } from '../i18n';

export type TabKey = 'home' | 'deals' | 'contacts' | 'growth' | 'settings';

interface BottomNavigationProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  alertsCount?: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onSelectTab,
  alertsCount = 0,
}) => {
  const { t } = useLanguage();

  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'home', label: t.nav.home, icon: '🏠' },
    { key: 'deals', label: t.nav.deals, icon: '💼' },
    { key: 'contacts', label: t.nav.contacts, icon: '👥' },
    { key: 'growth', label: t.nav.growth, icon: '📈' },
    { key: 'settings', label: t.nav.settings, icon: '⚙️' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = currentTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => onSelectTab(tab.key)}
          >
            <View style={styles.iconWrapper}>
              <Text style={styles.iconText}>{tab.icon}</Text>
              {tab.key === 'home' && alertsCount > 0 && (
                <View style={styles.alertBadge}>
                  <Text style={styles.alertBadgeText}>{alertsCount}</Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.tabLabel,
                isActive ? styles.activeLabel : styles.inactiveLabel,
              ]}
            >
              {tab.label}
            </Text>
            {isActive && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.white,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.slate[200],
    paddingBottom: 16,
    paddingTop: 8,
    elevation: 8,
    shadowColor: THEME.colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  iconWrapper: {
    position: 'relative',
  },
  iconText: {
    fontSize: 20,
  },
  alertBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: THEME.colors.rose[600],
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  alertBadgeText: {
    color: THEME.colors.white,
    fontSize: 9,
    fontWeight: 'bold',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
  activeLabel: {
    color: THEME.colors.brand[600],
    fontWeight: '700',
  },
  inactiveLabel: {
    color: THEME.colors.slate[400],
  },
  activeIndicator: {
    position: 'absolute',
    top: -8,
    width: 24,
    height: 3,
    backgroundColor: THEME.colors.brand[600],
    borderRadius: 2,
  },
});
