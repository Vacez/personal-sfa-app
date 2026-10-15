import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { THEME } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n';
import { AppMode } from '../types';

export const AuthScreen: React.FC = () => {
  const { login, register } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('user@example.com');
  const [password, setPassword] = useState<string>('password123');
  const [name, setName] = useState<string>('Kenji Takahashi');
  const [defaultMode, setDefaultMode] = useState<AppMode>('VIP_HOSPITALITY');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email || !password) {
      setErrorMessage(t.auth.requiredFields);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (isRegisterMode) {
        await register({
          email,
          password,
          name,
          default_mode: defaultMode,
        });
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setErrorMessage(err.message || t.auth.authFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Language Switcher Pill for Auth Screen */}
        <View style={styles.langSelectorContainer}>
          <View style={styles.langSelector}>
            <TouchableOpacity
              onPress={() => setLanguage('id')}
              style={[styles.langBtn, language === 'id' && styles.langBtnActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.langBtnText, language === 'id' && styles.langBtnTextActive]}>
                🇮🇩 Bahasa Indonesia
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
        </View>

        {/* Brand Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>SFA</Text>
          </View>
          <Text style={styles.title}>{t.auth.title}</Text>
          <Text style={styles.subtitle}>{t.auth.subtitle}</Text>
        </View>

        {/* Auth Card */}
        <View style={styles.card}>
          <View style={styles.modeTabs}>
            <TouchableOpacity
              style={[styles.tabBtn, !isRegisterMode && styles.tabBtnActive]}
              onPress={() => setIsRegisterMode(false)}
            >
              <Text style={[styles.tabBtnText, !isRegisterMode && styles.tabBtnTextActive]}>
                {t.auth.signIn}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, isRegisterMode && styles.tabBtnActive]}
              onPress={() => setIsRegisterMode(true)}
            >
              <Text style={[styles.tabBtnText, isRegisterMode && styles.tabBtnTextActive]}>
                {t.auth.register}
              </Text>
            </TouchableOpacity>
          </View>

          {errorMessage && (
            <View style={styles.errorAlert}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {isRegisterMode && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>{t.auth.fullName}</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder={t.auth.namePlaceholder}
                placeholderTextColor={THEME.colors.slate[400]}
              />
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t.auth.email}</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder={t.auth.emailPlaceholder}
              placeholderTextColor={THEME.colors.slate[400]}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t.auth.password}</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder={t.auth.passwordPlaceholder}
              placeholderTextColor={THEME.colors.slate[400]}
            />
          </View>

          {isRegisterMode && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>{t.auth.initialMode}</Text>
              <View style={styles.modeSelectRow}>
                <TouchableOpacity
                  style={[
                    styles.modeOption,
                    defaultMode === 'VIP_HOSPITALITY' && styles.modeOptionActiveVip,
                  ]}
                  onPress={() => setDefaultMode('VIP_HOSPITALITY')}
                >
                  <Text
                    style={[
                      styles.modeOptionText,
                      defaultMode === 'VIP_HOSPITALITY' && styles.modeOptionTextActive,
                    ]}
                  >
                    🍾 {t.modes.vipTitle}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modeOption,
                    defaultMode === 'B2B_CONSULTING' && styles.modeOptionActiveB2b,
                  ]}
                  onPress={() => setDefaultMode('B2B_CONSULTING')}
                >
                  <Text
                    style={[
                      styles.modeOptionText,
                      defaultMode === 'B2B_CONSULTING' && styles.modeOptionTextActive,
                    ]}
                  >
                    💼 {t.modes.b2bTitle}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={THEME.colors.white} />
            ) : (
              <Text style={styles.submitBtnText}>
                {isRegisterMode ? t.auth.submitRegister : t.auth.submitSignIn}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoFillBtn}
            onPress={() => {
              setEmail('user@example.com');
              setPassword('password123');
              setName('Kenji Takahashi');
              setIsRegisterMode(false);
            }}
          >
            <Text style={styles.demoFillBtnText}>⚡ {t.auth.demoHint}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.slate[900],
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: THEME.spacing.xl,
  },
  langSelectorContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  langSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: THEME.radius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: THEME.radius.full,
  },
  langBtnActive: {
    backgroundColor: THEME.colors.white,
  },
  langBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.slate[300],
  },
  langBtnTextActive: {
    color: THEME.colors.slate[900],
  },
  header: {
    alignItems: 'center',
    marginBottom: THEME.spacing.xl,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: THEME.colors.brand[600],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: THEME.colors.brand[500],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: THEME.colors.white,
    letterSpacing: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: THEME.colors.white,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: THEME.colors.slate[400],
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: THEME.colors.white,
    borderRadius: THEME.radius.xl,
    padding: THEME.spacing.xl,
    shadowColor: THEME.colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.slate[100],
    borderRadius: THEME.radius.md,
    padding: 3,
    marginBottom: THEME.spacing.lg,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: THEME.radius.sm,
  },
  tabBtnActive: {
    backgroundColor: THEME.colors.white,
    shadowColor: THEME.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.slate[500],
  },
  tabBtnTextActive: {
    color: THEME.colors.slate[900],
  },
  errorAlert: {
    backgroundColor: THEME.colors.rose[50],
    borderWidth: 1,
    borderColor: THEME.colors.rose[200],
    borderRadius: THEME.radius.md,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    color: THEME.colors.rose[700],
    fontSize: 11,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.slate[700],
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: THEME.colors.slate[50],
    borderWidth: 1,
    borderColor: THEME.colors.slate[200],
    borderRadius: THEME.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: THEME.colors.slate[900],
  },
  modeSelectRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.slate[200],
    alignItems: 'center',
    backgroundColor: THEME.colors.slate[50],
  },
  modeOptionActiveVip: {
    borderColor: THEME.colors.vip.primary,
    backgroundColor: THEME.colors.vip.light,
  },
  modeOptionActiveB2b: {
    borderColor: THEME.colors.b2b.primary,
    backgroundColor: THEME.colors.b2b.light,
  },
  modeOptionText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.slate[600],
  },
  modeOptionTextActive: {
    color: THEME.colors.slate[900],
  },
  submitBtn: {
    backgroundColor: THEME.colors.brand[600],
    borderRadius: THEME.radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: THEME.colors.white,
    fontSize: 13,
    fontWeight: '800',
  },
  demoFillBtn: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  demoFillBtnText: {
    color: THEME.colors.brand[600],
    fontSize: 11,
    fontWeight: '700',
  },
});
