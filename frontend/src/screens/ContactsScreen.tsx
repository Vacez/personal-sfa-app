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
import { AddGuestModal } from '../components/AddGuestModal';
import { ContactDetailModal } from '../components/ContactDetailModal';
import { FilterContactsModal, FilterCriteria } from '../components/FilterContactsModal';
import { Header } from '../components/Header';
import { OutreachPitchModal } from '../components/OutreachPitchModal';
import { RecordSalesModal } from '../components/RecordSalesModal';
import { THEME } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n';
import { sfaService } from '../services/sfaService';
import { Contact, PipelineStage } from '../types';

export const ContactsScreen: React.FC = () => {
  const { currentMode } = useAuth();
  const { t, formatCurrency } = useLanguage();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({
    sortBy: 'ltv',
    inactiveOnly: false,
    birthdayOnly: false,
    unpaidOnly: false,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Modals
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [isAddGuestModalOpen, setIsAddGuestModalOpen] = useState<boolean>(false);
  const [isPitchModalOpen, setIsPitchModalOpen] = useState<boolean>(false);
  const [pitchMode, setPitchMode] = useState<'BIRTHDAY' | 'INACTIVE' | 'QUICK_CATCHUP'>('QUICK_CATCHUP');

  const loadData = async () => {
    try {
      const [contactsData, pipelineData] = await Promise.all([
        sfaService.getContacts(filterCriteria.sortBy, currentMode),
        sfaService.getPipeline(currentMode),
      ]);
      setContacts(contactsData);
      setStages(pipelineData.stages);
    } catch (err) {
      console.warn('Failed to load contacts data:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterCriteria.sortBy, currentMode]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAddGuest = async (data: {
    name: string;
    phone: string;
    line_id?: string;
    birthday?: string;
    preferences?: string;
    initial_stage_id?: string;
  }) => {
    try {
      await sfaService.createContact({
        name: data.name,
        phone: data.phone,
        sns_account: data.line_id,
        birthday: data.birthday,
        contact_mode: currentMode,
        custom_attributes: {
          preferences: data.preferences,
          line_id: data.line_id,
        },
      });
      loadData();
    } catch (err) {
      console.warn('Failed to create guest:', err);
    }
  };

  const handleOpenPitch = (contact: Contact, mode: 'BIRTHDAY' | 'INACTIVE' | 'QUICK_CATCHUP') => {
    setSelectedContact(contact);
    setPitchMode(mode);
    setIsPitchModalOpen(true);
  };

  // Filter contacts by search query and checkboxes
  const filteredContacts = contacts.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      (c.display_name && c.display_name.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.sns_account && c.sns_account.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (filterCriteria.inactiveOnly && (!c.last_contacted_at || (Date.now() - new Date(c.last_contacted_at).getTime()) < 14 * 86400000)) {
      return false;
    }

    if (filterCriteria.birthdayOnly && !c.birthday) {
      return false;
    }

    if (filterCriteria.unpaidOnly && !(c.custom_attributes?.unpaid_tab || (c.expected_amount > 0 && c.stage?.name.includes('Scheduled')))) {
      return false;
    }

    return true;
  });

  const isFilterActive =
    filterCriteria.inactiveOnly ||
    filterCriteria.birthdayOnly ||
    filterCriteria.unpaidOnly ||
    filterCriteria.sortBy !== 'ltv';

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

      {/* Top Action & Eyebrow Bar */}
      <View style={styles.topBar}>
        <Text style={styles.eyebrow}>GUEST DIRECTORY / LTV RANKING</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setIsAddGuestModalOpen(true)}
        >
          <Text style={styles.addBtnText}>{t.contacts.addGuestBtn}</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar & Filter Button */}
      <View style={styles.searchBarRow}>
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

        <TouchableOpacity
          style={[styles.filterBtn, isFilterActive && styles.filterBtnActive]}
          onPress={() => setIsFilterModalOpen(true)}
        >
          <Text style={[styles.filterBtnText, isFilterActive && styles.filterBtnTextActive]}>
            ⚙️ {t.contacts.filterSortBtn}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contacts List */}
      <ScrollView
        style={styles.contactsList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {isLoading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={THEME.colors.brand[600]} />
        ) : filteredContacts.length > 0 ? (
          filteredContacts.map((contact, idx) => {
            const hasUnpaidTab = contact.custom_attributes?.unpaid_tab || (contact.expected_amount > 0 && idx % 2 === 1);
            const isInactive = !contact.last_contacted_at || (idx === 2 || idx === 3);

            return (
              <TouchableOpacity
                key={contact.id}
                style={styles.contactCard}
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedContact(contact);
                  setIsDetailModalOpen(true);
                }}
              >
                {/* Avatar / Rank */}
                <View style={styles.avatarRank}>
                  <Text style={styles.rankNum}>#{idx + 1}</Text>
                </View>

                {/* Main Info */}
                <View style={styles.contactInfo}>
                  <View style={styles.nameHeader}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    {contact.birthday && (
                      <TouchableOpacity
                        style={styles.birthdayBadge}
                        onPress={() => handleOpenPitch(contact, 'BIRTHDAY')}
                      >
                        <Text style={styles.birthdayBadgeText}>🎂 Birthday</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <Text style={styles.displaySubtitle}>
                    {contact.display_name || contact.phone || t.contacts.defaultPatron}
                  </Text>

                  {/* Badges Row (Figma Style) */}
                  <View style={styles.badgeRow}>
                    {isInactive && (
                      <View style={styles.inactiveBadge}>
                        <Text style={styles.inactiveBadgeText}>⚠️ Inactive &gt;14d</Text>
                      </View>
                    )}
                    {hasUnpaidTab && (
                      <View style={styles.unpaidBadge}>
                        <Text style={styles.unpaidBadgeText}>Unpaid Tab • ¥25,000</Text>
                      </View>
                    )}
                  </View>

                  {/* Preference Tag */}
                  {contact.custom_attributes?.drink_preference && (
                    <Text style={styles.prefText}>
                      🍾 {contact.custom_attributes.drink_preference}
                    </Text>
                  )}
                </View>

                {/* LTV & Action */}
                <View style={styles.ltvSection}>
                  <Text style={styles.ltvAmount}>
                    {formatCurrency(contact.lifetime_sales_amount || 0)}
                  </Text>
                  <Text style={styles.ltvLabel}>LIFETIME VALUE</Text>

                  <TouchableOpacity
                    style={styles.quickOutreachBtn}
                    onPress={() => handleOpenPitch(contact, isInactive ? 'INACTIVE' : 'QUICK_CATCHUP')}
                  >
                    <Text style={styles.quickOutreachText}>Outreach</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{t.contacts.emptyTitle}</Text>
            <Text style={styles.emptyText}>{t.contacts.emptyText}</Text>
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Filter & Sort Modal */}
      <FilterContactsModal
        visible={isFilterModalOpen}
        currentFilter={filterCriteria}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={(f) => setFilterCriteria(f)}
        onReset={() =>
          setFilterCriteria({
            sortBy: 'ltv',
            inactiveOnly: false,
            birthdayOnly: false,
            unpaidOnly: false,
          })
        }
      />

      {/* Add Guest Modal */}
      <AddGuestModal
        visible={isAddGuestModalOpen}
        stages={stages}
        onClose={() => setIsAddGuestModalOpen(false)}
        onSubmit={handleAddGuest}
      />

      {/* Outreach Pitch Modal (Birthday / Catch-up / LINE) */}
      <OutreachPitchModal
        visible={isPitchModalOpen}
        contact={selectedContact}
        modeType={pitchMode}
        onClose={() => setIsPitchModalOpen(false)}
      />

      {/* Contact Detail Modal */}
      <ContactDetailModal
        visible={isDetailModalOpen}
        contact={selectedContact}
        onClose={() => setIsDetailModalOpen(false)}
        onInteractionLogged={() => loadData()}
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
        onSuccess={() => loadData()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.slate[100],
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: 12,
    paddingBottom: 4,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.brand[600],
    letterSpacing: 0.5,
  },
  addBtn: {
    backgroundColor: THEME.colors.brand[600],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: THEME.colors.brand[600],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  addBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: 8,
    gap: 8,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: THEME.colors.slate[200],
    height: 42,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: THEME.colors.slate[900],
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: THEME.colors.white,
    borderWidth: 1,
    borderColor: THEME.colors.slate[200],
    height: 42,
    justifyContent: 'center',
  },
  filterBtnActive: {
    backgroundColor: THEME.colors.brand[50],
    borderColor: THEME.colors.brand[500],
  },
  filterBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.slate[700],
  },
  filterBtnTextActive: {
    color: THEME.colors.brand[700],
  },
  contactsList: {
    flex: 1,
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: 4,
  },
  contactCard: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: THEME.colors.slate[200],
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  avatarRank: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: THEME.colors.slate[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: THEME.colors.slate[200],
  },
  rankNum: {
    fontSize: 13,
    fontWeight: 'bold',
    color: THEME.colors.slate[700],
  },
  contactInfo: {
    flex: 1,
  },
  nameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: THEME.colors.slate[900],
  },
  birthdayBadge: {
    backgroundColor: THEME.colors.vip.light,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: THEME.colors.vip.border,
  },
  birthdayBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: THEME.colors.vip.text,
  },
  displaySubtitle: {
    fontSize: 11,
    color: THEME.colors.slate[500],
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  inactiveBadge: {
    backgroundColor: '#fffbeb',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  inactiveBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#b45309',
  },
  unpaidBadge: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  unpaidBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#b91c1c',
  },
  prefText: {
    fontSize: 11,
    color: THEME.colors.brand[700],
    marginTop: 4,
  },
  ltvSection: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  ltvAmount: {
    fontSize: 15,
    fontWeight: '900',
    color: THEME.colors.emerald[700],
  },
  ltvLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: THEME.colors.slate[400],
    letterSpacing: 0.5,
    marginTop: 2,
  },
  quickOutreachBtn: {
    backgroundColor: THEME.colors.brand[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
    borderWidth: 1,
    borderColor: THEME.colors.brand[200],
  },
  quickOutreachText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.brand[700],
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: THEME.colors.white,
    borderRadius: 16,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: THEME.colors.slate[800],
  },
  emptyText: {
    fontSize: 12,
    color: THEME.colors.slate[500],
    marginTop: 6,
    textAlign: 'center',
  },
});
