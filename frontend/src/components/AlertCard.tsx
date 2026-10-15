import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { THEME } from '../constants/theme';
import { useLanguage } from '../i18n';
import { Contact } from '../types';

interface AlertCardProps {
  type: 'birthday' | 'inactive' | 'stalled';
  contact: Contact;
  onAction: (contact: Contact, actionType: string) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ type, contact, onAction }) => {
  const { t, formatCurrency, formatDate } = useLanguage();
  const isBirthday = type === 'birthday';
  const isInactive = type === 'inactive';

  const badgeColor = isBirthday
    ? { bg: THEME.colors.rose[50], border: THEME.colors.rose[500], text: THEME.colors.rose[700] }
    : isInactive
    ? { bg: THEME.colors.amber[50], border: THEME.colors.amber[500], text: THEME.colors.amber[700] }
    : { bg: THEME.colors.brand[50], border: THEME.colors.brand[500], text: THEME.colors.brand[700] };

  const stageName = contact.stage?.name
    ? t.deals.stages[contact.stage.name] || contact.stage.name
    : '';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: badgeColor.bg, borderColor: badgeColor.border }]}>
          <Text style={[styles.badgeText, { color: badgeColor.text }]}>
            {isBirthday
              ? t.alerts.birthdayToday
              : isInactive
              ? t.alerts.inactiveDays
              : t.alerts.stalledDeal}
          </Text>
        </View>
        <Text style={styles.ltvText}>
          {t.alerts.ltv} {formatCurrency(contact.lifetime_sales_amount)}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{contact.name}</Text>
        {contact.display_name && <Text style={styles.displayName}>({contact.display_name})</Text>}

        {isBirthday && (
          <Text style={styles.recommendationText}>
            🍾 {t.alerts.suggest}: {contact.custom_attributes?.preferred_drink || t.alerts.defaultDrink}
          </Text>
        )}

        {isInactive && (
          <Text style={styles.recommendationText}>
            {t.alerts.lastContacted}{' '}
            {contact.last_contacted_at ? formatDate(contact.last_contacted_at) : t.alerts.twoWeeksAgo}.{' '}
            {t.alerts.highPatron}
          </Text>
        )}

        {!isBirthday && !isInactive && (
          <Text style={styles.recommendationText}>
            {t.alerts.dealAmount}: {formatCurrency(contact.expected_amount)} • {t.alerts.stage}:{' '}
            {stageName || 'Negotiation'}
          </Text>
        )}
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: badgeColor.text }]}
          activeOpacity={0.8}
          onPress={() => onAction(contact, isBirthday ? 'birthday_wish' : 'outreach')}
        >
          <Text style={styles.actionBtnText}>
            {isBirthday
              ? t.alerts.sendWish
              : isInactive
              ? t.alerts.quickOutreach
              : t.alerts.advanceStage}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.white,
    borderRadius: THEME.radius.lg,
    padding: THEME.spacing.lg,
    marginHorizontal: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.slate[200],
    shadowColor: THEME.colors.slate[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.radius.sm,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  ltvText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.slate[500],
  },
  content: {
    marginBottom: THEME.spacing.md,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.slate[900],
  },
  displayName: {
    fontSize: 12,
    color: THEME.colors.slate[500],
    marginTop: 1,
  },
  recommendationText: {
    fontSize: 12,
    color: THEME.colors.slate[600],
    marginTop: 6,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: THEME.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: THEME.colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
});
