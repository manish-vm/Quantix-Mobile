import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Field from '../components/Field';
import PrimaryButton from '../components/PrimaryButton';
import { employeesApi, reportsApi, scanApi } from '../services/api';
import { colors, styles } from '../styles';
import { formatDateTime, formatWeight, getScanStatus } from '../utils/format';

const productFormInitial = { partNo: '', description: '' };
const demoFormInitial = { partNo: '', unitWeight: '', toleranceWeight: '', totalCount: '' };
const employeeFormInitial = {
  employeeType: 'employee',
  employeeId: '',
  fullName: '',
  department: '',
  contactDetails: '',
  employmentStatus: 'full-time',
  email: '',
  password: ''
};

const asList = (data) => (Array.isArray(data) ? data : data?.products || []);
const countText = (value) => {
  if (value === null || value === undefined || value === '') return 'NA';
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(2) : 'NA';
};
const statusTone = (status) => (status === 'match' || status === 'accepted' ? styles.pillSuccess : styles.pillDanger);
const errorMessage = (err, fallback) => err?.response?.data?.message || err?.message || fallback;

function SectionTabs({ items, active, onChange }) {
  return (
    <View style={styles.segment}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.value}
          style={[styles.segmentButton, active === item.value && styles.segmentButtonActive]}
          onPress={() => onChange(item.value)}
        >
          <Text style={[styles.segmentText, active === item.value && styles.segmentTextActive]}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value ?? '-'}</Text>
    </View>
  );
}

export function DashboardScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await reportsApi.dashboard();
      setStats(res.data || {});
    } catch (err) {
      setError(errorMessage(err, 'Failed to load dashboard'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const matchRate = stats?.totalScans > 0 ? Math.round((stats.matchScans / stats.totalScans) * 100) : 0;
  const clampedMatchRate = Math.max(0, Math.min(matchRate, 100));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={() => load()} />}>
      <Text style={styles.title}>Dashboard</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={[styles.card, styles.metricGrid]}>
        {[
          ['Total Products', stats?.totalProducts || 0],
          ['Demo Data Records', stats?.totalDemoData || 0],
          ['Total Scans', stats?.totalScans || 0],
          ['Match Rate', `${matchRate}%`]
        ].map(([label, value]) => (
          <View key={label} style={styles.metric}>
            <Text style={styles.metricLabel}>{label}</Text>
            <Text style={styles.metricValue}>{value}</Text>
          </View>
        ))}
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Match vs Mismatch</Text>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { flex: clampedMatchRate, backgroundColor: colors.success }]} />
          <View style={{ flex: 100 - clampedMatchRate }} />
        </View>
        <InfoRow label="Match" value={stats?.matchScans || 0} />
        <InfoRow label="Mismatch" value={stats?.mismatchScans || 0} />
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Top Scanned Products</Text>
        {(stats?.topProducts || []).slice(0, 5).map((p, index) => <InfoRow key={p._id || index} label={p._id || 'Unknown'} value={`${p.count || 0} scans`} />)}
        {(!stats?.topProducts || stats.topProducts.length === 0) ? <Text style={styles.muted}>No product activity yet.</Text> : null}
      </View>
    </ScrollView>
  );
}

