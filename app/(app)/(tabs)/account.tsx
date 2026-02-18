import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Alert, Platform } from 'react-native';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/lib/constants';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function AccountScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.replace('/sign-in');
    } catch {
      if (Platform.OS === 'web') {
        window.alert('Sign out failed. Please try again.');
      } else {
        Alert.alert('Error', 'Sign out failed. Please try again.');
      }
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Account</Text>

      <Card style={styles.profileCard}>
        {user?.imageUrl ? (
          <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={36} color={Colors.white} />
          </View>
        )}
        <Text style={styles.name}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={styles.email}>
          {user?.primaryEmailAddress?.emailAddress}
        </Text>
      </Card>

      <Card style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={20} color={Colors.gray} />
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {user?.primaryEmailAddress?.emailAddress}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={20} color={Colors.gray} />
          <Text style={styles.infoLabel}>Joined</Text>
          <Text style={styles.infoValue}>
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString()
              : '-'}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={Colors.gray}
          />
          <Text style={styles.infoLabel}>Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
      </Card>

      <View style={styles.signOutContainer}>
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="danger"
          loading={signingOut}
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginVertical: 16,
  },
  profileCard: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  email: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 4,
  },
  infoCard: {
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.gray,
    width: 60,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.lightGray,
  },
  signOutContainer: {
    marginTop: 8,
  },
});
