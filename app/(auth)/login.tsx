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
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuthStore } from '../../src/stores/useAuthStore';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

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
      style={[styles.keyboardView, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled">
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <View style={[styles.logoBadge, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <FontAwesome name="bookmark" size={24} color={colors.primary} />
          </View>
          <Text style={[styles.heading, { color: colors.text }]}>Sign in to PulseFeed</Text>
          <Text style={[styles.subheading, { color: colors.textMuted }]}>
            High-signal reading, personalized to your interests
          </Text>
        </View>

        {/* Error Alert Box */}
        {errorMessage ? (
          <View style={[styles.errorBox, { backgroundColor: colors.card, borderColor: colors.bookmark }]}>
            <FontAwesome name="exclamation-circle" size={14} color={colors.bookmark} />
            <Text style={[styles.errorText, { color: colors.bookmark }]}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Input Form */}
        <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>EMAIL ADDRESS</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
              <FontAwesome name="envelope-o" size={14} color={colors.textSubtle} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                placeholder="name@example.com"
                placeholderTextColor={colors.textSubtle}
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
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>PASSWORD</Text>
              <Pressable onPress={() => router.push('/(auth)/forgot-password' as any)} hitSlop={8}>
                <Text style={[styles.forgotLink, { color: colors.primary }]}>Forgot password?</Text>
              </Pressable>
            </View>
            <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
              <FontAwesome name="lock" size={16} color={colors.textSubtle} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                placeholder="Enter password (min 6 characters)"
                placeholderTextColor={colors.textSubtle}
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  setErrorMessage('');
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={8}
                style={styles.eyeButton}>
                <FontAwesome
                  name={showPassword ? 'eye' : 'eye-slash'}
                  size={14}
                  color={colors.textSubtle}
                />
              </Pressable>
            </View>
          </View>

          {/* Submit Button */}
          <Pressable
            onPress={handleSignIn}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.88 : 1 },
            ]}>
            {isLoading ? (
              <ActivityIndicator color="#090D16" size="small" />
            ) : (
              <Text style={styles.primaryBtnText}>Sign In</Text>
            )}
          </Pressable>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.cardBorder }]} />
            <Text style={[styles.dividerText, { color: colors.textSubtle }]}>OR</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.cardBorder }]} />
          </View>

          {/* Guest One-Tap Access */}
          <Pressable
            onPress={handleGuestSignIn}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.guestBtn,
              { borderColor: colors.cardBorder, backgroundColor: colors.background, opacity: pressed ? 0.8 : 1 },
            ]}>
            <FontAwesome name="user-o" size={14} color={colors.text} style={styles.guestIcon} />
            <Text style={[styles.guestBtnText, { color: colors.text }]}>Continue as Guest</Text>
          </Pressable>
        </View>

        {/* Footer: Register Link */}
        <View style={styles.footerRow}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>New to PulseFeed?</Text>
          <Pressable onPress={() => router.push('/(auth)/register' as any)} hitSlop={8}>
            <Text style={[styles.createAccountLink, { color: colors.primary }]}>Create an account</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    justifyContent: 'center',
    flexGrow: 1,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subheading: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 280,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  formCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotLink: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 12,
  },
  eyeButton: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: {
    minHeight: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  primaryBtnText: {
    color: '#090D16',
    fontSize: 15,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 11,
    fontWeight: '600',
  },
  guestBtn: {
    flexDirection: 'row',
    minHeight: 48,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestIcon: {
    marginRight: 8,
  },
  guestBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 6,
  },
  footerText: {
    fontSize: 14,
  },
  createAccountLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});
