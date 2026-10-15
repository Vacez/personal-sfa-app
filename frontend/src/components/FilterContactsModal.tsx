import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { THEME } from '../constants/theme';
import { useLanguage } from '../i18n';

export interface FilterCriteria {
  sortBy: 'ltv' | 'last_contacted' | 'name';
  inactiveOnly: boolean;
  birthdayOnly: boolean;
  unpaidOnly: boolean;
}

interface FilterContactsModalProps {
  visible: boolean;
  currentFilter: FilterCriteria;
  onClose: () => void;
  onApply: (filter: FilterCriteria) => void;
  onReset: () => void;
}

export const FilterContactsModal: React.FC<FilterContactsModalProps> = ({
  visible,
  currentFilter,
  onClose,
  onApply,
  onReset,
}) => {
  const { t } = useLanguage();
  const [sortBy, setSortBy] = useState<'ltv' | 'last_contacted' | 'name'>(currentFilter.sortBy);
  const [inactiveOnly, setInactiveOnly] = useState<boolean>(currentFilter.inactiveOnly);
  const [birthdayOnly, setBirthdayOnly] = useState<boolean>(currentFilter.birthdayOnly);
  const [unpaidOnly, setUnpaidOnly] = useState<boolean>(currentFilter.unpaidOnly);

  React.useEffect(() => {
    setSortBy(currentFilter.sortBy);
    setInactiveOnly(currentFilter.inactiveOnly);
    setBirthdayOnly(currentFilter.birthdayOnly);
    setUnpaidOnly(currentFilter.unpaidOnly);
  }, [currentFilter, visible]);

  const handleApply = () => {
    onApply({
      sortBy,
      inactiveOnly,
      birthdayOnly,
      unpaidOnly,
    });
    onClose();
  };

  const handleReset = () => {
    setSortBy('ltv');
    setInactiveOnly(false);
    setBirthdayOnly(false);
    setUnpaidOnly(false);
    onReset();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>CONTACTS / FILTER</Text>
              <Text style={styles.title}>{t.contacts.filterTitle}</Text>
              <Text style={styles.subtitle}>{t.contacts.filterSubtitle}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Sort By Section */}
          <Text style={styles.sectionTitle}>{t.contacts.rankBy}</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={[styles.radioItem, sortBy === 'ltv' && styles.radioItemActive]}
              onPress={() => setSortBy('ltv')}
            >
              <View style={[styles.radioCircle, sortBy === 'ltv' && styles.radioCircleActive]}>
                {sortBy === 'ltv' && <View style={styles.radioDot} />}
              </View>
              <View style={styles.radioContent}>
                <Text style={styles.radioLabel}>{t.contacts.sortLtv}</Text>
                <Text style={styles.radioSub}>{t.contacts.sortLtvDesc}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.radioItem, sortBy === 'last_contacted' && styles.radioItemActive]}
              onPress={() => setSortBy('last_contacted')}
            >
              <View style={[styles.radioCircle, sortBy === 'last_contacted' && styles.radioCircleActive]}>
                {sortBy === 'last_contacted' && <View style={styles.radioDot} />}
              </View>
              <View style={styles.radioContent}>
                <Text style={styles.radioLabel}>{t.contacts.sortRecent}</Text>
                <Text style={styles.radioSub}>{t.contacts.sortRecentDesc}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.radioItem, sortBy === 'name' && styles.radioItemActive]}
              onPress={() => setSortBy('name')}
            >
              <View style={[styles.radioCircle, sortBy === 'name' && styles.radioCircleActive]}>
                {sortBy === 'name' && <View style={styles.radioDot} />}
              </View>
              <View style={styles.radioContent}>
                <Text style={styles.radioLabel}>{t.contacts.sortName}</Text>
                <Text style={styles.radioSub}>{t.contacts.sortNameDesc}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Filter Matching Criteria */}
          <Text style={styles.sectionTitle}>{t.contacts.filterCriteria}</Text>
          <View style={styles.checkGroup}>
            <TouchableOpacity
              style={[styles.checkItem, inactiveOnly && styles.checkItemActive]}
              onPress={() => setInactiveOnly(!inactiveOnly)}
            >
              <View style={[styles.checkBox, inactiveOnly && styles.checkBoxActive]}>
                {inactiveOnly && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <Text style={styles.checkLabel}>{t.contacts.filterInactive}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.checkItem, birthdayOnly && styles.checkItemActive]}
              onPress={() => setBirthdayOnly(!birthdayOnly)}
            >
              <View style={[styles.checkBox, birthdayOnly && styles.checkBoxActive]}>
                {birthdayOnly && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <Text style={styles.checkLabel}>{t.contacts.filterBirthday}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.checkItem, unpaidOnly && styles.checkItemActive]}
              onPress={() => setUnpaidOnly(!unpaidOnly)}
            >
              <View style={[styles.checkBox, unpaidOnly && styles.checkBoxActive]}>
                {unpaidOnly && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <Text style={styles.checkLabel}>{t.contacts.filterUnpaidTab}</Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
            <Text style={styles.applyBtnText}>{t.contacts.applyFilters}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <Text style={styles.resetBtnText}>{t.contacts.resetFilters}</Text>
          </TouchableOpacity>

          <View style={{ height: 24 }} />
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
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.slate[700],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 14,
    marginBottom: 8,
  },
  radioGroup: {
    gap: 8,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: THEME.colors.slate[50],
    borderWidth: 1,
    borderColor: THEME.colors.slate[200],
  },
  radioItemActive: {
    backgroundColor: THEME.colors.brand[50],
    borderColor: THEME.colors.brand[400],
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: THEME.colors.slate[400],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioCircleActive: {
    borderColor: THEME.colors.brand[600],
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.colors.brand[600],
  },
  radioContent: {
    flex: 1,
  },
  radioLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.slate[900],
  },
  radioSub: {
    fontSize: 11,
    color: THEME.colors.slate[500],
    marginTop: 2,
  },
  checkGroup: {
    gap: 8,
    marginTop: 4,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: THEME.colors.slate[50],
    borderWidth: 1,
    borderColor: THEME.colors.slate[200],
  },
  checkItemActive: {
    backgroundColor: THEME.colors.brand[50],
    borderColor: THEME.colors.brand[300],
  },
  checkBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: THEME.colors.slate[400],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkBoxActive: {
    backgroundColor: THEME.colors.brand[600],
    borderColor: THEME.colors.brand[600],
  },
  checkMark: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  checkLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.slate[800],
  },
  applyBtn: {
    backgroundColor: THEME.colors.brand[600],
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
    shadowColor: THEME.colors.brand[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  applyBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  resetBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.slate[500],
  },
});
