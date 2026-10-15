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
import { Header } from '../components/Header';
import { THEME } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n';
import { sfaService } from '../services/sfaService';
import { MessageTemplate, SocialPost } from '../types';

export const GrowthScreen: React.FC = () => {
  const { currentMode } = useAuth();
  const { t, formatCurrency, formatDate } = useLanguage();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadGrowthData = async () => {
    try {
      const [pData, tData] = await Promise.all([
        sfaService.getSocialPosts(),
        sfaService.getTemplateAnalytics(currentMode),
      ]);
      setPosts(pData);
      setTemplates(tData);
    } catch (err) {
      console.warn('Failed to load growth data:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadGrowthData();
  }, [currentMode]);

  const onRefresh = () => {
    setRefreshing(true);
    loadGrowthData();
  };

  const handleSyncSocial = async () => {
    setIsSyncing(true);
    try {
      await sfaService.syncSocial(true);
      await loadGrowthData();
    } catch (err) {
      console.warn('Failed to sync social posts:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const totalAttributedSales = posts.reduce(
    (sum, p) => sum + (Number(p.attributed_sales_amount) || 0),
    0
  );

  return (
    <View style={styles.container}>
      <Header
        title={t.growth.title}
        subtitle={t.growth.subtitle}
      />

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Attribution Overview Banner */}
        <View style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <View>
              <Text style={styles.overviewLabel}>{t.growth.campaignAttributedSales}</Text>
              <Text style={styles.overviewAmount}>{formatCurrency(totalAttributedSales)}</Text>
            </View>
            <TouchableOpacity
              style={[styles.syncBtn, isSyncing && styles.syncBtnDisabled]}
              onPress={handleSyncSocial}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <ActivityIndicator color={THEME.colors.white} size="small" />
              ) : (
                <Text style={styles.syncBtnText}>{t.growth.syncPosts}</Text>
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.overviewNotice}>
            {t.growth.overviewNotice}
          </Text>
        </View>

        {/* Section 1: Social Posts Performance */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {t.growth.autoSyncedPosts} ({posts.length})
          </Text>
          <Text style={styles.sectionSub}>{t.growth.autoSyncedSubtitle}</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color={THEME.colors.brand[600]} style={{ marginVertical: 20 }} />
        ) : (
          posts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postTopRow}>
                <View style={styles.platformBadge}>
                  <Text style={styles.platformBadgeText}>
                    {post.external_post_id?.startsWith('ig')
                      ? t.growth.platformInstagram
                      : t.growth.platformTwitter}
                  </Text>
                </View>
                <Text style={styles.postDate}>
                  {formatDate(post.posted_at)}
                </Text>
              </View>

              <Text style={styles.postCaption} numberOfLines={3}>
                {post.caption || t.growth.noCaption}
              </Text>

              <View style={styles.postMetricsRow}>
                <View style={styles.postMetric}>
                  <Text style={styles.metricValText}>👀 {post.impressions_count.toLocaleString()}</Text>
                  <Text style={styles.metricSubText}>{t.growth.impressions}</Text>
                </View>
                <View style={styles.postMetric}>
                  <Text style={styles.metricValText}>❤️ {post.likes_count.toLocaleString()}</Text>
                  <Text style={styles.metricSubText}>{t.growth.likes}</Text>
                </View>
                <View style={styles.postMetricAttributed}>
                  <Text style={styles.attributedAmountText}>
                    {formatCurrency(post.attributed_sales_amount)}
                  </Text>
                  <Text style={styles.metricSubText}>{t.growth.attributedSales}</Text>
                </View>
              </View>
            </View>
          ))
        )}

        {/* Section 2: Pitch Template CVR */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t.growth.cvrRankings}</Text>
          <Text style={styles.sectionSub}>{t.growth.cvrSubtitle}</Text>
        </View>

        {templates.map((tpl, idx) => (
          <View key={tpl.id} style={styles.templateCard}>
            <View style={styles.templateHeader}>
              <View style={styles.cvrBadge}>
                <Text style={styles.cvrValue}>{tpl.cvr_percentage}%</Text>
                <Text style={styles.cvrLabel}>CVR</Text>
              </View>
              <View style={styles.templateTitleCol}>
                <Text style={styles.templateTitle}>
                  #{idx + 1} {tpl.title}
                </Text>
                <Text style={styles.templateStats}>
                  {t.growth.usedTimes.replace('{count}', String(tpl.used_count))} •{' '}
                  {t.growth.wonDeals.replace('{count}', String(tpl.converted_count))}
                </Text>
              </View>
            </View>

            <View style={styles.templateContentBox}>
              <Text style={styles.templateContentText} numberOfLines={3}>
                {tpl.content}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.copyTemplateBtn}
              onPress={() => {
                setCopiedId(tpl.id);
                setTimeout(() => setCopiedId(null), 2000);
              }}
            >
              <Text style={styles.copyTemplateBtnText}>
                {copiedId === tpl.id ? t.growth.copied : t.growth.copyScript}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={{ height: 60 }} />
      </ScrollView>
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
  overviewCard: {
    backgroundColor: THEME.colors.slate[900],
    borderRadius: THEME.radius.lg,
    padding: THEME.spacing.lg,
    marginHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.md,
    shadowColor: THEME.colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overviewLabel: {
    fontSize: 11,
    color: THEME.colors.slate[400],
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  overviewAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: THEME.colors.white,
    marginTop: 2,
  },
  syncBtn: {
    backgroundColor: THEME.colors.brand[600],
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: THEME.radius.md,
  },
  syncBtnDisabled: {
    opacity: 0.6,
  },
  syncBtnText: {
    color: THEME.colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  overviewNotice: {
    fontSize: 11,
    color: THEME.colors.slate[400],
    marginTop: 10,
    lineHeight: 15,
  },
  sectionHeader: {
    paddingHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.lg,
    marginBottom: THEME.spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.slate[800],
  },
  sectionSub: {
    fontSize: 11,
    color: THEME.colors.slate[400],
    marginTop: 1,
  },
  postCard: {
    backgroundColor: THEME.colors.white,
    borderRadius: THEME.radius.lg,
    padding: THEME.spacing.lg,
    marginHorizontal: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.slate[200],
  },
  postTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  platformBadge: {
    backgroundColor: THEME.colors.slate[100],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.radius.sm,
  },
  platformBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.slate[700],
  },
  postDate: {
    fontSize: 11,
    color: THEME.colors.slate[400],
  },
  postCaption: {
    fontSize: 13,
    color: THEME.colors.slate[800],
    lineHeight: 18,
    marginBottom: 12,
  },
  postMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: THEME.colors.slate[100],
    paddingTop: 10,
  },
  postMetric: {
    marginRight: 20,
  },
  postMetricAttributed: {
    marginLeft: 'auto',
    alignItems: 'flex-end',
  },
  metricValText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.slate[800],
  },
  metricSubText: {
    fontSize: 9,
    color: THEME.colors.slate[400],
    marginTop: 1,
  },
  attributedAmountText: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.emerald[700],
  },
  templateCard: {
    backgroundColor: THEME.colors.white,
    borderRadius: THEME.radius.lg,
    padding: THEME.spacing.lg,
    marginHorizontal: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.slate[200],
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cvrBadge: {
    backgroundColor: THEME.colors.brand[50],
    borderWidth: 1,
    borderColor: THEME.colors.brand[200],
    borderRadius: THEME.radius.md,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    marginRight: 10,
  },
  cvrValue: {
    fontSize: 14,
    fontWeight: '900',
    color: THEME.colors.brand[700],
  },
  cvrLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: THEME.colors.brand[500],
  },
  templateTitleCol: {
    flex: 1,
  },
  templateTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.slate[900],
  },
  templateStats: {
    fontSize: 10,
    color: THEME.colors.slate[500],
    marginTop: 2,
  },
  templateContentBox: {
    backgroundColor: THEME.colors.slate[50],
    padding: 10,
    borderRadius: THEME.radius.md,
    marginBottom: 10,
  },
  templateContentText: {
    fontSize: 12,
    color: THEME.colors.slate[700],
    lineHeight: 16,
    fontStyle: 'italic',
  },
  copyTemplateBtn: {
    backgroundColor: THEME.colors.slate[100],
    paddingVertical: 8,
    borderRadius: THEME.radius.md,
    alignItems: 'center',
  },
  copyTemplateBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.slate[700],
  },
});
