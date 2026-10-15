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
import { ContactDetailModal } from '../components/ContactDetailModal';
import { Header } from '../components/Header';
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

  const handleAdvanceStage = async (contact: Contact, currentStage: PipelineStage) => {
    const currentIndex = stages.findIndex((s) => s.id === currentStage.id);
    if (currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1];
      try {
        await sfaService.updateContactStage(contact.id, nextStage.id);
        loadPipeline();
      } catch (err) {
        console.warn('Failed to advance stage:', err);
      }
    }
  };

  const activeStage = stages.find((s) => s.id === selectedStageId) || stages[0];

  const getTranslatedStageName = (name: string) => {
    return t.deals.stages[name] || name;
  };

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

      {/* Pipeline Summary Bar */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>{t.deals.totalPipeline}</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalPipeline)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>{t.deals.weightedForecast}</Text>
          <Text style={styles.summaryValueWeighted}>{formatCurrency(totalWeighted)}</Text>
        </View>
      </View>

      {/* Stage Selector Tabs */}
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
              style={[styles.stageTab, isSelected && styles.stageTabActive]}
              onPress={() => setSelectedStageId(stage.id)}
            >
              <View style={styles.stageTabHeader}>
                <Text style={[styles.stageName, isSelected && styles.stageNameActive]}>
                  {stageName}
                </Text>
                <View
                  style={[
                    styles.probBadge,
                    {
                      backgroundColor:
                        stage.win_probability_rate >= 80
                          ? THEME.colors.emerald[100]
                          : stage.win_probability_rate >= 50
                          ? THEME.colors.brand[100]
                          : THEME.colors.slate[200],
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.probBadgeText,
                      {
                        color:
                          stage.win_probability_rate >= 80
                            ? THEME.colors.emerald[700]
                            : stage.win_probability_rate >= 50
                            ? THEME.colors.brand[700]
                            : THEME.colors.slate[700],
                      },
                    ]}
                  >
                    {stage.win_probability_rate}%
                  </Text>
                </View>
              </View>
              <Text style={styles.stageTotal}>
                {stage.contacts?.length || 0} {t.deals.dealsCount} • {formatCurrency(stage.total_expected || 0)}
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
                <View>
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
                  onPress={() => handleAdvanceStage(contact, activeStage)}
                >
                  <Text style={styles.advanceBtnText}>{t.deals.advance} ➔</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyStage}>
            <Text style={styles.emptyStageTitle}>{t.deals.emptyStageTitle}</Text>
            <Text style={styles.emptyStageText}>
              {t.deals.emptyStageText}
            </Text>
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>

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
    backgroundColor: THEME.colors.slate[50],
  },
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.white,
    paddingVertical: 12,
    paddingHorizontal: THEME.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.slate[200],
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.slate[400],
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.slate[900],
    marginTop: 2,
  },
  summaryValueWeighted: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.brand[600],
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: THEME.colors.slate[200],
    marginHorizontal: THEME.spacing.md,
  },
  stageTabsScroll: {
    backgroundColor: THEME.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.slate[200],
  },
  stageTabsContent: {
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: 10,
    gap: 8,
  },
  stageTab: {
    backgroundColor: THEME.colors.slate[100],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 150,
  },
  stageTabActive: {
    backgroundColor: THEME.colors.brand[50],
    borderColor: THEME.colors.brand[400],
  },
  stageTabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stageName: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.slate[700],
    flex: 1,
    marginRight: 4,
  },
  stageNameActive: {
    color: THEME.colors.brand[900],
  },
  probBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  probBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  stageTotal: {
    fontSize: 10,
    color: THEME.colors.slate[500],
  },
  dealsList: {
    flex: 1,
    padding: THEME.spacing.lg,
  },
  dealCard: {
    backgroundColor: THEME.colors.white,
    borderRadius: THEME.radius.lg,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.slate[200],
    shadowColor: THEME.colors.slate[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  dealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: THEME.spacing.md,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '800',
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
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.slate[900],
  },
  weightedText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.brand[600],
    marginTop: 2,
  },
  dealFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: THEME.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.slate[100],
  },
  lastContactText: {
    fontSize: 11,
    color: THEME.colors.slate[400],
  },
  advanceBtn: {
    backgroundColor: THEME.colors.slate[900],
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.radius.sm,
  },
  advanceBtnText: {
    color: THEME.colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  emptyStage: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: THEME.colors.white,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.slate[200],
    marginTop: 10,
  },
  emptyStageTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.slate[800],
  },
  emptyStageText: {
    fontSize: 11,
    color: THEME.colors.slate[500],
    textAlign: 'center',
    marginTop: 4,
  },
});
