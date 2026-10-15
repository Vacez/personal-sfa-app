import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Header } from '../components/Header';
import { getApiBaseUrl, setApiBaseUrl } from '../constants/api';
import { THEME } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n';

export const SettingsScreen: React.FC = () => {
  const { user, currentMode, toggleMode, logout } = useAuth();
  const { language, setLanguage, t, formatCurrency } = useLanguage();
  const [apiUrl, setApiUrl] = useState<string>(getApiBaseUrl());
  const [urlSaved, setUrlSaved] = useState<boolean>(false);

  const handleSaveApiUrl = () => {
    setApiBaseUrl(apiUrl);
    setUrlSaved(true);
    setTimeout(() => setUrlSaved(false), 2000);
  };

  return (
    <View style={styles.container}>
      <Header
        title={t.settings.title}
        subtitle={t.settings.subtitle}
      />

      <ScrollView style={styles.content}>
        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0) || '👤'}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || 'Sales Professional'}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              <View style={styles.quotaPill}>
                <Text style={styles.quotaPillText}>
                  {t.settings.monthlyQuota}: {formatCurrency(user?.monthly_sales_quota || 1000000)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Language Selection Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t.settings.languageSection}</Text>
        </View>
        <View style={styles.card}>
          <TouchableOpacity
            style={[
              styles.personaOption,
              language === 'id' && styles.personaOptionActiveVip,
            ]}
            onPress={() => setLanguage('id')}
          >
            <View style={styles.personaRadio}>
              {language === 'id' && <View style={styles.personaRadioDot} />}
            </View>
            <View style={styles.personaTextCol}>
              <Text style={styles.personaTitle}>{t.settings.idTitle}</Text>
              <Text style={styles.personaDesc}>{t.settings.idDesc}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={[
              styles.personaOption,
              language === 'ja' && styles.personaOptionActiveB2b,
            ]}
            onPress={() => setLanguage('ja')}
          >
            <View style={styles.personaRadio}>
              {language === 'ja' && <View style={styles.personaRadioDot} />}
            </View>
            <View style={styles.personaTextCol}>
              <Text style={styles.personaTitle}>{t.settings.jaTitle}</Text>
              <Text style={styles.personaDesc}>{t.settings.jaDesc}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Operating Persona Switcher */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t.settings.personaSection}</Text>
        </View>
        <View style={styles.card}>
          <TouchableOpacity
            style={[
              styles.personaOption,
              currentMode === 'VIP_HOSPITALITY' && styles.personaOptionActiveVip,
            ]}
            onPress={() => currentMode !== 'VIP_HOSPITALITY' && toggleMode()}
          >
            <View style={styles.personaRadio}>
              {currentMode === 'VIP_HOSPITALITY' && <View style={styles.personaRadioDot} />}
            </View>
            <View style={styles.personaTextCol}>
              <Text style={styles.personaTitle}>🍾 {t.modes.vipFull}</Text>
              <Text style={styles.personaDesc}>
                {t.modes.vipDesc}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={[
              styles.personaOption,
              currentMode === 'B2B_CONSULTING' && styles.personaOptionActiveB2b,
            ]}
            onPress={() => currentMode !== 'B2B_CONSULTING' && toggleMode()}
          >
            <View style={styles.personaRadio}>
              {currentMode === 'B2B_CONSULTING' && <View style={styles.personaRadioDot} />}
            </View>
            <View style={styles.personaTextCol}>
              <Text style={styles.personaTitle}>💼 {t.modes.b2bFull}</Text>
              <Text style={styles.personaDesc}>
                {t.modes.b2bDesc}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* API Endpoint Configuration */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t.settings.apiSection}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>{t.settings.apiBaseUrl}</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={apiUrl}
              onChangeText={setApiUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.saveUrlBtn} onPress={handleSaveApiUrl}>
              <Text style={styles.saveUrlBtnText}>{urlSaved ? t.settings.saved : t.settings.save}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.fieldHint}>
            {t.settings.apiHint}
          </Text>
        </View>

        {/* Outbound Integrations */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t.settings.integrationSection}</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.integrationItem}>
            <View style={styles.integrationIconBox}>
              <Text style={styles.integrationIcon}>📸</Text>
            </View>
            <View style={styles.integrationInfo}>
              <Text style={styles.integrationTitle}>{t.settings.metaApiTitle}</Text>
              <Text style={styles.integrationStatus}>{t.settings.metaApiStatus}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.integrationItem}>
            <View style={styles.integrationIconBox}>
              <Text style={styles.integrationIcon}>📑</Text>
            </View>
            <View style={styles.integrationInfo}>
              <Text style={styles.integrationTitle}>{t.settings.accountingTitle}</Text>
              <Text style={styles.integrationStatus}>
                {t.settings.accountingStatus}
              </Text>
            </View>
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutBtnText}>{t.settings.signOut}</Text>
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.slate[50],
  },
  content: {
    flex: 1,
  },
  card: {
    backgroundColor: THEME.colors.white,
    borderRadius: THEME.radius.lg,
    padding: THEME.spacing.lg,
    marginHorizontal: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.slate[200],
    shadowColor: THEME.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME.colors.slate[900],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.colors.white,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.slate[900],
  },
  profileEmail: {
    fontSize: 12,
    color: THEME.colors.slate[500],
    marginTop: 1,
  },
  quotaPill: {
    alignSelf: 'flex-start',
    backgroundColor: THEME.colors.brand[50],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.radius.sm,
    marginTop: 6,
  },
  quotaPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.brand[700],
  },
  sectionHeader: {
    paddingHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.sm,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.slate[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  personaOption: {
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'flex-start',
  },
  personaOptionActiveVip: {
    backgroundColor: THEME.colors.vip.light,
    borderRadius: THEME.radius.md,
    paddingHorizontal: 8,
  },
  personaOptionActiveB2b: {
    backgroundColor: THEME.colors.b2b.light,
    borderRadius: THEME.radius.md,
    paddingHorizontal: 8,
  },
  personaRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: THEME.colors.slate[400],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginRight: 10,
  },
  personaRadioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.brand[600],
  },
  personaTextCol: {
    flex: 1,
  },
  personaTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.slate[900],
  },
  personaDesc: {
    fontSize: 11,
    color: THEME.colors.slate[600],
    marginTop: 4,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.colors.slate[100],
    marginVertical: 10,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.slate[600],
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: THEME.colors.slate[50],
    borderWidth: 1,
    borderColor: THEME.colors.slate[200],
    borderRadius: THEME.radius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: THEME.colors.slate[900],
  },
  saveUrlBtn: {
    backgroundColor: THEME.colors.brand[600],
    paddingHorizontal: 14,
    borderRadius: THEME.radius.md,
    justifyContent: 'center',
  },
  saveUrlBtnText: {
    color: THEME.colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  fieldHint: {
    fontSize: 10,
    color: THEME.colors.slate[400],
    marginTop: 6,
  },
  integrationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  integrationIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: THEME.colors.slate[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  integrationIcon: {
    fontSize: 18,
  },
  integrationInfo: {
    flex: 1,
  },
  integrationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.slate[900],
  },
  integrationStatus: {
    fontSize: 11,
    color: THEME.colors.slate[500],
    marginTop: 2,
  },
  logoutBtn: {
    backgroundColor: THEME.colors.rose[50],
    borderWidth: 1,
    borderColor: THEME.colors.rose[200],
    borderRadius: THEME.radius.lg,
    paddingVertical: 14,
    marginHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.sm,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: THEME.colors.rose[700],
    fontSize: 13,
    fontWeight: '800',
  },
});
