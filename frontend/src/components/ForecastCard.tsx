import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../constants/theme';
import { useLanguage } from '../i18n';
import { ForecastData } from '../types';

interface ForecastCardProps {
  data: ForecastData | null;
  isLoading?: boolean;
}

export const ForecastCard: React.FC<ForecastCardProps> = ({ data, isLoading }) => {
  const { t, formatCurrency } = useLanguage();

  if (isLoading || !data) {
    return (
      <View style={[styles.card, styles.loadingCard]}>
        <Text style={styles.loadingText}>{t.forecast.calculating}</Text>
      </View>
    );
  }

  const progress = Math.min(Math.max((data.projected_finish / (data.quota || 1)) * 100, 0), 100);
  const confirmedWidth = Math.min(Math.max((data.confirmed_sales / (data.quota || 1)) * 100, 0), 100);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.cardLabel}>{t.forecast.title}</Text>
          <Text style={styles.projectedAmount}>{formatCurrency(data.projected_finish)}</Text>
        </View>
        <View style={styles.pacingBadge}>
          <Text style={styles.pacingText}>
            {data.pacing_percentage}% {t.forecast.pacing}
          </Text>
        </View>
      </View>

      {/* Goal Pacing Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View style={[styles.confirmedBar, { width: `${confirmedWidth}%` }]} />
          <View style={[styles.projectedBar, { width: `${progress}%` }]} />
        </View>
      </View>

      <View style={styles.quotaRow}>
        <Text style={styles.quotaText}>
          {t.forecast.targetQuota}: {formatCurrency(data.quota)}
        </Text>
        <Text style={styles.finishText}>
          {t.forecast.projected}: {progress.toFixed(0)}%
        </Text>
      </View>

      {/* Metrics Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricItem}>
          <View style={styles.metricDotConfirmed} />
          <View>
            <Text style={styles.metricLabel}>{t.forecast.confirmed}</Text>
            <Text style={styles.metricValue}>{formatCurrency(data.confirmed_sales)}</Text>
          </View>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <View style={styles.metricDotPipeline} />
          <View>
            <Text style={styles.metricLabel}>{t.forecast.weightedPipeline}</Text>
            <Text style={styles.metricValue}>{formatCurrency(data.weighted_forecast)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.slate[900],
    borderRadius: THEME.radius.lg,
    padding: THEME.spacing.lg,
    marginHorizontal: THEME.spacing.lg,
    marginVertical: THEME.spacing.md,
    shadowColor: THEME.colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  loadingCard: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: THEME.colors.slate[400],
    fontSize: 13,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardLabel: {
    fontSize: 11,
    color: THEME.colors.slate[400],
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  projectedAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: THEME.colors.white,
    marginTop: 4,
    letterSpacing: -0.5,
  },
  pacingBadge: {
    backgroundColor: 'rgba(2, 132, 199, 0.25)',
    borderWidth: 1,
    borderColor: THEME.colors.brand[500],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.radius.sm,
  },
  pacingText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  progressContainer: {
    marginTop: THEME.spacing.md,
  },
  progressBackground: {
    height: 8,
    backgroundColor: THEME.colors.slate[800],
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  confirmedBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: THEME.colors.brand[500],
    zIndex: 2,
    borderRadius: 4,
  },
  projectedBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(2, 132, 199, 0.4)',
    zIndex: 1,
    borderRadius: 4,
  },
  quotaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  quotaText: {
    fontSize: 11,
    color: THEME.colors.slate[400],
  },
  finishText: {
    fontSize: 11,
    color: THEME.colors.slate[400],
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  metricItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: THEME.spacing.md,
  },
  metricDotConfirmed: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.brand[500],
    marginRight: 8,
  },
  metricDotPipeline: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#38bdf8',
    marginRight: 8,
  },
  metricLabel: {
    fontSize: 10,
    color: THEME.colors.slate[400],
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.white,
    marginTop: 1,
  },
});
