import React, { useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AlertCard } from '../components/AlertCard';
import { ContactDetailModal } from '../components/ContactDetailModal';
import { ForecastCard } from '../components/ForecastCard';
import { Header } from '../components/Header';
import { RecordSalesModal } from '../components/RecordSalesModal';
import { THEME } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n';
import { sfaService } from '../services/sfaService';
import { AlertsData, Contact, ForecastData } from '../types';

export const HomeScreen: React.FC = () => {
  const { currentMode } = useAuth();
  const { t } = useLanguage();
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [alerts, setAlerts] = useState<AlertsData | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Modals state
  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  const loadDashboardData = async () => {
    try {
      const [fData, aData, cData] = await Promise.all([
        sfaService.getForecast(),
        sfaService.getAlerts(),
        sfaService.getContacts('ltv', currentMode),
      ]);
      setForecast(fData);
      setAlerts(aData);
      setContacts(cData);
    } catch (err) {
      console.warn('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [currentMode]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleAlertAction = (contact: Contact, actionType: string) => {
    setSelectedContact(contact);
    setIsDetailModalOpen(true);
  };

  return (
    <View style={styles.container}>
      <Header
        title={t.home.title}
        subtitle={
          currentMode === 'VIP_HOSPITALITY'
            ? t.home.subtitleVip
            : t.home.subtitleB2b
        }
      />

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Forecast Card */}
        <ForecastCard data={forecast} isLoading={isLoading && !refreshing} />

        {/* Action Alerts Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {t.home.actionAlerts} ({alerts?.summary?.total_alerts || 0})
          </Text>
          <TouchableOpacity onPress={onRefresh}>
            <Text style={styles.refreshLink}>{t.home.liveSync}</Text>
          </TouchableOpacity>
        </View>

        {/* Birthday alerts */}
        {alerts?.birthdays?.map((c) => (
          <AlertCard
            key={`bday_${c.id}`}
            type="birthday"
            contact={c}
            onAction={handleAlertAction}
          />
        ))}

        {/* Inactive clients alerts */}
        {alerts?.inactive_clients?.map((c) => (
          <AlertCard
            key={`inactive_${c.id}`}
            type="inactive"
            contact={c}
            onAction={handleAlertAction}
          />
        ))}

        {/* Stalled deals alerts */}
        {alerts?.stalled_deals?.map((c) => (
          <AlertCard
            key={`stalled_${c.id}`}
            type="stalled"
            contact={c}
            onAction={handleAlertAction}
          />
        ))}

        {alerts?.summary?.total_alerts === 0 && !isLoading && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>{t.home.emptyAlertsTitle}</Text>
            <Text style={styles.emptyText}>{t.home.emptyAlertsText}</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action: Record Sales / Bill */}
      <View style={styles.floatingActionContainer}>
        <TouchableOpacity
          style={styles.floatingRecordBtn}
          activeOpacity={0.85}
          onPress={() => {
            setSelectedContact(null);
            setIsRecordModalOpen(true);
          }}
        >
          <Text style={styles.floatingBtnText}>{t.home.recordBill}</Text>
        </TouchableOpacity>
      </View>

      {/* Record Sales Modal */}
      <RecordSalesModal
        visible={isRecordModalOpen}
        contacts={contacts}
        selectedContact={selectedContact}
        onClose={() => setIsRecordModalOpen(false)}
        onSuccess={() => {
          loadDashboardData();
        }}
      />

      {/* Contact Detail Modal */}
      <ContactDetailModal
        visible={isDetailModalOpen}
        contact={selectedContact}
        onClose={() => setIsDetailModalOpen(false)}
        onInteractionLogged={() => {
          loadDashboardData();
        }}
        onOpenRecordSales={(c) => {
          setSelectedContact(c);
          setIsRecordModalOpen(true);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.slate[50],
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.sm,
    marginBottom: THEME.spacing.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.slate[700],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  refreshLink: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.brand[600],
  },
  emptyCard: {
    backgroundColor: THEME.colors.white,
    marginHorizontal: THEME.spacing.lg,
    padding: THEME.spacing.xl,
    borderRadius: THEME.radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.slate[200],
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.slate[800],
  },
  emptyText: {
    fontSize: 12,
    color: THEME.colors.slate[500],
    textAlign: 'center',
    marginTop: 4,
  },
  floatingActionContainer: {
    position: 'absolute',
    bottom: 16,
    left: THEME.spacing.lg,
    right: THEME.spacing.lg,
  },
  floatingRecordBtn: {
    backgroundColor: THEME.colors.slate[900],
    paddingVertical: 14,
    borderRadius: THEME.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  floatingBtnText: {
    color: THEME.colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
});
