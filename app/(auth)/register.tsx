import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/stores/useAuthStore';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register, isLoading } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async () => {
    setErrorMessage('');
    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    const res = await register(name, email, password);
    if (res.success) {
      router.replace('/(tabs)');
    } else if (res.error) {
      setErrorMessage(res.error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}
        keyboardShouldPersistTaps="handled">
        {/* Top Back Link */}
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <FontAwesome name="arrow-left" size={14} color="#94A3B8" />
          <Text style={styles.backText}>Back to Sign In</Text>
        </Pressable>

        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <View style={styles.logoBadge}>
            <FontAwesome name="user-plus" size={24} color="#38BDF8" />
          </View>
          <Text style={styles.heading}>Create your account</Text>
          <Text style={styles.subheading}>
            Join PulseFeed to save and customize your feed
          </Text>
        </View>

        {/* Error Alert Box */}
        {errorMessage ? (
          <View style={styles.errorBox}>
            <FontAwesome name="exclamation-circle" size={14} color="#EF4444" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Input Form */}
        <View style={styles.formCard}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>FULL NAME</Text>
            <View style={styles.inputWrapper}>
              <FontAwesome name="user-o" size={14} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Alex Rivera"
                placeholderTextColor="#64748B"
                value={name}
                onChangeText={(val) => {
                  setName(val);
                  setErrorMessage('');
                }}
              />
            </View>
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
            <View style={styles.inputWrapper}>
              <FontAwesome name="envelope-o" size={14} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="name@example.com"
                placeholderTextColor="#64748B"
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  setErrorMessage('');
                }}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>PASSWORD</Text>
            <View style={styles.inputWrapper}>
              <FontAwesome name="lock" size={16} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Min. 6 characters"
                placeholderTextColor="#64748B"
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  setErrorMessage('');
                }}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>CONFIRM PASSWORD</Text>
            <View style={styles.inputWrapper}>
              <FontAwesome name="lock" size={16} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Re-enter password"
                placeholderTextColor="#64748B"
                value={confirmPassword}
                onChangeText={(val) => {
                  setConfirmPassword(val);
                  setErrorMessage('');
                }}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Create Account Primary Action */}
          <Pressable
            onPress={handleRegister}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.primaryBtn,
              { opacity: pressed || isLoading ? 0.85 : 1 },
            ]}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#090D16" />
            ) : (
              <Text style={styles.primaryBtnText}>Create Account</Text>
            )}
          </Pressable>
        </View>

        {/* Footer Navigation */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable onPress={() => router.back()} hitSlop={6}>
            <Text style={styles.registerLink}>Sign In</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#121826',
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heading: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  subheading: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  formCard: {
    backgroundColor: '#121826',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 20,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#090D16',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
    width: 16,
    textAlign: 'center',
  },
  textInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 14,
  },
  primaryBtn: {
    backgroundColor: '#38BDF8',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryBtnText: {
    color: '#090D16',
    fontSize: 14,
    fontWeight: '800',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  registerLink: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '800',
  },
});
