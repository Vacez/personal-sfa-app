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
import { PipelineStage } from '../types';

interface AddGuestModalProps {
  visible: boolean;
  stages: PipelineStage[];
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    phone: string;
    line_id?: string;
    birthday?: string;
    preferences?: string;
    initial_stage_id?: string;
  }) => void;
}

export const AddGuestModal: React.FC<AddGuestModalProps> = ({
  visible,
  stages,
  onClose,
  onSubmit,
}) => {
  const { t } = useLanguage();
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [lineId, setLineId] = useState<string>('');
  const [birthday, setBirthday] = useState<string>('');
  const [preferences, setPreferences] = useState<string>('');
  const [selectedStageId, setSelectedStageId] = useState<string>(stages[0]?.id || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (stages.length > 0 && !selectedStageId) {
      setSelectedStageId(stages[0].id);
    }
  }, [stages]);

  const handleSave = () => {
    if (!name.trim()) {
      setErrorMsg(t.contacts.fullName + ' is required');
      return;
    }

    onSubmit({
      name: name.trim(),
      phone: phone.trim(),
      line_id: lineId.trim() || undefined,
      birthday: birthday.trim() || undefined,
      preferences: preferences.trim() || undefined,
      initial_stage_id: selectedStageId || undefined,
    });

    setName('');
    setPhone('');
    setLineId('');
    setBirthday('');
    setPreferences('');
    setErrorMsg(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>CONTACTS / ADD</Text>
              <Text style={styles.title}>{t.contacts.addGuestTitle}</Text>
              <Text style={styles.subtitle}>Create a guest record. Add details shared during visits.</Text>
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

            {/* Full Name */}
            <Text style={styles.inputLabel}>{t.contacts.fullName}</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Kenji Sato / Ayumi S."
              placeholderTextColor={THEME.colors.slate[400]}
            />

            {/* Phone */}
            <Text style={styles.inputLabel}>{t.contacts.phone}</Text>
            <TextInput
              style={styles.textInput}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="+81 90-1234-5678 / 0812-3456-7890"
              placeholderTextColor={THEME.colors.slate[400]}
            />

            {/* LINE ID */}
            <Text style={styles.inputLabel}>{t.contacts.lineId}</Text>
            <TextInput
              style={styles.textInput}
              value={lineId}
              onChangeText={setLineId}
              placeholder="line_user_id / username"
              placeholderTextColor={THEME.colors.slate[400]}
            />

            {/* Birthday */}
            <Text style={styles.inputLabel}>{t.contacts.birthday}</Text>
            <TextInput
              style={styles.textInput}
              value={birthday}
              onChangeText={setBirthday}
              placeholder="MM-DD (e.g. 10-24)"
              placeholderTextColor={THEME.colors.slate[400]}
            />

            {/* Preferences */}
            <Text style={styles.inputLabel}>{t.contacts.preferences}</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={preferences}
              onChangeText={setPreferences}
              placeholder="Bottles, seating, dietary preferences, champagne label..."
              placeholderTextColor={THEME.colors.slate[400]}
              multiline
              numberOfLines={3}
            />

            {/* Initial Stage */}
            <Text style={styles.inputLabel}>{t.contacts.initialStage}</Text>
            <View style={styles.stageGrid}>
              {stages.map((st) => {
                const isSelected = st.id === selectedStageId;
                const stageName = t.deals.stages[st.name] || st.name;
                return (
                  <TouchableOpacity
                    key={st.id}
                    style={[styles.stagePill, isSelected && styles.stagePillActive]}
                    onPress={() => setSelectedStageId(st.id)}
                  >
                    <Text style={[styles.stagePillText, isSelected && styles.stagePillTextActive]}>
                      {stageName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Buttons */}
            <TouchableOpacity style={styles.primaryBtn} onPress={handleSave}>
              <Text style={styles.primaryBtnText}>{t.contacts.saveGuestBtn}</Text>
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
    paddingVertical: 14,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
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
    marginTop: 10,
    marginBottom: 6,
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
    height: 65,
    textAlignVertical: 'top',
  },
  stageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
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
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.slate[500],
  },
});
