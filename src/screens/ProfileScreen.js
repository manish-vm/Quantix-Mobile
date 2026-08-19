import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import Field from '../components/Field';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { colors, styles } from '../styles';

const emptyProfile = {
  name: '',
  email: '',
  employeeId: '',
  fullName: '',
  department: '',
  jobTitle: '',
  contactDetails: '',
  hireDate: '',
  employmentStatus: 'full-time',
  manager: '',
  salary: '',
  location: ''
};

const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');
const normalizeSalary = (value) => {
  if (value === '' || value === null || value === undefined) return '';
  const n = Number(value);
  return Number.isFinite(n) ? n : '';
};

export default function ProfileScreen() {
  const { refreshUser, isVendor } = useAuth();
  const [form, setForm] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    const load = async () => {
      try {
        const res = await authApi.me();
        setForm({
          name: res.data?.name ?? '',
          email: res.data?.email ?? '',
          employeeId: res.data?.employeeId ?? '',
          fullName: res.data?.fullName ?? '',
          department: res.data?.department ?? '',
          jobTitle: res.data?.jobTitle ?? '',
          contactDetails: res.data?.contactDetails ?? '',
          hireDate: toDateInput(res.data?.hireDate),
          employmentStatus: res.data?.employmentStatus ?? 'full-time',
          manager: res.data?.manager ?? '',
          salary: res.data?.salary == null ? '' : String(res.data.salary),
          location: res.data?.location ?? ''
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await authApi.updateMe({
        ...form,
        salary: normalizeSalary(form.salary)
      });
      await refreshUser();
      setMessage('Profile saved');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{isVendor ? 'Vendor profile' : 'Employee profile'}</Text>
        <Text style={styles.subtitle}>Update your personal and HR details on the common Quantix backend.</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {message ? <View style={styles.successBox}><Text style={{ color: colors.success, fontWeight: 'bold' }}>{message}</Text></View> : null}
        {loading ? <Text style={styles.loadingText}>Loading...</Text> : null}

        {!loading ? (
          <View style={styles.card}>
            <Field label="Full Name" value={form.fullName} onChangeText={(v) => setField('fullName', v)} />
            <Field label={isVendor ? 'Vendor ID Code' : 'Employee ID'} value={form.employeeId} onChangeText={(v) => setField('employeeId', v)} />
            <Field label="Email" keyboardType="email-address" value={form.email} onChangeText={(v) => setField('email', v)} />
            {!isVendor ? (
              <>
                <Field label="Department" value={form.department} onChangeText={(v) => setField('department', v)} />
                <Field label="Job Title" value={form.jobTitle} onChangeText={(v) => setField('jobTitle', v)} />
                <Field label="Manager" value={form.manager} onChangeText={(v) => setField('manager', v)} />
              </>
            ) : null}
            <Field label="Contact Details" keyboardType="phone-pad" value={form.contactDetails} onChangeText={(v) => setField('contactDetails', v)} />
            <Field label="Employment Status" value={form.employmentStatus} onChangeText={(v) => setField('employmentStatus', v)} />
            <Field label="Hire Date (YYYY-MM-DD)" value={form.hireDate} onChangeText={(v) => setField('hireDate', v)} />
            <Field label="Location" value={form.location} onChangeText={(v) => setField('location', v)} />
            {!isVendor ? (
              <Field label="Salary" keyboardType="numeric" value={form.salary} onChangeText={(v) => setField('salary', v)} />
            ) : null}
            <PrimaryButton title="Save profile" onPress={save} loading={saving} />
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
