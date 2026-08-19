import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Field from '../components/Field';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { colors, styles } from '../styles';

export default function LoginScreen() {
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      if (isRegister) {
        await authApi.register(form);
      }
      const res = await authApi.login({ email: form.email, password: form.password });
      await login(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, { flexGrow: 1, justifyContent: 'center' }]}>
        <View style={styles.card}>
          <Image
            source={require('../../assets/splash.png')}
            style={{ width: 400, height: 200, alignSelf: 'center'}}
            resizeMode="contain"
          />


          {error ? <Text style={styles.error}>{error}</Text> : null}

          {isRegister ? (
            <>
              <Field label="Name" value={form.name} onChangeText={(v) => setField('name', v)} />
              <Text style={styles.label}>Role</Text>
              <View style={styles.row}>
                {['employee', 'vendor'].map((role) => (
                  <TouchableOpacity
                    key={role}
                    onPress={() => setField('role', role)}
                    style={[
                      styles.button,
                      styles.buttonSecondary,
                      styles.flex,
                      form.role === role && { backgroundColor: colors.primary }
                    ]}
                  >
                    <Text style={[
                      styles.buttonText,
                      styles.buttonSecondaryText,
                      form.role === role && { color: '#fff' }
                    ]}>
                      {role === 'vendor' ? 'Vendor' : 'Employee'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : null}

          <Field label="Email" keyboardType="email-address" value={form.email} onChangeText={(v) => setField('email', v)} />
          <Field label="Password" secureTextEntry value={form.password} onChangeText={(v) => setField('password', v)} />
          <PrimaryButton title={isRegister ? 'Create account' : 'Sign in'} onPress={submit} loading={loading} disabled={!form.email || !form.password || (isRegister && !form.name)} />

          <TouchableOpacity onPress={() => setIsRegister((prev) => !prev)} style={{ paddingVertical: 16, alignItems: 'center' }}>
            <Text style={{ color: colors.primaryDark, fontWeight: 'bold' }}>
              {isRegister ? 'Already have an account? Sign in' : 'Need an account? Register'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
