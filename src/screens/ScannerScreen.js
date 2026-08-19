import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Field from '../components/Field';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { scanApi } from '../services/api';
import { colors, styles } from '../styles';
import { formatWeight } from '../utils/format';

const emptyVendorData = {
  unitWeight: '',
  toleranceWeight: '',
  totalCount: ''
};

const toNumberOrNull = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

export default function ScannerScreen() {
  const { isVendor, user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [partNo, setPartNo] = useState('');
  const [partSuggestions, setPartSuggestions] = useState([]);
  const [showPartSuggestions, setShowPartSuggestions] = useState(false);
  const [partSuggestionsLoading, setPartSuggestionsLoading] = useState(false);
  const [weight, setWeight] = useState('');
  const [demo, setDemo] = useState(null);
  const [vendorData, setVendorData] = useState(emptyVendorData);
  const [vendorSubmissions, setVendorSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [result, setResult] = useState(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadSummary = useCallback(async () => {
    const res = await scanApi.getSummary();
    setSummary(res.data);
  }, []);

  useEffect(() => {
    loadSummary().catch(() => {});
  }, [loadSummary]);

  const loadPartSuggestions = useCallback(async (query = '') => {
    setPartSuggestionsLoading(true);

    try {
      const res = await scanApi.getProducts({
        page: 1,
        limit: 20,
        ...(query.trim() ? { partNo: query.trim() } : {})
      });

      setPartSuggestions(res.data?.products || []);
    } catch {
      setPartSuggestions([]);
    } finally {
      setPartSuggestionsLoading(false);
    }
  }, []);

  const handlePartFocus = () => {
    setShowPartSuggestions(true);
    loadPartSuggestions(partNo);
  };

  const handlePartChange = (value) => {
    const nextPartNo = value.toUpperCase();
    setPartNo(nextPartNo);
    setShowPartSuggestions(true);
    loadPartSuggestions(nextPartNo);
  };

  const handlePartSuggestionSelect = (nextPartNo) => {
    setPartNo(nextPartNo);
    setShowPartSuggestions(false);
  };

  const resetProductState = () => {
    setDemo(null);
    setVendorData(emptyVendorData);
    setVendorSubmissions([]);
    setSelectedSubmission(null);
    setResult(null);
    setIsNewProduct(false);
    setWeight('');
  };

  const lookupPart = async () => {
      const upperPartNo = partNo.trim().toUpperCase();
      if (!upperPartNo) return;
      setPartNo(upperPartNo);
    setShowPartSuggestions(false);
      resetProductState();
    setLoading(true);
    setError('');

    try {
      const res = await scanApi.getDemoData(upperPartNo);
      setDemo(res.data);
      setVendorData({
        unitWeight: String(res.data.unitWeight ?? ''),
        toleranceWeight: String(res.data.toleranceWeight ?? ''),
        totalCount: String(res.data.totalCount ?? '')
      });

      if (!isVendor) {
        const vendorRes = await scanApi.getVendorSubmissions(upperPartNo);
        setVendorSubmissions((vendorRes.data?.vendors || []).filter((item) => item.remainingReviewCount > 0));
      }
    } catch (err) {
      if (err.response?.status === 404 && err.response?.data?.requiresDemoData) {
        setDemo({
          partNo: upperPartNo,
          partDescription: '',
          unitWeight: '',
          toleranceWeight: '',
          totalCount: ''
        });
        setIsNewProduct(true);
      } else {
        setError(err.response?.data?.message || 'Product not found');
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedReferenceWeight = selectedSubmission?.overallWeight ?? selectedSubmission?.measuredWeight;
  const effectiveOverallWeight = useMemo(() => {
    const unit = toNumberOrNull(vendorData.unitWeight);
    const count = toNumberOrNull(vendorData.totalCount);
    if (unit === null || count === null) return null;
    return unit * count;
  }, [vendorData]);

  const liveStatus = useMemo(() => {
    const measured = toNumberOrNull(weight);
    if (!demo || measured === null) return null;

    const expected = selectedReferenceWeight ?? effectiveOverallWeight;
    if (expected === null || expected === undefined) return null;
    const diff = measured - Number(expected);
    const tolerance = selectedReferenceWeight !== undefined && selectedReferenceWeight !== null
      ? 0
      : Number(vendorData.toleranceWeight || demo.toleranceWeight || 0);

    if (Math.abs(diff) <= tolerance) return { label: 'Match', diff, color: colors.success };
    if (diff > 0) return { label: 'Excess', diff, color: colors.warning };
    return { label: 'Short', diff, color: colors.danger };
  }, [demo, effectiveOverallWeight, selectedReferenceWeight, vendorData.toleranceWeight, weight]);

  const createDemo = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await scanApi.createDemoData({
        partNo: partNo.trim().toUpperCase(),
        partDescription: demo?.partDescription || 'Unknown',
        unitWeight: Number(vendorData.unitWeight),
        toleranceWeight: Number(vendorData.toleranceWeight || 0),
        totalCount: Number(vendorData.totalCount)
      });
      setDemo(res.data);
      setIsNewProduct(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create demo data');
    } finally {
      setLoading(false);
    }
  };

  const validateWeight = async () => {
    if (!demo || !weight) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const payload = {
        partNo: demo.partNo || partNo.trim().toUpperCase(),
        measuredWeight: Number(weight),
        vendorOverrideData: {
          unitWeight: Number(vendorData.unitWeight),
          toleranceWeight: Number(vendorData.toleranceWeight || 0),
          totalCount: Number(vendorData.totalCount),
          overallWeight: Number(effectiveOverallWeight)
        }
      };

      if (selectedReferenceWeight !== undefined && selectedReferenceWeight !== null) {
        payload.referenceWeight = Number(selectedReferenceWeight);
      }
      if (selectedSubmission?._id) {
        payload.vendorSubmissionId = selectedSubmission._id;
      }

      const res = await scanApi.validate(payload);
      setResult(res.data);
      await loadSummary();
    } catch (err) {
      setError(err.response?.data?.message || 'Validation failed');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadSummary();
      if (partNo.trim()) await lookupPart();
    } finally {
      setRefreshing(false);
    }
  };

  const canValidate = demo && !isNewProduct && weight && (!vendorSubmissions.length || selectedSubmission || isVendor);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Scan product</Text>
      <Text style={styles.subtitle}>
        Signed in as {user?.name || user?.email}. Enter a scanned part number or type it manually.
      </Text>

      {summary ? (
        <View style={[styles.card, styles.metricGrid]}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Total scans</Text>
            <Text style={styles.metricValue}>{summary.totalScans || 0}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Scanned weight</Text>
            <Text style={styles.metricValue}>{formatWeight(summary.totalWeightScanned || 0)}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Products scanned</Text>
            <Text style={styles.metricValue}>{summary.totalProductsScanned || 0}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Remaining</Text>
            <Text style={styles.metricValue}>{summary.totalRemainingProducts || 0}</Text>
          </View>
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.card}>
        <Field
          label="Part Number"
          value={partNo}
          onFocus={handlePartFocus}
          onChangeText={handlePartChange}
          autoCapitalize="characters"
        />
        {showPartSuggestions ? (
          <View style={{ borderColor: colors.border, borderWidth: 1, borderRadius: 8, marginTop: -6, marginBottom: 12, overflow: 'hidden' }}>
            {partSuggestionsLoading ? (
              <Text style={{ color: colors.muted, padding: 12 }}>Loading parts...</Text>
            ) : null}

            {!partSuggestionsLoading && partSuggestions.length === 0 ? (
              <Text style={{ color: colors.muted, padding: 12 }}>No parts found</Text>
            ) : null}

            {!partSuggestionsLoading && partSuggestions.map((part) => (
              <TouchableOpacity
                key={part._id || part.partNo}
                onPress={() => handlePartSuggestionSelect(part.partNo)}
                style={{ padding: 12, borderTopColor: colors.border, borderTopWidth: 1, backgroundColor: colors.surface }}
              >
                <Text style={{ color: colors.text, fontWeight: 'bold' }}>{part.partNo}</Text>
                {part.description ? (
                  <Text style={[styles.muted, { marginTop: 3 }]}>{part.description}</Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
        <PrimaryButton title="Load product" onPress={lookupPart} loading={loading} disabled={!partNo.trim()} />
      </View>

      {demo ? (
        <View style={styles.card}>
          <Text style={[styles.label, { fontSize: 17 }]}>{demo.partNo}</Text>
          <Text style={[styles.subtitle, { marginBottom: 8 }]}>{demo.partDescription || 'No description available'}</Text>

          <View style={styles.row}>
            <Field label="Unit Weight" keyboardType="numeric" value={vendorData.unitWeight} onChangeText={(v) => setVendorData((p) => ({ ...p, unitWeight: v }))} style={styles.flex} />
            <Field label="Tolerance" keyboardType="numeric" value={vendorData.toleranceWeight} onChangeText={(v) => setVendorData((p) => ({ ...p, toleranceWeight: v }))} style={styles.flex} />
          </View>
          <Field label="Total Count" keyboardType="numeric" value={vendorData.totalCount} onChangeText={(v) => setVendorData((p) => ({ ...p, totalCount: v }))} />

          {effectiveOverallWeight !== null ? (
            <Text style={styles.subtitle}>Overall weight: {formatWeight(effectiveOverallWeight)}</Text>
          ) : null}

          {isNewProduct ? (
            <PrimaryButton title="Create baseline data" onPress={createDemo} loading={loading} disabled={!vendorData.unitWeight || !vendorData.totalCount} />
          ) : null}
        </View>
      ) : null}

      {!isVendor && vendorSubmissions.length ? (
        <View style={styles.card}>
          <Text style={[styles.label, { fontSize: 16 }]}>Vendor submissions to review</Text>
          {vendorSubmissions.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={[styles.warningBox, selectedSubmission?._id === item._id && { borderColor: colors.primary, backgroundColor: colors.softPrimary }]}
              onPress={() => setSelectedSubmission(item)}
            >
              <Text style={{ color: colors.text, fontWeight: 'bold' }}>{item.vendorName || 'Vendor'}</Text>
              <Text style={styles.muted}>Weight: {formatWeight(item.overallWeight ?? item.measuredWeight)} | Remaining reviews: {item.remainingReviewCount}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      {demo && !isNewProduct ? (
        <View style={styles.card}>
          <Field label="Measured Weight" keyboardType="numeric" value={weight} onChangeText={setWeight} />
          {selectedSubmission ? (
            <Text style={styles.subtitle}>Cross-checking vendor weight: {formatWeight(selectedReferenceWeight)}</Text>
          ) : null}
          {liveStatus ? (
            <Text style={[styles.pill, { backgroundColor: colors.background, color: liveStatus.color, marginBottom: 12 }]}>
              {liveStatus.label} | {liveStatus.diff > 0 ? '+' : ''}{liveStatus.diff.toFixed(3)} kg
            </Text>
          ) : null}
          <PrimaryButton title="Validate weight" onPress={validateWeight} loading={loading} disabled={!canValidate} />
          {!isVendor && vendorSubmissions.length && !selectedSubmission ? (
            <Text style={[styles.muted, { marginTop: 10 }]}>Select a vendor submission before validating.</Text>
          ) : null}
        </View>
      ) : null}

      {result ? (
        <View style={[styles.card, result.status === 'match' ? styles.successBox : styles.error]}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: result.status === 'match' ? colors.success : colors.danger }}>
            {result.status === 'match' ? 'MATCH' : 'MISMATCH'}
          </Text>
          <Text style={{ color: colors.text, marginTop: 8 }}>Measured: {formatWeight(result.measuredWeight)}</Text>
          <Text style={{ color: colors.text }}>Expected: {formatWeight(result.expectedWeight)}</Text>
          <Text style={{ color: colors.text }}>Final validation: {result.finalValidationStatus === 'accepted' ? 'Accepted' : 'Rejected'}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
