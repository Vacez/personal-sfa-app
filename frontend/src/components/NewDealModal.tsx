import React, { useState } from 'react';
import {
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
import { Contact, PipelineStage } from '../types';

interface NewDealModalProps {
  visible: boolean;
  contacts: Contact[];
  stages: PipelineStage[];
  onClose: () => void;
  onSubmit: (data: {
    contactId: string;
    expectedAmount: number;
    stageId: string;
    intendedDate: string;
    notes: string;
  }) => void;
}

export const NewDealModal: React.FC<NewDealModalProps> = ({
  visible,
  contacts,
  stages,
  onClose,
  onSubmit,
}) => {
  const { t, formatCurrency } = useLanguage();
  const [selectedContactId, setSelectedContactId] = useState<string>(contacts[0]?.id || '');
  const [expectedAmount, setExpectedAmount] = useState<string>('50000');
  const [selectedStageId, setSelectedStageId] = useState<string>(stages[0]?.id || '');
  const [intendedDate, setIntendedDate] = useState<string>(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (contacts.length > 0 && !selectedContactId) {
      setSelectedContactId(contacts[0].id);
    }
    if (stages.length > 0 && !selectedStageId) {
      setSelectedStageId(stages[0].id);
    }
  }, [contacts, stages]);

  const handlePresetAmount = (val: number) => {
    const current = parseFloat(expectedAmount) || 0;
    setExpectedAmount(String(current + val));
  };

  const handleCreate = () => {
    if (!selectedContactId) {
      setErrorMsg(t.modals.errorSelectClient);
      return;
    }
    const numAmount = parseFloat(expectedAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg(t.modals.errorValidAmount);
      return;
    }

    onSubmit({
      contactId: selectedContactId,
      expectedAmount: numAmount,
      stageId: selectedStageId || stages[0]?.id || '',
      intendedDate,
      notes,
    });
    onClose();
  };

  const chosenContact = contacts.find((c) => c.id === selectedContactId) || contacts[0];
  const chosenStage = stages.find((s) => s.id === selectedStageId) || stages[0];

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>PIPELINE / NEW OPPORTUNITY</Text>
              <Text style={styles.title}>{t.deals.newDealTitle}</Text>
              <Text style={styles.subtitle}>{t.deals.newDealSubtitle}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {errorMsg && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {/* Select Guest */}
            <Text style={styles.inputLabel}>{t.deals.guestLabel}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.guestScroll}>
              {contacts.map((c) => {
                const isSelected = c.id === selectedContactId;
                return (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => setSelectedContactId(c.id)}
                    style={[styles.guestChip, isSelected && styles.guestChipActive]}
                  >
                    <Text style={[styles.guestChipText, isSelected && styles.guestChipTextActive]}>
                      {c.name}
                    </Text>
                    <Text style={[styles.guestChipSub, isSelected && styles.guestChipSubActive]}>
                      LTV: {formatCurrency(c.lifetime_sales_amount || 0)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Expected Amount */}
            <Text style={styles.inputLabel}>{t.deals.expectedAmountLabel}</Text>
            <View style={styles.amountInputRow}>
              <Text style={styles.currencyPrefix}>¥</Text>
              <TextInput
                style={styles.amountInput}
                keyboardType="numeric"
                value={expectedAmount}
                onChangeText={setExpectedAmount}
                placeholder="50,000"
                placeholderTextColor={THEME.colors.slate[400]}
              />
            </View>

            {/* Preset Amount Chips */}
            <View style={styles.presetRow}>
              {[30000, 50000, 100000].map((val) => (
                <TouchableOpacity
                  key={val}
                  style={styles.presetChip}
                  onPress={() => handlePresetAmount(val)}
                >
                  <Text style={styles.presetChipText}>+{formatCurrency(val)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Stage Selector */}
            <Text style={styles.inputLabel}>{t.deals.stageLabel}</Text>
            <View style={styles.stageGrid}>
              {stages.map((st) => {
                const isSelected = st.id === selectedStageId;
                const name = t.deals.stages[st.name] || st.name;
                return (
                  <TouchableOpacity
                    key={st.id}
                    style={[styles.stagePill, isSelected && styles.stagePillActive]}
                    onPress={() => setSelectedStageId(st.id)}
                  >
                    <Text style={[styles.stagePillText, isSelected && styles.stagePillTextActive]}>
                      {name} ({st.win_probability_rate}%)
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Intended Visit Date */}
            <Text style={styles.inputLabel}>{t.deals.intendedDateLabel}</Text>
            <TextInput
              style={styles.textInput}
              value={intendedDate}
              onChangeText={setIntendedDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={THEME.colors.slate[400]}
            />

            {/* Notes */}
            <Text style={styles.inputLabel}>{t.deals.notesLabel}</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Proposed table booking — confirm visit time..."
              placeholderTextColor={THEME.colors.slate[400]}
              multiline
              numberOfLines={3}
            />

            {/* Info Summary Box */}
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxTitle}>💡 Pipeline Calculation Preview</Text>
              <Text style={styles.infoBoxText}>
                {chosenContact?.name || 'Guest'} • {chosenStage?.name || 'Stage'} ({chosenStage?.win_probability_rate || 0}%).
                Expected: {formatCurrency(parseFloat(expectedAmount) || 0)} ➔ Weighted: {formatCurrency((parseFloat(expectedAmount) || 0) * ((chosenStage?.win_probability_rate || 0) / 100))}
              </Text>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity style={styles.primaryBtn} onPress={handleCreate}>
              <Text style={styles.primaryBtnText}>{t.deals.createDealBtn}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>{t.common.cancel}</Text>
            </TouchableOpacity>

            <View style={{ height: 30 }} />
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
    maxHeight: '90%',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 16,
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
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.slate[900],
  },
  subtitle: {
    fontSize: 12,
    color: THEME.colors.slate[500],
    marginTop: 2,
    maxWidth: 280,
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
    paddingVertical: 16,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.slate[700],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 6,
  },
  guestScroll: {
    marginBottom: 8,
  },
  guestChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: THEME.colors.slate[50],
    borderWidth: 1,
    borderColor: THEME.colors.slate[200],
    marginRight: 8,
  },
  guestChipActive: {
    backgroundColor: THEME.colors.brand[50],
    borderColor: THEME.colors.brand[500],
  },
  guestChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.slate[700],
  },
  guestChipTextActive: {
    color: THEME.colors.brand[700],
  },
  guestChipSub: {
    fontSize: 10,
    color: THEME.colors.slate[400],
    marginTop: 2,
  },
  guestChipSubActive: {
    color: THEME.colors.brand[600],
    fontWeight: '600',
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.slate[200],
    borderRadius: 12,
    backgroundColor: THEME.colors.slate[50],
    paddingHorizontal: 12,
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.colors.slate[500],
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    height: 46,
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.colors.slate[900],
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  presetChip: {
    flex: 1,
    backgroundColor: THEME.colors.brand[50],
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.brand[200],
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.brand[700],
  },
  stageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  stagePill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: THEME.colors.slate[100],
    borderWidth: 1,
    borderColor: THEME.colors.slate[200],
  },
  stagePillActive: {
    backgroundColor: THEME.colors.brand[600],
    borderColor: THEME.colors.brand[600],
  },
  stagePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.slate[700],
  },
  stagePillTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  textInput: {
    borderWidth: 1,
    borderColor: THEME.colors.slate[200],
    borderRadius: 12,
    backgroundColor: THEME.colors.slate[50],
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: THEME.colors.slate[900],
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  infoBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: THEME.colors.slate[200],
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    marginBottom: 16,
  },
  infoBoxTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.colors.slate[800],
    marginBottom: 4,
  },
  infoBoxText: {
    fontSize: 11,
    color: THEME.colors.slate[600],
    lineHeight: 16,
  },
  primaryBtn: {
    backgroundColor: THEME.colors.brand[600],
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: THEME.colors.brand[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  cancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.slate[500],
  },
});
