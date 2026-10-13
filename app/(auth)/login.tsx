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

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, loginAsGuest, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignIn = async () => {
    setErrorMessage('');
    const res = await login(email, password);
    if (res.success) {
      router.replace('/(tabs)');
    } else if (res.error) {
      setErrorMessage(res.error);
    }
  };

  const handleGuestSignIn = async () => {
    setErrorMessage('');
    await loginAsGuest();
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled">
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <View style={styles.logoBadge}>
            <FontAwesome name="bolt" size={26} color="#38BDF8" />
          </View>
          <Text style={styles.heading}>Sign in to PulseFeed</Text>
          <Text style={styles.subheading}>
            Access high-velocity feeds and offline reading
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
                autoComplete="email"
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <View style={styles.passwordLabelRow}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <Pressable onPress={() => router.push('/(auth)/forgot-password' as any)} hitSlop={6}>
                <Text style={styles.forgotLink}>Forgot?</Text>
              </Pressable>
            </View>
            <View style={styles.inputWrapper}>
              <FontAwesome name="lock" size={16} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter password (min 6 chars)"
                placeholderTextColor="#64748B"
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  setErrorMessage('');
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                <FontAwesome
                  name={showPassword ? 'eye' : 'eye-slash'}
                  size={14}
                  color="#64748B"
                />
              </Pressable>
            </View>
          </View>

          {/* Sign In Primary Action */}
          <Pressable
            onPress={handleSignIn}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.primaryBtn,
              { opacity: pressed || isLoading ? 0.85 : 1 },
            ]}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#090D16" />
            ) : (
              <Text style={styles.primaryBtnText}>Sign In</Text>
            )}
          </Pressable>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Continue as Guest Button */}
          <Pressable
            onPress={handleGuestSignIn}
            style={({ pressed }) => [
              styles.guestBtn,
              { opacity: pressed ? 0.8 : 1 },
            ]}>
            <FontAwesome name="user-secret" size={14} color="#94A3B8" />
            <Text style={styles.guestBtnText}>Continue as Guest</Text>
          </Pressable>
        </View>

        {/* Footer Navigation */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Do not have an account? </Text>
          <Pressable onPress={() => router.push('/(auth)/register' as any)} hitSlop={6}>
            <Text style={styles.registerLink}>Sign Up</Text>
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
  brandHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#121826',
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heading: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
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
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  forgotLink: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
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
    marginTop: 6,
  },
  primaryBtnText: {
    color: '#090D16',
    fontSize: 14,
    fontWeight: '800',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1E293B',
  },
  dividerText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 10,
  },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#090D16',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    height: 46,
  },
  guestBtnText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '700',
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
