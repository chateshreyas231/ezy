// app/screens/ProfileScreen.tsx
// User profile with role/state selection
import React, { useState } from 'react';
import { Alert, Button, ScrollView, Text, TextInput, View } from 'react-native';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import { updateUser, upsertUser } from '../../services/userService';
import type { Role } from '../../src/types/types';

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

const ROLES: Role[] = [
  'buyerAgent',
  'listingAgent',
  'selfRepresentedAgent',
  'fsboSeller',
  'buyer',
  'seller',
  'vendor',
  'vendorAttorney',
  'teamLead',
];

export default function ProfileScreen() {
  const { user, loading, refreshUser } = useUser();
  const { user: authUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [role, setRole] = useState<Role>(user?.role ?? 'buyer');
  const [state, setState] = useState(user?.state ?? '');
  const [isVerifiedAgent, setIsVerifiedAgent] = useState(user?.is_verified_agent ?? false);

  React.useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setPhone(user.phone ?? '');
      setRole(user.role);
      setState(user.state ?? '');
      setIsVerifiedAgent(user.is_verified_agent);
    }
  }, [user]);

  const handleSave = async () => {
    if (!authUser) {
      Alert.alert('Error', 'Not authenticated');
      return;
    }

    try {
      setSaving(true);

      if (user) {
        await updateUser({
          name: name || null,
          phone: phone || null,
          role,
          state: state || null,
          is_verified_agent: isVerifiedAgent,
        });
      } else {
        await upsertUser({
          email: authUser.email ?? undefined,
          name: name || undefined,
          phone: phone || undefined,
          role,
          state: state || undefined,
          is_verified_agent: isVerifiedAgent,
        });
      }

      await refreshUser();
      Alert.alert('Success', 'Profile updated');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: '600', marginBottom: 20 }}>Profile</Text>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ marginBottom: 8, fontWeight: '500' }}>Email</Text>
        <Text style={{ padding: 12, backgroundColor: '#f0f0f0', borderRadius: 8 }}>
          {authUser?.email ?? 'N/A'}
        </Text>
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ marginBottom: 8, fontWeight: '500' }}>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          style={{ borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8 }}
        />
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ marginBottom: 8, fontWeight: '500' }}>Phone</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone number"
          keyboardType="phone-pad"
          style={{ borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8 }}
        />
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ marginBottom: 8, fontWeight: '500' }}>Role</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {ROLES.map((r) => (
            <Button
              key={r}
              title={r}
              onPress={() => setRole(r)}
              color={role === r ? '#007AFF' : '#ccc'}
            />
          ))}
        </ScrollView>
        <Text style={{ marginTop: 8, fontSize: 12, color: '#666' }}>Selected: {role}</Text>
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ marginBottom: 8, fontWeight: '500' }}>State</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {US_STATES.map((s) => (
            <Button
              key={s}
              title={s}
              onPress={() => setState(s)}
              color={state === s ? '#007AFF' : '#ccc'}
            />
          ))}
        </ScrollView>
        <Text style={{ marginTop: 8, fontSize: 12, color: '#666' }}>Selected: {state || 'None'}</Text>
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ marginBottom: 8, fontWeight: '500' }}>Verified Agent</Text>
        <Button
          title={isVerifiedAgent ? 'Verified ✓' : 'Not Verified'}
          onPress={() => setIsVerifiedAgent(!isVerifiedAgent)}
          color={isVerifiedAgent ? '#4CAF50' : '#ccc'}
        />
      </View>

      <Button
        title={saving ? 'Saving...' : 'Save Profile'}
        onPress={handleSave}
        disabled={saving}
      />
    </ScrollView>
  );
}

