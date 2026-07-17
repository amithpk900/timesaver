import { useEffect, useState } from 'react';
import { Platform, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createSupabaseClient, verifySupabaseConnection, APP_NAME } from '@karnataka-study-app/shared';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function HomeScreen() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Initializing Supabase...');

  useEffect(() => {
    async function checkConnection() {
      // In Expo, EXPO_PUBLIC_ prefix is used for environment variables
      const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

      if (!url || !key) {
        setStatus('error');
        setMessage('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in mobile environment variables.');
        return;
      }

      try {
        const supabaseClient = createSupabaseClient(url, key);
        const result = await verifySupabaseConnection(supabaseClient);

        if (result.success) {
          setStatus('connected');
          setMessage(result.message);
        } else {
          setStatus('error');
          setMessage(result.message);
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err?.message || 'An unexpected error occurred during connection test.');
      }
    }

    checkConnection();
  }, []);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.heroSection}>
          <ThemedText type="small" style={styles.badge}>Mobile Client</ThemedText>
          <ThemedText type="title" style={styles.title}>
            {APP_NAME}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Expo Router & Supabase Pipeline Verification
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
            Connection Status
          </ThemedText>

          {status === 'loading' && (
            <ThemedView style={styles.statusRow}>
              <ActivityIndicator size="small" color="#6366f1" />
              <ThemedText style={styles.statusText}>Testing connection...</ThemedText>
            </ThemedView>
          )}

          {status === 'connected' && (
            <ThemedView style={styles.statusRow}>
              <ThemedText type="defaultSemiBold" style={styles.successText}>
                Connected to Supabase ✅
              </ThemedText>
              <ThemedText style={styles.messageText}>
                {message}
              </ThemedText>
            </ThemedView>
          )}

          {status === 'error' && (
            <ThemedView style={styles.statusRow}>
              <ThemedText type="defaultSemiBold" style={styles.errorText}>
                Supabase Connection Failed ❌
              </ThemedText>
              <ThemedView style={styles.errorContainer}>
                <ThemedText type="code" style={styles.errorLog}>
                  {message}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          )}
        </ThemedView>

        <ThemedView style={styles.footer}>
          <ThemedText type="small" style={styles.footerText}>
            Platform: {Platform.OS}
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: Spacing.two,
    width: '100%',
  },
  badge: {
    color: '#818cf8',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 14,
  },
  card: {
    width: '100%',
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  cardTitle: {
    fontSize: 16,
    color: '#e2e8f0',
  },
  statusRow: {
    gap: Spacing.two,
  },
  statusText: {
    color: '#818cf8',
    fontSize: 14,
  },
  successText: {
    color: '#34d399',
    fontSize: 16,
  },
  errorText: {
    color: '#f87171',
    fontSize: 16,
  },
  messageText: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
  },
  errorContainer: {
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    borderRadius: Spacing.two,
    padding: Spacing.three,
    marginTop: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.2)',
  },
  errorLog: {
    color: '#fca5a5',
    fontSize: 11,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  footerText: {
    color: '#64748b',
  },
});
