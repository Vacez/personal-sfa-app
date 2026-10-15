import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { THEME } from '../constants/theme';
import { useLanguage } from '../i18n';
import { sfaService } from '../services/sfaService';
import { Contact } from '../types';

interface ContactDetailModalProps {
  visible: boolean;
  contact: Contact | null;
  onClose: () => void;
  onInteractionLogged: () => void;
  onOpenRecordSales: (contact: Contact) => void;
}

export const ContactDetailModal: React.FC<ContactDetailModalProps> = ({
  visible,
  contact,
  onClose,
  onInteractionLogged,
  onOpenRecordSales,
}) => {
  const { t, formatCurrency, formatDate } = useLanguage();
  const [selectedChannel, setSelectedChannel] = useState<'LINE' | 'INSTAGRAM_DM' | 'PHONE' | 'EMAIL'>('LINE');
  const [interactionNotes, setInteractionNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'info' | 'timeline'>('info');

  if (!contact) return null;

  const handleLogInteraction = async () => {
    if (!interactionNotes.trim()) return;

    setIsSubmitting(true);
    try {
      await sfaService.logInteraction(contact.id, {
        channel: selectedChannel,
        notes: interactionNotes,
      });
      setInteractionNotes('');
      onInteractionLogged();
    } catch (err) {
      console.warn('Failed to log interaction:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stageName = contact.stage?.name
    ? t.deals.stages[contact.stage.name] || contact.stage.name
    : t.deals.stages['First Visit / Inquiry'] || 'Inquiry';

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.name}>{contact.name}</Text>
              <Text style={styles.subtitle}>
                {contact.display_name || contact.phone || t.contacts.defaultPatron}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Metrics Bar */}
          <View style={styles.metricsBar}>
            <View style={styles.metricCol}>
              <Text style={styles.metricLabel}>{t.contacts.sortLtv}</Text>
              <Text style={styles.metricValLtv}>{formatCurrency(contact.lifetime_sales_amount)}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricCol}>
              <Text style={styles.metricLabel}>{t.alerts.dealAmount}</Text>
              <Text style={styles.metricVal}>{formatCurrency(contact.expected_amount)}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricCol}>
              <Text style={styles.metricLabel}>{t.alerts.stage}</Text>
              <Text style={styles.metricValStage}>{stageName}</Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabHeader}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'info' && styles.tabBtnActive]}
              onPress={() => setActiveTab('info')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'info' && styles.tabBtnTextActive]}>
                {t.modals.clientProfile}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'timeline' && styles.tabBtnActive]}
              onPress={() => setActiveTab('timeline')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'timeline' && styles.tabBtnTextActive]}>
                {t.modals.timelineLogs}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            {activeTab === 'info' ? (
              <View>
                {/* Contact Coordinates */}
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>{t.modals.contactCoordinates}</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t.modals.phone}</Text>
                    <Text style={styles.infoValue}>{contact.phone || t.modals.notRecorded}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t.modals.snsAccount}</Text>
                    <Text style={styles.infoValue}>{contact.sns_account || t.modals.notLinked}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t.modals.birthday}</Text>
                    <Text style={styles.infoValue}>{contact.birthday || t.modals.notRecorded}</Text>
                  </View>
                </View>

                {/* Custom Attributes (VIP / B2B) */}
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>
                    {contact.contact_mode === 'VIP_HOSPITALITY'
                      ? t.modals.guestPreferences
                      : t.modals.b2bContext}
                  </Text>
                  {contact.custom_attributes && Object.keys(contact.custom_attributes).length > 0 ? (
                    Object.entries(contact.custom_attributes).map(([key, val]) => (
                      <View key={key} style={styles.infoRow}>
                        <Text style={styles.infoLabel}>{key.replace('_', ' ')}:</Text>
                        <Text style={styles.infoValue}>{String(val)}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>{t.modals.noPreferences}</Text>
                  )}
                </View>
              </View>
            ) : (
              <View>
                {/* Log Interaction Form */}
                <View style={styles.logFormCard}>
                  <Text style={styles.sectionTitle}>{t.modals.logNewOutreach}</Text>
                  <View style={styles.channelRow}>
                    {(['LINE', 'INSTAGRAM_DM', 'PHONE', 'EMAIL'] as const).map((ch) => (
                      <TouchableOpacity
                        key={ch}
                        style={[styles.channelChip, selectedChannel === ch && styles.channelChipActive]}
                        onPress={() => setSelectedChannel(ch)}
                      >
                        <Text
                          style={[
                            styles.channelChipText,
                            selectedChannel === ch && styles.channelChipTextActive,
                          ]}
                        >
                          {ch === 'INSTAGRAM_DM' ? 'IG DM' : ch}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TextInput
                    style={styles.notesInput}
                    placeholder={t.modals.notesPlaceholder}
                    placeholderTextColor={THEME.colors.slate[400]}
                    value={interactionNotes}
                    onChangeText={setInteractionNotes}
                    multiline
                  />

                  <TouchableOpacity
                    style={[styles.logSubmitBtn, (!interactionNotes.trim() || isSubmitting) && styles.logSubmitBtnDisabled]}
                    onPress={handleLogInteraction}
                    disabled={!interactionNotes.trim() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color={THEME.colors.white} />
                    ) : (
                      <Text style={styles.logSubmitBtnText}>{t.modals.saveInteraction}</Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* History */}
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>{t.modals.interactionHistory}</Text>
                  {contact.interaction_logs && contact.interaction_logs.length > 0 ? (
                    contact.interaction_logs.map((log) => (
                      <View key={log.id} style={styles.timelineItem}>
                        <View style={styles.timelineDot} />
                        <View style={styles.timelineContent}>
                          <Text style={styles.timelineChannel}>
                            [{log.channel}] {formatDate(log.interacted_at)}
                          </Text>
                          <Text style={styles.timelineNotes}>{log.notes}</Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>{t.modals.noOutreachHistory}</Text>
                  )}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Bottom Action Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.recordBillBtn}
              onPress={() => {
                onClose();
                onOpenRecordSales(contact);
              }}
            >
              <Text style={styles.recordBillBtnText}>{t.modals.recordBillBtn}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: THEME.colors.white,
    borderTopLeftRadius: THEME.radius.xl,
    borderTopRightRadius: THEME.radius.xl,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: THEME.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.slate[200],
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.colors.slate[900],
  },
  subtitle: {
    fontSize: 12,
    color: THEME.colors.slate[500],
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.slate[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: THEME.colors.slate[600],
    fontWeight: 'bold',
  },
  metricsBar: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.slate[50],
    paddingVertical: 12,
    paddingHorizontal: THEME.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.slate[200],
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: THEME.colors.slate[200],
  },
  metricLabel: {
    fontSize: 10,
    color: THEME.colors.slate[500],
    textTransform: 'uppercase',
  },
  metricValLtv: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.emerald[700],
    marginTop: 2,
  },
  metricVal: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.slate[800],
    marginTop: 2,
  },
  metricValStage: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.brand[600],
    marginTop: 2,
  },
  tabHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.slate[200],
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: THEME.colors.brand[600],
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.slate[500],
  },
  tabBtnTextActive: {
    color: THEME.colors.brand[600],
    fontWeight: '700',
  },
  body: {
    padding: THEME.spacing.lg,
  },
  sectionCard: {
    backgroundColor: THEME.colors.slate[50],
    borderRadius: THEME.radius.md,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.slate[200],
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.slate[800],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: THEME.colors.slate[500],
    textTransform: 'capitalize',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.slate[800],
  },
  emptyText: {
    fontSize: 12,
    color: THEME.colors.slate[400],
    fontStyle: 'italic',
  },
  logFormCard: {
    backgroundColor: THEME.colors.white,
    borderRadius: THEME.radius.md,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.brand[200],
  },
  channelRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  channelChip: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: THEME.radius.sm,
    backgroundColor: THEME.colors.slate[100],
    alignItems: 'center',
  },
  channelChipActive: {
    backgroundColor: THEME.colors.brand[600],
  },
  channelChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.slate[600],
  },
  channelChipTextActive: {
    color: THEME.colors.white,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: THEME.colors.slate[200],
    borderRadius: THEME.radius.md,
    padding: 10,
    fontSize: 12,
    color: THEME.colors.slate[900],
    height: 70,
    textAlignVertical: 'top',
    backgroundColor: THEME.colors.slate[50],
  },
  logSubmitBtn: {
    backgroundColor: THEME.colors.brand[600],
    paddingVertical: 10,
    borderRadius: THEME.radius.md,
    alignItems: 'center',
    marginTop: 8,
  },
  logSubmitBtnDisabled: {
    opacity: 0.5,
  },
  logSubmitBtnText: {
    color: THEME.colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.brand[500],
    marginTop: 4,
    marginRight: 8,
  },
  timelineContent: {
    flex: 1,
  },
  timelineChannel: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.slate[600],
  },
  timelineNotes: {
    fontSize: 12,
    color: THEME.colors.slate[800],
    marginTop: 2,
    lineHeight: 16,
  },
  footer: {
    padding: THEME.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.slate[200],
  },
  recordBillBtn: {
    backgroundColor: THEME.colors.slate[900],
    paddingVertical: 14,
    borderRadius: THEME.radius.lg,
    alignItems: 'center',
  },
  recordBillBtnText: {
    color: THEME.colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
});
