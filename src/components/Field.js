import React from 'react';
import { Text, TextInput, View } from 'react-native';
import { styles } from '../styles';

export default function Field({ label, style, ...props }) {
  return (
    <View style={style}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#8b9a96"
        style={styles.input}
        autoCapitalize="none"
        {...props}
      />
    </View>
  );
}
