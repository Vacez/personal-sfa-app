import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { THEME } from '../constants/theme';
import { useLanguage } from '../i18n';
import { Contact, PipelineStage } from '../types';

interface AdvanceStageModalProps {
  visible: boolean;
  contact: Contact | null;
  currentStage: PipelineStage | null;
  nextStage: PipelineStage | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const AdvanceStageModal: React.FC<AdvanceStageModalProps> = ({
  visible,
  contact,
  currentStage,
  nextStage,
  onClose,
  onConfirm,
}) => {
  const { t, formatCurrency } = useLanguage();

  if (!contact || !currentStage || !nextStage) return null;

  const currentStageName = t.deals.stages[currentStage.name] || currentStage.name;
  const nextStageName = t.deals.stages[nextStage.name] || nextStage.name;

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.eyebrow}>ADVANCE PIPELINE STAGE</Text>
            <Text style={styles.contactName}>{contact.name}</Text>
            <Text style={styles.contactSubtitle}>
              {contact.display_name || contact.phone || t.contacts.defaultPatron} • Expected:{' '}
              {formatCurrency(contact.expected_amount || 0)}
            </Text>
          </View>

          {/* Stages Comparison */}
          <View style={styles.stageFlow}>
            <View style={styles.stageBox}>
              <Text style={styles.stageLabel}>{t.deals.currentStage}</Text>
              <Text style={styles.stageVal}>{currentStageName}</Text>
              <View style={styles.probPill}>
                <Text style={styles.probText}>{currentStage.win_probability_rate}%</Text>
              </View>
            </View>

            <Text style={styles.arrowIcon}>➔</Text>

            <View style={[styles.stageBox, styles.stageBoxNext]}>
              <Text style={styles.stageLabelNext}>{t.deals.proposedNextStage}</Text>
              <Text style={styles.stageValNext}>{nextStageName}</Text>
              <View style={[styles.probPill, styles.probPillNext]}>
                <Text style={styles.probTextNext}>{nextStage.win_probability_rate}%</Text>
              </View>
            </View>
          </View>

          {/* Info Notice */}
          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>
              {t.deals.confirmAdvanceSubtitle} Expected bill ({formatCurrency(contact.expected_amount || 0)}) will update to weighted value {formatCurrency((contact.expected_amount || 0) * (nextStage.win_probability_rate / 100))}.
            </Text>
          </View>

          {/* Buttons */}
          <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
            <Text style={styles.confirmBtnText}>{t.deals.confirmStageUpdate}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>{t.common.cancel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 380,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.slate[200],
    paddingBottom: 12,
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
  stageFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stageBox: {
    flex: 1,
    backgroundColor: THEME.colors.slate[50],
    borderWidth: 1,
    borderColor: THEME.colors.slate[200],
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  stageBoxNext: {
    backgroundColor: THEME.colors.brand[50],
    borderColor: THEME.colors.brand[300],
  },
  stageLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: THEME.colors.slate[500],
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  stageLabelNext: {
    fontSize: 9,
    fontWeight: '800',
    color: THEME.colors.brand[700],
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  stageVal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: THEME.colors.slate[800],
    textAlign: 'center',
    marginBottom: 6,
  },
  stageValNext: {
    fontSize: 12,
    fontWeight: 'bold',
    color: THEME.colors.brand[800],
    textAlign: 'center',
    marginBottom: 6,
  },
  arrowIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.colors.slate[400],
    paddingHorizontal: 8,
  },
  probPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: THEME.colors.slate[200],
  },
  probPillNext: {
    backgroundColor: THEME.colors.brand[600],
  },
  probText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.slate[700],
  },
  probTextNext: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  noticeBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: THEME.colors.slate[200],
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  noticeText: {
    fontSize: 11,
    color: THEME.colors.slate[600],
    lineHeight: 16,
  },
  confirmBtn: {
    backgroundColor: THEME.colors.brand[600],
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: THEME.colors.brand[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  cancelBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.slate[500],
  },
});
