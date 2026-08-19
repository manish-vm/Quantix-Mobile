import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { colors, styles } from '../styles';

export default function PrimaryButton({ title, onPress, loading, disabled, variant = 'primary', style }) {
  const isSecondary = variant === 'secondary';
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        isSecondary && styles.buttonSecondary,
        variant === 'danger' && styles.buttonDanger,
        (disabled || loading) && styles.buttonDisabled,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isSecondary ? colors.primary : '#fff'} />
      ) : (
        <Text style={[styles.buttonText, isSecondary && styles.buttonSecondaryText]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