export function ProductMasterScreen() {
  const [products, setProducts] = useState([]);
  const [demoData, setDemoData] = useState([]);
  const [productForm, setProductForm] = useState(productFormInitial);
  const [demoForm, setDemoForm] = useState(demoFormInitial);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [productsRes, demoRes] = await Promise.all([
        scanApi.getProducts({ page: 1, limit: 50, ...(search ? { partNo: search } : {}) }),
        scanApi.getAllDemoData()
      ]);
      setProducts(asList(productsRes.data));
      setDemoData(Array.isArray(demoRes.data) ? demoRes.data : []);
    } catch (err) {
      setError(errorMessage(err, 'Failed to load products'));
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const demoFor = (partNo) => demoData.find((d) => d.partNo === partNo);
  const saveProduct = async () => {
    try {
      await scanApi.createProduct(productForm);
      setProductForm(productFormInitial);
      setMessage('Product created successfully');
      await load();
    } catch (err) {
      setError(errorMessage(err, 'Failed to create product'));
    }
  };
  const saveDemo = async () => {
    try {
      await scanApi.createDemoData({
        partNo: demoForm.partNo,
        unitWeight: Number(demoForm.unitWeight),
        toleranceWeight: Number(demoForm.toleranceWeight),
        totalCount: Number(demoForm.totalCount)
      });
      setDemoForm(demoFormInitial);
      setMessage('Baseline saved successfully');
      await load();
    } catch (err) {
      setError(errorMessage(err, 'Failed to create baseline'));
    }
  };
  const deleteProduct = (product) => Alert.alert('Delete product', `Delete ${product.partNo}?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => { await scanApi.deleteProduct(product._id); await load(); } }
  ]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Product Master</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {message ? <View style={styles.successBox}><Text style={{ color: colors.success }}>{message}</Text></View> : null}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Add Product</Text>
        <Field label="Part No" value={productForm.partNo} onChangeText={(v) => setProductForm((p) => ({ ...p, partNo: v.toUpperCase() }))} autoCapitalize="characters" />
        <Field label="Description" value={productForm.description} onChangeText={(v) => setProductForm((p) => ({ ...p, description: v }))} />
        <PrimaryButton title="Add Product" onPress={saveProduct} disabled={!productForm.partNo || !productForm.description} />
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Create Baseline</Text>
        <Field label="Part No" value={demoForm.partNo} onChangeText={(v) => setDemoForm((p) => ({ ...p, partNo: v.toUpperCase() }))} autoCapitalize="characters" />
        <View style={styles.row}>
          <Field label="Unit Weight" value={demoForm.unitWeight} onChangeText={(v) => setDemoForm((p) => ({ ...p, unitWeight: v }))} keyboardType="numeric" style={styles.flex} />
          <Field label="Tolerance" value={demoForm.toleranceWeight} onChangeText={(v) => setDemoForm((p) => ({ ...p, toleranceWeight: v }))} keyboardType="numeric" style={styles.flex} />
        </View>
        <Field label="Total Count" value={demoForm.totalCount} onChangeText={(v) => setDemoForm((p) => ({ ...p, totalCount: v }))} keyboardType="numeric" />
        <PrimaryButton title="Create Baseline" onPress={saveDemo} disabled={!demoForm.partNo || !demoForm.unitWeight || !demoForm.totalCount} />
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Product List</Text>
        <Field label="Search Part No" value={search} onChangeText={setSearch} autoCapitalize="characters" />
        <PrimaryButton title={loading ? 'Loading...' : 'Search / Refresh'} onPress={load} />
        {products.map((product) => {
          const demo = demoFor(product.partNo);
          return (
            <View key={product._id} style={styles.listItem}>
              <Text style={styles.itemTitle}>{product.partNo}</Text>
              <Text style={styles.muted}>{product.description}</Text>
              <InfoRow label="Unit Weight" value={demo ? formatWeight(demo.unitWeight) : '-'} />
              <InfoRow label="Tolerance Weight" value={demo ? formatWeight(demo.toleranceWeight) : '-'} />
              <InfoRow label="Total Count" value={demo?.totalCount ?? '-'} />
              <InfoRow label="Overall Weight" value={demo ? formatWeight(demo.overallWeight) : '-'} />
              <TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={() => deleteProduct(product)}>
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

export function ReportsScreen() {
  const [tab, setTab] = useState('summary');
  const [summary, setSummary] = useState([]);
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({ partNo: '', dateFrom: '', dateTo: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (tab === 'summary') {
        const res = await reportsApi.products();
        setSummary(Array.isArray(res.data) ? res.data : []);
      } else {
        const res = await scanApi.getLogs(filters);
        setLogs(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      setError(errorMessage(err, 'Failed to load reports'));
    } finally {
      setLoading(false);
    }
  }, [filters, tab]);

  useEffect(() => { load(); }, [load]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Reports</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <SectionTabs items={[{ label: 'Product Summary', value: 'summary' }, { label: 'Scan Logs', value: 'logs' }]} active={tab} onChange={setTab} />
      {tab === 'logs' ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Filter Scan Logs</Text>
          <Field label="Part No" value={filters.partNo} onChangeText={(v) => setFilters((p) => ({ ...p, partNo: v }))} />
          <Field label="Date From" value={filters.dateFrom} onChangeText={(v) => setFilters((p) => ({ ...p, dateFrom: v }))} placeholder="YYYY-MM-DD" />
          <Field label="Date To" value={filters.dateTo} onChangeText={(v) => setFilters((p) => ({ ...p, dateTo: v }))} placeholder="YYYY-MM-DD" />
          <PrimaryButton title={loading ? 'Loading...' : 'Apply Filter'} onPress={load} />
        </View>
      ) : null}
      {(tab === 'summary' ? summary : logs).map((item, index) => (
        <View key={`${item.partNo}-${item.createdAt || index}`} style={styles.card}>
          <Text style={styles.itemTitle}>{item.partNo}</Text>
          <Text style={styles.muted}>{item.description || item.partDescription || 'No description'}</Text>
          {tab === 'summary' ? (
            <>
              <InfoRow label="Unit Weight" value={formatWeight(item.unitWeight)} />
              <InfoRow label="Tolerance Weight" value={formatWeight(item.toleranceWeight)} />
              <InfoRow label="Overall Weight" value={formatWeight(item.overallWeight)} />
              <InfoRow label="Total Ideal Product Count" value={countText(item.totalIdealProductCount)} />
              <InfoRow label="Vendor" value={item.vendorReview?.name || 'Not submitted'} />
              <InfoRow label="Employee" value={item.employeeReview?.name || 'Not reviewed'} />
            </>
          ) : (
            <>
              <InfoRow label="Received Weight" value={formatWeight(item.receivedWeight ?? item.measuredWeight)} />
              <InfoRow label="Expected Weight" value={formatWeight(item.expectedWeight ?? item.overallWeight)} />
              <InfoRow label="Scanned By" value={item.scannedByName || '-'} />
              <InfoRow label="Date & Time" value={formatDateTime(item.createdAt)} />
              <Text style={[styles.pill, statusTone(item.status)]}>{getScanStatus(item)}</Text>
            </>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

export function EmployeeManagementScreen() {
  const [employees, setEmployees] = useState([]);
  const [activeType, setActiveType] = useState('employee');
  const [form, setForm] = useState(employeeFormInitial);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await employeesApi.list();
      setEmployees(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(errorMessage(err, 'Failed to load employees'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => employees.filter((e) => {
    const type = e.employeeType || (e.department ? 'employee' : 'vendor');
    const haystack = `${e.fullName || e.name || ''} ${e.employeeId || ''} ${e.department || ''} ${e.email || ''}`.toLowerCase();
    return type === activeType && haystack.includes(search.toLowerCase());
  }), [activeType, employees, search]);

  const create = async () => {
    try {
      await employeesApi.create({ ...form, employeeType: activeType });
      setForm({ ...employeeFormInitial, employeeType: activeType });
      await load();
    } catch (err) {
      setError(errorMessage(err, 'Failed to create employee'));
    }
  };
  const remove = (emp) => Alert.alert('Delete employee', `Delete ${emp.fullName || emp.employeeId}?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => { await employeesApi.delete(emp._id); await load(); } }
  ]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Employee Management</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <SectionTabs items={[{ label: 'Employee', value: 'employee' }, { label: 'Vendor', value: 'vendor' }]} active={activeType} onChange={setActiveType} />
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Add {activeType === 'vendor' ? 'Vendor' : 'Employee'}</Text>
        <Field label={activeType === 'vendor' ? 'Vendor ID Code' : 'Emp ID'} value={form.employeeId} onChangeText={(v) => setForm((p) => ({ ...p, employeeId: v }))} />
        <Field label={activeType === 'vendor' ? 'Vendor Name' : 'Full Name'} value={form.fullName} onChangeText={(v) => setForm((p) => ({ ...p, fullName: v }))} />
        {activeType === 'employee' ? <Field label="Department" value={form.department} onChangeText={(v) => setForm((p) => ({ ...p, department: v }))} /> : null}
        <Field label="Contact No" value={form.contactDetails} onChangeText={(v) => setForm((p) => ({ ...p, contactDetails: v }))} />
        <Field label="Email" value={form.email} onChangeText={(v) => setForm((p) => ({ ...p, email: v }))} keyboardType="email-address" autoCapitalize="none" />
        <Field label="Password" value={form.password} onChangeText={(v) => setForm((p) => ({ ...p, password: v }))} secureTextEntry />
        <PrimaryButton title="Create" onPress={create} disabled={!form.employeeId || !form.fullName || !form.email || !form.password} />
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Manage {activeType === 'vendor' ? 'Vendor' : 'Employee'}</Text>
        <Field label="Search" value={search} onChangeText={setSearch} />
        <PrimaryButton title={loading ? 'Loading...' : 'Refresh'} onPress={load} />
        {filtered.map((emp) => (
          <View key={emp._id || emp.email} style={styles.listItem}>
            <Text style={styles.itemTitle}>{emp.employeeId || 'N/A'} | {emp.fullName || emp.name || 'N/A'}</Text>
            {activeType === 'employee' ? <InfoRow label="Department" value={emp.department || 'N/A'} /> : null}
            <InfoRow label="Contact No" value={emp.contactDetails || 'N/A'} />
            <InfoRow label="Email" value={emp.email || 'N/A'} />
            <InfoRow label="Status" value={emp.employmentStatus === 'part-time' ? 'Inactive' : 'Active'} />
            <TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={() => remove(emp)}>
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
