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

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled">
        {/* Top Back Link */}
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <FontAwesome name="arrow-left" size={14} color="#94A3B8" />
          <Text style={styles.backText}>Back to Sign In</Text>
        </Pressable>

        {isSuccess ? (
          /* Success State View */
          <View style={styles.successCard}>
            <View style={styles.successIconBox}>
              <FontAwesome name="check-circle" size={32} color="#10B981" />
            </View>
            <Text style={styles.heading}>Instructions Sent</Text>
            <Text style={styles.subheading}>
              We sent password recovery instructions to {email}. Please check your inbox.
            </Text>
            <Pressable
              onPress={() => router.replace('/(auth)/login' as any)}
              style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Return to Sign In</Text>
            </Pressable>
          </View>
        ) : (
          /* Form View */
          <>
            <View style={styles.brandHeader}>
              <View style={styles.logoBadge}>
                <FontAwesome name="key" size={24} color="#38BDF8" />
              </View>
              <Text style={styles.heading}>Reset Password</Text>
              <Text style={styles.subheading}>
                Enter your registered email address and we will send you a recovery link
              </Text>
            </View>

            {errorMessage ? (
              <View style={styles.errorBox}>
                <FontAwesome name="exclamation-circle" size={14} color="#EF4444" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <View style={styles.formCard}>
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
                    autoFocus
                  />
                </View>
              </View>

              <Pressable
                onPress={handleReset}
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  { opacity: pressed || isLoading ? 0.85 : 1 },
                ]}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#090D16" />
                ) : (
                  <Text style={styles.primaryBtnText}>Send Reset Link</Text>
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
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  backText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
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
    textAlign: 'center',
  },
  subheading: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
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
  },
  primaryBtnText: {
    color: '#090D16',
    fontSize: 14,
    fontWeight: '800',
  },
  successCard: {
    backgroundColor: '#121826',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 24,
    alignItems: 'center',
  },
  successIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
});
