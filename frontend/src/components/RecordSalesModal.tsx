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

interface RecordSalesModalProps {
  visible: boolean;
  contacts: Contact[];
  onClose: () => void;
  onSuccess: () => void;
  selectedContact?: Contact | null;
}

export const RecordSalesModal: React.FC<RecordSalesModalProps> = ({
  visible,
  contacts,
  onClose,
  onSuccess,
  selectedContact,
}) => {
  const { t } = useLanguage();
  const [contactId, setContactId] = useState<string>(selectedContact?.id || '');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CREDIT_CARD' | 'RECEIVABLE'>('CREDIT_CARD');
  const [orderType, setOrderType] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (selectedContact) {
      setContactId(selectedContact.id);
    } else if (contacts.length > 0 && !contactId) {
      setContactId(contacts[0].id);
    }
  }, [selectedContact, contacts]);

  const handleSubmit = async () => {
    if (!contactId) {
      setErrorMsg(t.modals.errorSelectClient);
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg(t.modals.errorValidAmount);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await sfaService.recordTransaction({
        contact_id: contactId,
        amount: numAmount,
        payment_method: paymentMethod,
        transaction_date: new Date().toISOString().split('T')[0],
        metadata: {
          order_type: orderType || 'VIP Service & Bill',
        },
      });

      setAmount('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || t.modals.errorGeneralRecord);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{t.modals.recordSalesTitle}</Text>
              <Text style={styles.subtitle}>{t.modals.recordSalesSubtitle}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            {errorMsg && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {/* Client Selection */}
            <Text style={styles.label}>{t.modals.selectClient}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.clientScroll}>
              {contacts.map((c) => {
                const isSelected = c.id === contactId;
                return (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => setContactId(c.id)}
                    style={[
                      styles.clientChip,
                      isSelected && styles.clientChipSelected,
                    ]}
                  >
                    <Text style={[styles.clientChipText, isSelected && styles.clientChipTextSelected]}>
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Amount Input */}
            <Text style={styles.label}>{t.modals.salesAmount}</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.currencyPrefix}>¥</Text>
              <TextInput
                style={styles.amountInput}
                keyboardType="numeric"
                placeholder={t.modals.amountPlaceholder}
                placeholderTextColor={THEME.colors.slate[400]}
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            {/* Quick Amount Buttons */}
            <View style={styles.quickAmountRow}>
              {[50000, 100000, 250000, 500000].map((quickVal) => (
                <TouchableOpacity
                  key={quickVal}
                  style={styles.quickBtn}
                  onPress={() => setAmount(quickVal.toString())}
                >
                  <Text style={styles.quickBtnText}>+¥{(quickVal / 1000)}k</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Payment Method */}
            <Text style={styles.label}>{t.modals.paymentMethod}</Text>
            <View style={styles.methodRow}>
              {[
                { key: 'CREDIT_CARD', label: t.modals.card },
                { key: 'CASH', label: t.modals.cash },
                { key: 'RECEIVABLE', label: t.modals.receivable },
              ].map((m) => {
                const isSelected = paymentMethod === m.key;
                return (
                  <TouchableOpacity
                    key={m.key}
                    onPress={() => setPaymentMethod(m.key as any)}
                    style={[
                      styles.methodBtn,
                      isSelected && styles.methodBtnSelected,
                    ]}
                  >
                    <Text style={[styles.methodBtnText, isSelected && styles.methodBtnTextSelected]}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Order Note */}
            <Text style={styles.label}>{t.modals.orderDescription}</Text>
            <TextInput
              style={styles.textInput}
              value={orderType}
              onChangeText={setOrderType}
              placeholder={t.modals.orderPlaceholder}
              placeholderTextColor={THEME.colors.slate[400]}
            />

            {/* Engine 1 Notice */}
            <View style={styles.attributionNotice}>
              <Text style={styles.attributionTitle}>{t.modals.attributionNoticeTitle}</Text>
              <Text style={styles.attributionText}>
                {t.modals.attributionNoticeText}
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={THEME.colors.white} />
              ) : (
                <Text style={styles.submitBtnText}>{t.modals.confirmTransaction}</Text>
              )}
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
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: THEME.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.slate[200],
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.slate[900],
  },
  subtitle: {
    fontSize: 11,
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
  body: {
    padding: THEME.spacing.lg,
  },
  errorBanner: {
    backgroundColor: THEME.colors.rose[50],
    borderWidth: 1,
    borderColor: THEME.colors.rose[200],
    borderRadius: THEME.radius.md,
    padding: 10,
    marginBottom: 12,
  },
  errorText: {
    color: THEME.colors.rose[700],
    fontSize: 12,
    fontWeight: '600',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.slate[700],
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: 10,
  },
  clientScroll: {
    marginBottom: 8,
  },
  clientChip: {
    backgroundColor: THEME.colors.slate[100],
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: THEME.radius.full,
    marginRight: 6,
  },
  clientChipSelected: {
    backgroundColor: THEME.colors.brand[600],
  },
  clientChipText: {
    fontSize: 12,
    color: THEME.colors.slate[700],
    fontWeight: '600',
  },
  clientChipTextSelected: {
    color: THEME.colors.white,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.slate[300],
    borderRadius: THEME.radius.md,
    paddingHorizontal: 12,
    backgroundColor: THEME.colors.slate[50],
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.slate[500],
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.slate[900],
  },
  quickAmountRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    marginBottom: 10,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: THEME.colors.slate[100],
    paddingVertical: 6,
    borderRadius: THEME.radius.sm,
    alignItems: 'center',
  },
  quickBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.slate[700],
  },
  methodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  methodBtn: {
    flex: 1,
    backgroundColor: THEME.colors.slate[100],
    paddingVertical: 10,
    borderRadius: THEME.radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  methodBtnSelected: {
    backgroundColor: THEME.colors.brand[50],
    borderColor: THEME.colors.brand[500],
  },
  methodBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.slate[700],
  },
  methodBtnTextSelected: {
    color: THEME.colors.brand[700],
  },
  textInput: {
    borderWidth: 1,
    borderColor: THEME.colors.slate[300],
    borderRadius: THEME.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: THEME.colors.slate[900],
    backgroundColor: THEME.colors.slate[50],
    marginBottom: 12,
  },
  attributionNotice: {
    backgroundColor: THEME.colors.brand[50],
    borderWidth: 1,
    borderColor: THEME.colors.brand[200],
    borderRadius: THEME.radius.md,
    padding: 10,
    marginTop: 6,
    marginBottom: 10,
  },
  attributionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.brand[800],
  },
  attributionText: {
    fontSize: 10,
    color: THEME.colors.brand[700],
    marginTop: 2,
    lineHeight: 14,
  },
  footer: {
    padding: THEME.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.slate[200],
  },
  submitBtn: {
    backgroundColor: THEME.colors.brand[600],
    paddingVertical: 14,
    borderRadius: THEME.radius.lg,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: THEME.colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
});
