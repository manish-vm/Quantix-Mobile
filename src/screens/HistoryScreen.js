import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { scanApi } from '../services/api';
import { colors, styles } from '../styles';
import { formatDateTime, formatWeight, getScanDiff, getScanStatus } from '../utils/format';

export default function HistoryScreen() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadHistory = useCallback(async () => {
    setError('');
    const res = await scanApi.getHistory();
    setLogs(Array.isArray(res.data) ? res.data : []);
  }, []);

  useEffect(() => {
    loadHistory()
      .catch((err) => setError(err.response?.data?.message || 'Failed to load scan history'))
      .finally(() => setLoading(false));
  }, [loadHistory]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to refresh scan history');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>My scan history</Text>
      <Text style={styles.subtitle}>Recent validations submitted from web or mobile are shown here.</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? <Text style={styles.loadingText}>Loading...</Text> : null}

      {!loading && logs.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.muted}>No scan history available.</Text>
        </View>
      ) : null}

      {logs.map((log) => {
        const status = getScanStatus(log);
        const statusStyle = status === 'Match'
          ? styles.pillSuccess
          : status === 'Excess'
            ? styles.pillWarning
            : styles.pillDanger;
        return (
          <View key={`${log._id}-${log.createdAt}`} style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>{log.partNo}</Text>
                <Text style={[styles.muted, { marginTop: 3 }]}>{log.partDescription || log.description || 'No description'}</Text>
              </View>
              <Text style={[styles.pill, statusStyle]}>{status}</Text>
            </View>

            <View style={[styles.metricGrid, { marginTop: 14 }]}>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Measured</Text>
                <Text style={styles.metricValue}>{formatWeight(log.measuredWeight)}</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Expected</Text>
                <Text style={styles.metricValue}>{formatWeight(log.expectedWeight ?? log.overallWeight)}</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Difference</Text>
                <Text style={styles.metricValue}>{getScanDiff(log)}</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Final</Text>
                <Text style={styles.metricValue}>{log.finalValidationStatus === 'accepted' ? 'Accepted' : 'Rejected'}</Text>
              </View>
            </View>

            <Text style={[styles.muted, { marginTop: 12 }]}>
              Unit: {formatWeight(log.unitWeight)} | Tolerance: {formatWeight(log.toleranceWeight)}
            </Text>
            <Text style={[styles.muted, { marginTop: 4 }]}>
              {formatDateTime(log.createdAt)}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}
