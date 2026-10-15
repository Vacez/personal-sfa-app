import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
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
  const { t, formatCurrency } = useLanguage();
  const [contactId, setContactId] = useState<string>(selectedContact?.id || '');
  const [amount, setAmount] = useState<string>('75000');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CREDIT_CARD' | 'RECEIVABLE'>('CREDIT_CARD');
  const [isSettled, setIsSettled] = useState<boolean>(true);
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

  const handleQuickAdd = (addVal: number) => {
    const cur = parseFloat(amount) || 0;
    setAmount((cur + addVal).toString());
  };

  const handlePaymentMethodChange = (method: 'CASH' | 'CREDIT_CARD' | 'RECEIVABLE') => {
    setPaymentMethod(method);
    if (method === 'RECEIVABLE') {
      setIsSettled(false);
    } else {
      setIsSettled(true);
    }
  };

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
        is_settled: isSettled,
        metadata: {
          order_type: orderType || 'VIP Service & Bottle Bill',
          auto_attributed_post: "IG (Oct 10): 'VIP Lounge Autumn Update' (142 likes)",
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

  const activeContact = contacts.find((c) => c.id === contactId) || contacts[0];

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>ACCOUNTING & CRM SYNC / {paymentMethod}</Text>
              <Text style={styles.title}>{t.modals.recordSalesTitle}</Text>
              <Text style={styles.subtitle}>
                {t.modals.recordSalesSubtitle}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {errorMsg && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {/* Client Selection */}
            <Text style={styles.label}>{t.modals.selectClient}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.clientScroll}>
              {contacts.map((c, idx) => {
                const isSelected = c.id === contactId;
                return (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => setContactId(c.id)}
                    style={[styles.clientChip, isSelected && styles.clientChipSelected]}
                  >
                    <Text style={[styles.clientChipText, isSelected && styles.clientChipTextSelected]}>
                      {c.name} (VIP #{idx + 1})
                    </Text>
                    <Text style={[styles.clientChipLtv, isSelected && styles.clientChipLtvSelected]}>
                      LTV: {formatCurrency(c.lifetime_sales_amount || 0)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Amount Input */}
            <Text style={styles.label}>{t.modals.salesAmount} *</Text>
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
              {[50000, 100000, 200000].map((quickVal) => (
                <TouchableOpacity
                  key={quickVal}
                  style={styles.quickBtn}
                  onPress={() => handleQuickAdd(quickVal)}
                >
                  <Text style={styles.quickBtnText}>+{formatCurrency(quickVal)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Auto-Attributed Social Post (Figma Card) */}
            <Text style={styles.label}>{t.modals.socialAttributedPost}</Text>
            <View style={styles.socialCard}>
              <View style={styles.socialHeader}>
                <Text style={styles.socialBadge}>📸 IG (Oct 10)</Text>
                <Text style={styles.socialLikes}>❤️ 142 likes</Text>
              </View>
              <Text style={styles.socialCaption}>"VIP Lounge Autumn Exclusive Reserve Tasting"</Text>
              <Text style={styles.socialHint}>
                ⚡ Auto-correlated: Visit occurred within 48h of patron interaction.
              </Text>
            </View>

            {/* Payment Method 3-way Segmented Control */}
            <Text style={styles.label}>{t.modals.paymentMethod}</Text>
            <View style={styles.methodRow}>
              {[
                { key: 'CASH', label: t.modals.cash },
                { key: 'CREDIT_CARD', label: t.modals.card },
                { key: 'RECEIVABLE', label: t.modals.receivable },
              ].map((m) => {
                const isSelected = paymentMethod === m.key;
                return (
                  <TouchableOpacity
                    key={m.key}
                    onPress={() => handlePaymentMethodChange(m.key as any)}
                    style={[styles.methodBtn, isSelected && styles.methodBtnSelected]}
                  >
                    <Text style={[styles.methodBtnText, isSelected && styles.methodBtnTextSelected]}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Accounting Settlement Status Switch */}
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>{t.modals.accountingSettlementStatus}</Text>
                <Text style={styles.switchSub}>{t.modals.settledNotice}</Text>
              </View>
              <Switch
                value={isSettled}
                onValueChange={setIsSettled}
                trackColor={{ false: THEME.colors.slate[300], true: THEME.colors.emerald[500] }}
                thumbColor="#ffffff"
              />
            </View>

            {/* Status Notice Callout Box */}
            <View style={styles.noticeBox}>
              <Text style={styles.noticeTitle}>
                {isSettled ? '✓ Ready to record a settled sale' : '⚠️ Outstanding Tab (Bon / ツケ) Record'}
              </Text>
              <Text style={styles.noticeText}>
                {isSettled
                  ? `${paymentMethod} payment received from ${activeContact?.name || 'guest'}. Saving will queue accounting ledger delivery.`
                  : `A receivable of ${formatCurrency(parseFloat(amount) || 0)} will be added to ${activeContact?.name || 'guest'}'s unpaid tab.`}
              </Text>
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

            {/* Action Buttons */}
            <TouchableOpacity
              style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={THEME.colors.white} />
              ) : (
                <Text style={styles.submitBtnText}>{t.modals.syncWebhookBtn}</Text>
              )}
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
    maxHeight: '92%',
    paddingHorizontal: 20,
    paddingTop: 16,
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
  closeBtnText: {
    fontSize: 16,
    color: THEME.colors.slate[600],
    fontWeight: 'bold',
  },
  body: {
    paddingVertical: 14,
  },
  errorBanner: {
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
    fontWeight: 'bold',
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.slate[700],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 6,
  },
  clientScroll: {
    marginBottom: 6,
  },
  clientChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: THEME.colors.slate[50],
    borderWidth: 1,
    borderColor: THEME.colors.slate[200],
    marginRight: 8,
  },
  clientChipSelected: {
    backgroundColor: THEME.colors.brand[50],
    borderColor: THEME.colors.brand[500],
  },
  clientChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.slate[700],
  },
  clientChipTextSelected: {
    color: THEME.colors.brand[700],
  },
  clientChipLtv: {
    fontSize: 10,
    color: THEME.colors.slate[400],
    marginTop: 2,
  },
  clientChipLtvSelected: {
    color: THEME.colors.brand[600],
    fontWeight: '600',
  },
  inputWrapper: {
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
  quickAmountRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: THEME.colors.brand[50],
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.brand[200],
  },
  quickBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.brand[700],
  },
  socialCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: THEME.colors.slate[200],
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  socialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  socialBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.colors.brand[700],
  },
  socialLikes: {
    fontSize: 11,
    color: THEME.colors.slate[500],
  },
  socialCaption: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.slate[800],
    marginBottom: 4,
  },
  socialHint: {
    fontSize: 10,
    color: THEME.colors.slate[400],
  },
  methodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  methodBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: THEME.colors.slate[100],
    borderWidth: 1,
    borderColor: THEME.colors.slate[200],
  },
  methodBtnSelected: {
    backgroundColor: THEME.colors.brand[600],
    borderColor: THEME.colors.brand[600],
  },
  methodBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.slate[700],
  },
  methodBtnTextSelected: {
    color: '#ffffff',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.slate[50],
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.colors.slate[200],
    marginBottom: 12,
  },
  switchTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: THEME.colors.slate[800],
  },
  switchSub: {
    fontSize: 10,
    color: THEME.colors.slate[500],
    marginTop: 2,
    maxWidth: 240,
  },
  noticeBox: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  noticeTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 11,
    color: '#15803d',
    lineHeight: 16,
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
    marginBottom: 16,
  },
  submitBtn: {
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
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
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
