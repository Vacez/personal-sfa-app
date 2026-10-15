import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AdvanceStageModal } from '../components/AdvanceStageModal';
import { ContactDetailModal } from '../components/ContactDetailModal';
import { Header } from '../components/Header';
import { NewDealModal } from '../components/NewDealModal';
import { RecordSalesModal } from '../components/RecordSalesModal';
import { THEME } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n';
import { sfaService } from '../services/sfaService';
import { Contact, PipelineStage } from '../types';

export const DealsScreen: React.FC = () => {
  const { currentMode } = useAuth();
  const { t, formatCurrency, formatDate } = useLanguage();
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [totalPipeline, setTotalPipeline] = useState<number>(0);
  const [totalWeighted, setTotalWeighted] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Modals
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
  const [isNewDealModalOpen, setIsNewDealModalOpen] = useState<boolean>(false);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState<boolean>(false);
  const [advanceTargetContact, setAdvanceTargetContact] = useState<Contact | null>(null);
  const [advanceCurrentStage, setAdvanceCurrentStage] = useState<PipelineStage | null>(null);
  const [advanceNextStage, setAdvanceNextStage] = useState<PipelineStage | null>(null);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);

  const loadPipeline = async () => {
    try {
      const data = await sfaService.getPipeline(currentMode);
      setStages(data.stages);
      setTotalPipeline(data.total_pipeline);
      setTotalWeighted(data.total_weighted);

      // Collect all contacts for modal
      const cList: Contact[] = [];
      data.stages.forEach((s) => {
        if (s.contacts) cList.push(...s.contacts);
      });
      setAllContacts(cList);

      if (!selectedStageId && data.stages.length > 0) {
        setSelectedStageId(data.stages[0].id);
      }
    } catch (err) {
      console.warn('Failed to load pipeline:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPipeline();
  }, [currentMode]);

  const onRefresh = () => {
    setRefreshing(true);
    loadPipeline();
  };

  const handleOpenAdvance = (contact: Contact, currentStage: PipelineStage) => {
    const currentIndex = stages.findIndex((s) => s.id === currentStage.id);
    if (currentIndex < stages.length - 1) {
      setAdvanceTargetContact(contact);
      setAdvanceCurrentStage(currentStage);
      setAdvanceNextStage(stages[currentIndex + 1]);
      setIsAdvanceModalOpen(true);
    }
  };

  const handleConfirmAdvance = async () => {
    if (advanceTargetContact && advanceNextStage) {
      try {
        await sfaService.updateContactStage(advanceTargetContact.id, advanceNextStage.id);
        setIsAdvanceModalOpen(false);
        loadPipeline();
      } catch (err) {
        console.warn('Failed to advance stage:', err);
      }
    }
  };

  const handleCreateNewDeal = async (data: {
    contactId: string;
    expectedAmount: number;
    stageId: string;
    intendedDate: string;
    notes: string;
  }) => {
    try {
      await sfaService.updateContactStage(data.contactId, data.stageId);
      loadPipeline();
    } catch (err) {
      console.warn('Failed to create/assign deal:', err);
    }
  };

  const activeStage = stages.find((s) => s.id === selectedStageId) || stages[0];

  const getTranslatedStageName = (name: string) => {
    return t.deals.stages[name] || name;
  };

  const activeStageDealsCount = activeStage?.contacts?.length || 0;
  const activeStageExpectedBills = activeStage?.total_expected || 0;

  return (
    <View style={styles.container}>
      <Header
        title={t.deals.title}
        subtitle={
          currentMode === 'VIP_HOSPITALITY'
            ? t.deals.subtitleVip
            : t.deals.subtitleB2b
        }
      />

      {/* Action Bar with New Deal CTA */}
      <View style={styles.topActionBar}>
        <View style={styles.eyebrowContainer}>
          <Text style={styles.eyebrowText}>PIPELINE / STAGE PILLS</Text>
        </View>
        <TouchableOpacity
          style={styles.newDealBtn}
          onPress={() => setIsNewDealModalOpen(true)}
        >
          <Text style={styles.newDealBtnText}>{t.deals.newDeal}</Text>
        </TouchableOpacity>
      </View>

      {/* Two Mini Summary Cards (Figma Style) */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{t.deals.contactedDeals}</Text>
          <Text style={styles.summaryValue}>{activeStageDealsCount}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{t.deals.expectedBills}</Text>
          <Text style={styles.summaryValueWeighted}>
            {formatCurrency(activeStageExpectedBills)}
          </Text>
        </View>
      </View>

      {/* Horizontal Stage Selector Pills (Figma Style) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.stageTabsScroll}
        contentContainerStyle={styles.stageTabsContent}
      >
        {stages.map((stage) => {
          const isSelected = stage.id === (selectedStageId || stages[0]?.id);
          const stageName = getTranslatedStageName(stage.name);
          return (
            <TouchableOpacity
              key={stage.id}
              style={[styles.stagePill, isSelected && styles.stagePillActive]}
              onPress={() => setSelectedStageId(stage.id)}
            >
              <Text style={[styles.stagePillText, isSelected && styles.stagePillTextActive]}>
                {stageName} ({stage.win_probability_rate}%)
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Deals List for Selected Stage */}
      <ScrollView
        style={styles.dealsList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {isLoading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={THEME.colors.brand[600]} />
        ) : activeStage?.contacts && activeStage.contacts.length > 0 ? (
          activeStage.contacts.map((contact) => (
            <TouchableOpacity
              key={contact.id}
              style={styles.dealCard}
              activeOpacity={0.8}
              onPress={() => {
                setSelectedContact(contact);
                setIsDetailModalOpen(true);
              }}
            >
              <View style={styles.dealHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.clientName}>{contact.name}</Text>
                  <Text style={styles.clientSubtitle}>
                    {contact.display_name || contact.phone || t.contacts.defaultPatron}
                  </Text>
                </View>
                <View style={styles.amountBadge}>
                  <Text style={styles.dealAmount}>{formatCurrency(contact.expected_amount)}</Text>
                  <Text style={styles.weightedText}>
                    W: {formatCurrency(contact.expected_amount * (activeStage.win_probability_rate / 100))}
                  </Text>
                </View>
              </View>

              <View style={styles.dealFooter}>
                <Text style={styles.lastContactText}>
                  {t.deals.lastContact}: {contact.last_contacted_at ? formatDate(contact.last_contacted_at) : t.common.none}
                </Text>
                <TouchableOpacity
                  style={styles.advanceBtn}
                  onPress={() => handleOpenAdvance(contact, activeStage)}
                >
                  <Text style={styles.advanceBtnText}>{t.deals.advance} ➔</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyStage}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
            </View>
            <Text style={styles.emptyStageTitle}>
              {t.deals.emptyStageTitle} ({getTranslatedStageName(activeStage?.name || '')})
            </Text>
            <Text style={styles.emptyStageText}>
              {t.deals.emptyStageText}
            </Text>
            <View style={styles.emptyActionsRow}>
              <TouchableOpacity
                style={styles.emptyPrimaryBtn}
                onPress={() => setIsNewDealModalOpen(true)}
              >
                <Text style={styles.emptyPrimaryBtnText}>{t.deals.newDeal}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* New Deal Modal */}
      <NewDealModal
        visible={isNewDealModalOpen}
        contacts={allContacts}
        stages={stages}
        onClose={() => setIsNewDealModalOpen(false)}
        onSubmit={handleCreateNewDeal}
      />

      {/* Advance Stage Confirmation Modal */}
      <AdvanceStageModal
        visible={isAdvanceModalOpen}
        contact={advanceTargetContact}
        currentStage={advanceCurrentStage}
        nextStage={advanceNextStage}
        onClose={() => setIsAdvanceModalOpen(false)}
        onConfirm={handleConfirmAdvance}
      />

      {/* Contact Detail Modal */}
      <ContactDetailModal
        visible={isDetailModalOpen}
        contact={selectedContact}
        onClose={() => setIsDetailModalOpen(false)}
        onInteractionLogged={() => loadPipeline()}
        onOpenRecordSales={(c) => {
          setSelectedContact(c);
          setIsRecordModalOpen(true);
        }}
      />

      {/* Record Sales Modal */}
      <RecordSalesModal
        visible={isRecordModalOpen}
        contacts={allContacts}
        selectedContact={selectedContact}
        onClose={() => setIsRecordModalOpen(false)}
        onSuccess={() => loadPipeline()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.slate[100],
  },
  topActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: 12,
    paddingBottom: 4,
  },
  eyebrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyebrowText: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.brand[600],
    letterSpacing: 0.5,
  },
  newDealBtn: {
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
  newDealBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  summaryBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: 8,
    paddingBottom: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: THEME.colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.colors.slate[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.slate[500],
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '900',
    color: THEME.colors.slate[900],
  },
  summaryValueWeighted: {
    fontSize: 22,
    fontWeight: '900',
    color: THEME.colors.brand[600],
  },
  stageTabsScroll: {
    maxHeight: 52,
    marginVertical: 6,
  },
  stageTabsContent: {
    paddingHorizontal: THEME.spacing.lg,
    gap: 8,
    alignItems: 'center',
  },
  stagePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: THEME.colors.slate[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  stagePillActive: {
    backgroundColor: THEME.colors.brand[600],
    shadowColor: THEME.colors.brand[600],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  stagePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.slate[700],
  },
  stagePillTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  dealsList: {
    flex: 1,
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: 6,
  },
  dealCard: {
    backgroundColor: THEME.colors.white,
    borderRadius: THEME.radius.lg,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.sm,
    borderWidth: 1,
    borderColor: THEME.colors.slate[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  dealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  clientName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: THEME.colors.slate[900],
  },
  clientSubtitle: {
    fontSize: 11,
    color: THEME.colors.slate[500],
    marginTop: 2,
  },
  amountBadge: {
    alignItems: 'flex-end',
  },
  dealAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME.colors.slate[900],
  },
  weightedText: {
    fontSize: 11,
    color: THEME.colors.brand[600],
    fontWeight: '600',
  },
  dealFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: THEME.colors.slate[100],
    paddingTop: 8,
  },
  lastContactText: {
    fontSize: 11,
    color: THEME.colors.slate[400],
  },
  advanceBtn: {
    backgroundColor: THEME.colors.slate[900],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  advanceBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.colors.white,
  },
  emptyStage: {
    alignItems: 'center',
    backgroundColor: THEME.colors.white,
    borderRadius: 16,
    padding: 24,
    marginTop: 12,
    borderWidth: 1,
    borderColor: THEME.colors.slate[200],
  },
  emptyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME.colors.brand[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyIcon: {
    fontSize: 24,
  },
  emptyStageTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: THEME.colors.slate[800],
    textAlign: 'center',
  },
  emptyStageText: {
    fontSize: 12,
    color: THEME.colors.slate[500],
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 280,
  },
  emptyActionsRow: {
    marginTop: 16,
  },
  emptyPrimaryBtn: {
    backgroundColor: THEME.colors.brand[600],
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyPrimaryBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
