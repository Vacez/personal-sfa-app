import React, { useState } from 'react';
import {
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { THEME } from '../constants/theme';
import { useLanguage } from '../i18n';
import { Contact } from '../types';

interface OutreachPitchModalProps {
  visible: boolean;
  contact: Contact | null;
  modeType: 'BIRTHDAY' | 'INACTIVE' | 'QUICK_CATCHUP';
  onClose: () => void;
}

export const OutreachPitchModal: React.FC<OutreachPitchModalProps> = ({
  visible,
  contact,
  modeType,
  onClose,
}) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState<boolean>(false);

  if (!contact) return null;

  const isBirthday = modeType === 'BIRTHDAY' || Boolean(contact.birthday);

  const templateTitle = isBirthday
    ? 'B. Birthday Warm Greetings & Table Hold'
    : 'C. Casual Weekend Catch-up';

  const metrics = isBirthday
    ? { cvr: '33%', sent: 12, won: 4 }
    : { cvr: '8%', sent: 34, won: 3 };

  const messageText = isBirthday
    ? `Happy birthday, ${contact.name}! Wishing you a wonderful year ahead. We would love to welcome you to the lounge for a birthday toast. Shall I check a table and a special reserve bottle for your visit?`
    : `Hi ${contact.name}, it's been a little while! Hope you're doing well. If you're around this weekend, we'd love to catch up at the lounge. Let me know if you'd like to check a table for you.`;

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(messageText);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleOpenLine = () => {
    const encoded = encodeURIComponent(messageText);
    const lineUrl = `line://msg/text/${encoded}`;
    Linking.canOpenURL(lineUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(lineUrl);
        } else {
          handleCopy();
        }
      })
      .catch(() => {
        handleCopy();
      });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>
                {isBirthday ? 'GROWTH • BIRTHDAY OUTREACH' : 'RETENTION • QUICK CATCH-UP'}
              </Text>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactSubtitle}>
                {contact.display_name || contact.phone || t.contacts.defaultPatron}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Copied Banner */}
            {copied && (
              <View style={styles.copiedBanner}>
                <Text style={styles.copiedBannerText}>{t.modals.copiedNotice}</Text>
              </View>
            )}

            {/* Template Card */}
            <View style={styles.templateSection}>
              <Text style={styles.templateTitle}>{templateTitle}</Text>

              {/* Metrics Row */}
              <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>{t.modals.cvrLabel}</Text>
                  <Text style={styles.metricVal}>{metrics.cvr}</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>{t.modals.sentCountLabel}</Text>
                  <Text style={styles.metricVal}>{metrics.sent}</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>{t.modals.wonCountLabel}</Text>
                  <Text style={styles.metricVal}>{metrics.won}</Text>
                </View>
              </View>

              {/* Message Draft Box */}
              <Text style={styles.draftLabel}>EDITABLE DRAFT MESSAGE</Text>
              <View style={styles.messageBox}>
                <Text style={styles.messageContent}>{messageText}</Text>
              </View>
              <Text style={styles.hintNotice}>
                Personalized copy ready for outreach. Edit before sending if desired.
              </Text>
            </View>

            {/* LINE Open CTA */}
            <TouchableOpacity style={styles.lineBtn} onPress={handleOpenLine}>
              <Text style={styles.lineBtnText}>💬 {t.modals.openLineBtn}</Text>
            </TouchableOpacity>

            {/* Copy CTA */}
            <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
              <Text style={styles.copyBtnText}>📋 {t.modals.copyAgain}</Text>
            </TouchableOpacity>

            {/* Close Button */}
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>{t.common.cancel}</Text>
            </TouchableOpacity>

            <View style={{ height: 24 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.slate[200],
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.brand[600],
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.slate[900],
  },
  contactSubtitle: {
    fontSize: 12,
    color: THEME.colors.slate[500],
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.slate[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    color: THEME.colors.slate[600],
    fontWeight: 'bold',
  },
  body: {
    paddingVertical: 14,
  },
  copiedBanner: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  copiedBannerText: {
    color: '#065f46',
    fontWeight: 'bold',
    fontSize: 13,
  },
  templateSection: {
    backgroundColor: THEME.colors.slate[50],
    borderWidth: 1,
    borderColor: THEME.colors.slate[200],
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  templateTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.slate[800],
    marginBottom: 10,
  },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: THEME.colors.slate[200],
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricDivider: {
    width: 1,
    backgroundColor: THEME.colors.slate[200],
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: THEME.colors.slate[500],
    textTransform: 'uppercase',
  },
  metricVal: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.brand[700],
    marginTop: 2,
  },
  draftLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: THEME.colors.slate[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  messageBox: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: THEME.colors.slate[200],
    borderRadius: 10,
    padding: 12,
  },
  messageContent: {
    fontSize: 13,
    color: THEME.colors.slate[800],
    lineHeight: 18,
  },
  hintNotice: {
    fontSize: 10,
    color: THEME.colors.slate[400],
    marginTop: 6,
  },
  lineBtn: {
    backgroundColor: '#06c755',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#06c755',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  lineBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  copyBtn: {
    backgroundColor: THEME.colors.brand[600],
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: THEME.colors.brand[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  copyBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  cancelBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.slate[500],
  },
});
