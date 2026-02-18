import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { useRouter, Link } from 'expo-router';
import { Colors } from '@/lib/constants';
import Button from '@/components/ui/Button';
import TextInput from '@/components/ui/TextInput';

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);

  const handleSignUp = async () => {
    if (!isLoaded) return;
    setError('');
    setLoading(true);
    try {
      await signUp.create({
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' ') || undefined,
        emailAddress: email,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      setError(err?.errors?.[0]?.message ?? 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!isLoaded) return;
    setError('');
    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(app)');
      } else {
        setError('Verification incomplete. Please try again.');
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message ?? 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.logo}>PackMate</Text>
          <Text style={styles.subtitle}>Create your account</Text>
        </View>

        <View style={styles.form}>
          {pendingVerification ? (
            <>
              <Text style={styles.verifyHint}>
                We sent a verification code to {email}
              </Text>
              <TextInput
                label="Verification Code"
                value={code}
                onChangeText={setCode}
                placeholder="Enter code"
                keyboardType="number-pad"
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Button
                title="Verify Email"
                onPress={handleVerify}
                loading={loading}
                disabled={!code}
                fullWidth
              />
            </>
          ) : (
            <>
              <TextInput
                label="Full Name"
                value={name}
                onChangeText={setName}
                placeholder="John Doe"
              />
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password"
                secureTextEntry
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Button
                title="Sign Up"
                onPress={handleSignUp}
                loading={loading}
                disabled={!name || !email || !password}
                fullWidth
              />

              <View style={styles.linkRow}>
                <Text style={styles.linkText}>Already have an account? </Text>
                <Link href="/sign-in" style={styles.link}>
                  Sign In
                </Link>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray,
  },
  form: {
    gap: 16,
  },
  verifyHint: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    marginBottom: 4,
  },
  error: {
    color: Colors.error,
    fontSize: 14,
    textAlign: 'center',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  linkText: {
    color: Colors.gray,
    fontSize: 14,
  },
  link: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
