import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ContactDetailModal } from '../components/ContactDetailModal';
import { Header } from '../components/Header';
import { RecordSalesModal } from '../components/RecordSalesModal';
import { THEME } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n';
import { sfaService } from '../services/sfaService';
import { Contact } from '../types';

export const ContactsScreen: React.FC = () => {
  const { currentMode } = useAuth();
  const { t, formatCurrency } = useLanguage();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'ltv' | 'last_contacted' | 'name'>('ltv');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Modals
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);

  const loadContacts = async () => {
    try {
      const data = await sfaService.getContacts(sortBy, currentMode);
      setContacts(data);
    } catch (err) {
      console.warn('Failed to load contacts:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, [sortBy, currentMode]);

  const onRefresh = () => {
    setRefreshing(true);
    loadContacts();
  };

  const filteredContacts = contacts.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.display_name && c.display_name.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q))
    );
  });

  return (
    <View style={styles.container}>
      <Header
        title={t.contacts.title}
        subtitle={
          currentMode === 'VIP_HOSPITALITY'
            ? t.contacts.subtitleVip
            : t.contacts.subtitleB2b
        }
      />

      {/* Search & Sort Controls */}
      <View style={styles.controlsBar}>
        <View style={styles.searchWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={t.contacts.searchPlaceholder}
            placeholderTextColor={THEME.colors.slate[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.sortRow}>
          <Text style={styles.sortLabel}>{t.contacts.rankBy}</Text>
          {(['ltv', 'last_contacted', 'name'] as const).map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.sortChip, sortBy === s && styles.sortChipActive]}
              onPress={() => setSortBy(s)}
            >
              <Text style={[styles.sortChipText, sortBy === s && styles.sortChipTextActive]}>
                {s === 'ltv'
                  ? t.contacts.sortLtv
                  : s === 'last_contacted'
                  ? t.contacts.sortRecent
                  : t.contacts.sortName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Contacts List */}
      <ScrollView
        style={styles.contactsList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {isLoading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={THEME.colors.brand[600]} />
        ) : filteredContacts.length > 0 ? (
          filteredContacts.map((contact, idx) => (
            <TouchableOpacity
              key={contact.id}
              style={styles.contactCard}
              activeOpacity={0.8}
              onPress={() => {
                setSelectedContact(contact);
                setIsDetailModalOpen(true);
              }}
            >
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{idx + 1}</Text>
              </View>

              <View style={styles.contactInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  {contact.birthday && <Text style={styles.birthdayIcon}>🎂</Text>}
                </View>

                <Text style={styles.displaySubtitle}>
                  {contact.display_name || contact.phone || t.contacts.defaultPatron}
                </Text>

                {contact.custom_attributes?.preferred_drink && (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>
                      🍾 {contact.custom_attributes.preferred_drink}
                    </Text>
                  </View>
                )}
                {contact.custom_attributes?.scope && (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>
                      💼 {contact.custom_attributes.scope}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.contactMetrics}>
                <Text style={styles.ltvValue}>{formatCurrency(contact.lifetime_sales_amount)}</Text>
                <Text style={styles.ltvLabel}>{t.contacts.sortLtv}</Text>
                <Text style={styles.stageLabel}>
                  {contact.stage?.name
                    ? t.deals.stages[contact.stage.name] || contact.stage.name
                    : t.deals.stages['First Visit / Inquiry'] || 'Inquiry'}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>{t.contacts.emptyTitle}</Text>
            <Text style={styles.emptyText}>{t.contacts.emptyText}</Text>
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Detail Modal */}
      <ContactDetailModal
        visible={isDetailModalOpen}
        contact={selectedContact}
        onClose={() => setIsDetailModalOpen(false)}
        onInteractionLogged={() => loadContacts()}
        onOpenRecordSales={(c) => {
          setSelectedContact(c);
          setIsRecordModalOpen(true);
        }}
      />

      {/* Record Sales Modal */}
      <RecordSalesModal
        visible={isRecordModalOpen}
        contacts={contacts}
        selectedContact={selectedContact}
        onClose={() => setIsRecordModalOpen(false)}
        onSuccess={() => loadContacts()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.slate[50],
  },
  controlsBar: {
    backgroundColor: THEME.colors.white,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.slate[200],
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.slate[100],
    borderRadius: THEME.radius.md,
    paddingHorizontal: 10,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 13,
    color: THEME.colors.slate[900],
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  sortLabel: {
    fontSize: 11,
    color: THEME.colors.slate[400],
    fontWeight: '600',
  },
  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.radius.full,
    backgroundColor: THEME.colors.slate[100],
  },
  sortChipActive: {
    backgroundColor: THEME.colors.brand[600],
  },
  sortChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.slate[600],
  },
  sortChipTextActive: {
    color: THEME.colors.white,
  },
  contactsList: {
    flex: 1,
    padding: THEME.spacing.lg,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.white,
    borderRadius: THEME.radius.lg,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.sm,
    borderWidth: 1,
    borderColor: THEME.colors.slate[200],
    shadowColor: THEME.colors.slate[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.colors.slate[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rankText: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.slate[600],
  },
  contactInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactName: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.slate[900],
  },
  birthdayIcon: {
    marginLeft: 4,
    fontSize: 12,
  },
  displaySubtitle: {
    fontSize: 11,
    color: THEME.colors.slate[500],
    marginTop: 1,
  },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: THEME.colors.slate[100],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  tagText: {
    fontSize: 10,
    color: THEME.colors.slate[600],
    fontWeight: '600',
  },
  contactMetrics: {
    alignItems: 'flex-end',
  },
  ltvValue: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.emerald[700],
  },
  ltvLabel: {
    fontSize: 9,
    color: THEME.colors.slate[400],
    marginTop: 1,
  },
  stageLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.brand[600],
    marginTop: 3,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: THEME.colors.white,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.slate[200],
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.slate[800],
  },
  emptyText: {
    fontSize: 11,
    color: THEME.colors.slate[500],
    marginTop: 4,
  },
});
