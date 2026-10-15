import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { THEME } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const { currentMode, toggleMode, user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const isVip = currentMode === 'VIP_HOSPITALITY';

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={toggleMode}
          activeOpacity={0.8}
          style={[
            styles.badge,
            { backgroundColor: isVip ? THEME.colors.vip.light : THEME.colors.b2b.light },
          ]}
        >
          <View
            style={[
              styles.badgeDot,
              { backgroundColor: isVip ? THEME.colors.vip.primary : THEME.colors.b2b.primary },
            ]}
          />
          <Text
            style={[
              styles.badgeText,
              { color: isVip ? THEME.colors.vip.text : THEME.colors.b2b.text },
            ]}
          >
            {isVip ? t.modes.vipTitle : t.modes.b2bTitle}
          </Text>
          <Text style={styles.switchHint}>⇄</Text>
        </TouchableOpacity>

        <View style={styles.rightSection}>
          {/* Quick Language Switcher Pill */}
          <View style={styles.langSelector}>
            <TouchableOpacity
              onPress={() => setLanguage('id')}
              style={[styles.langBtn, language === 'id' && styles.langBtnActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.langBtnText, language === 'id' && styles.langBtnTextActive]}>
                🇮🇩 ID
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setLanguage('ja')}
              style={[styles.langBtn, language === 'ja' && styles.langBtnActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.langBtnText, language === 'ja' && styles.langBtnTextActive]}>
                🇯🇵 日本語
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || '👤'}</Text>
          </View>
        </View>
      </View>

      {title && (
        <View style={styles.titleSection}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.sm,
    backgroundColor: THEME.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.slate[200],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.radius.full,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  switchHint: {
    marginLeft: 6,
    fontSize: 12,
    color: THEME.colors.slate[500],
    fontWeight: 'bold',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langSelector: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.slate[100],
    borderRadius: THEME.radius.full,
    padding: 2,
    borderWidth: 1,
    borderColor: THEME.colors.slate[200],
  },
  langBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.radius.full,
  },
  langBtnActive: {
    backgroundColor: THEME.colors.white,
    shadowColor: THEME.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  langBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.colors.slate[500],
  },
  langBtnTextActive: {
    color: THEME.colors.brand[700],
    fontWeight: '800',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.slate[800],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: THEME.colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  titleSection: {
    marginTop: THEME.spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.colors.slate[900],
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: THEME.colors.slate[500],
    marginTop: 2,
  },
});
