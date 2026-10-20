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

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  const { resetPassword } = useAuthStore();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleReset = async () => {
    setErrorMessage('');
    setIsLoading(true);

    const res = await resetPassword(email);
    setIsLoading(false);

    if (res.success) {
      setIsSuccess(true);
    } else if (res.error) {
      setErrorMessage(res.error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.keyboardView, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled">
        {/* Top Back Link */}
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <FontAwesome name="arrow-left" size={14} color={colors.textMuted} />
          <Text style={[styles.backText, { color: colors.textMuted }]}>Back to Sign In</Text>
        </Pressable>

        {isSuccess ? (
          /* Success State View */
          <View style={[styles.successCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[styles.successIconBadge, { backgroundColor: colors.primaryLight }]}>
              <FontAwesome name="check-circle" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.successHeading, { color: colors.text }]}>Reset Link Sent</Text>
            <Text style={[styles.successSubheading, { color: colors.textMuted }]}>
              We have dispatched a password recovery link to{' '}
              <Text style={{ color: colors.primary, fontWeight: '700' }}>{email}</Text>. Please follow the instructions to set a new password.
            </Text>

            <Pressable
              onPress={() => router.replace('/(auth)/login' as any)}
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: colors.primary, opacity: pressed ? 0.88 : 1 },
              ]}>
              <Text style={styles.primaryBtnText}>Return to Sign In</Text>
            </Pressable>
          </View>
        ) : (
          /* Form View */
          <>
            <View style={styles.brandHeader}>
              <Text style={[styles.heading, { color: colors.text }]}>Reset Password</Text>
              <Text style={[styles.subheading, { color: colors.textMuted }]}>
                Enter the email address registered with your PulseFeed account. We will send you instructions to reset your password.
              </Text>
            </View>

            {/* Error Box */}
            {errorMessage ? (
              <View style={[styles.errorBox, { backgroundColor: colors.card, borderColor: colors.bookmark }]}>
                <FontAwesome name="exclamation-circle" size={14} color={colors.bookmark} />
                <Text style={[styles.errorText, { color: colors.bookmark }]}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Input Form Card */}
            <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
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

              <Pressable
                onPress={handleReset}
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  { backgroundColor: colors.primary, opacity: pressed ? 0.88 : 1 },
                ]}>
                {isLoading ? (
                  <ActivityIndicator color="#090D16" size="small" />
                ) : (
                  <Text style={styles.primaryBtnText}>Send Recovery Link</Text>
                )}
              </Pressable>
            </View>
          </>
        )}
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
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    marginBottom: 20,
    gap: 8,
  },
  backText: {
    fontSize: 14,
    fontWeight: '500',
  },
  brandHeader: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subheading: {
    fontSize: 14,
    lineHeight: 20,
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
  primaryBtn: {
    minHeight: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#090D16',
    fontSize: 15,
    fontWeight: '700',
  },
  successCard: {
    padding: 28,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  successIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  successHeading: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  successSubheading: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 12,
  },
});
