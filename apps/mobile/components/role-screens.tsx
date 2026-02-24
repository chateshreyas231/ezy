import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '../constants/theme';
import * as authApi from '../lib/api/auth';
import * as dataApi from '../lib/api/data';
import { useAuth } from '../lib/hooks/useAuth';
import type { LoginPortal } from '../lib/types/app';
import { AppButton } from './AppButton';
import { AppScreen } from './AppScreen';
import { EmptyState } from './EmptyState';
import { GlassCard } from './GlassCard';
import { ListingCard } from './ListingCard';
import { SectionHeader } from './SectionHeader';
import { TextInputField } from './TextInputField';

function portalLabel(portal: LoginPortal) {
  if (portal === 'agent') return 'Agent';
  if (portal === 'broker_vendor') return 'Broker/Vendor';
  return 'Client';
}

export function AiScreen({ portal }: { portal: LoginPortal }) {
  const { profile } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  async function onAsk() {
    try {
      setLoading(true);
      const summary = await dataApi.getAiSummary(prompt || 'Give me a short market update', 'assistant');
      setResponse(summary || 'No response from AI service.');
    } catch (e: any) {
      Alert.alert('AI request failed', e.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppScreen>
      <SectionHeader
        title="AI Workspace"
        subtitle={`${portalLabel(portal)} assistant for deals, listings, and client coordination`}
      />

      <GlassCard>
        <Text style={styles.kicker}>AI-FIRST COMMAND CENTER</Text>
        <Text style={styles.headline}>What should Ezriya AI draft for you right now?</Text>
        <TextInput
          value={prompt}
          onChangeText={setPrompt}
          placeholder="Summarize listing objections and generate response..."
          placeholderTextColor={colors.textMuted}
          multiline
          style={styles.aiInput}
        />
        <AppButton label="Run AI" onPress={onAsk} loading={loading} />
      </GlassCard>

      <GlassCard>
        <Text style={styles.sectionTitle}>Response</Text>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Text style={styles.body}>{response || 'AI responses will appear here.'}</Text>
        )}
      </GlassCard>

      <GlassCard>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={{ gap: 8 }}>
          <Pressable style={styles.quickAction} onPress={() => setPrompt('Summarize my current matches and next 3 actions.') }>
            <Text style={styles.quickActionText}>Daily match summary</Text>
          </Pressable>
          <Pressable style={styles.quickAction} onPress={() => setPrompt('Draft a professional update message for clients about timelines.') }>
            <Text style={styles.quickActionText}>Client status update</Text>
          </Pressable>
          <Pressable style={styles.quickAction} onPress={() => setPrompt('Generate a 7-step deal room checklist for closing week.') }>
            <Text style={styles.quickActionText}>Closing checklist</Text>
          </Pressable>
        </View>
        <Text style={styles.small}>Signed in as {profile?.display_name || profile?.id}</Text>
      </GlassCard>
    </AppScreen>
  );
}

export function ListingsScreen({ portal }: { portal: LoginPortal }) {
  const { profile } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = portal === 'client' ? await dataApi.fetchActiveListings() : await dataApi.fetchMyListings(profile?.id || '');
        if (mounted) setItems(data);
      } catch (e: any) {
        Alert.alert('Load failed', e.message || 'Could not fetch listings');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (profile?.id) {
      void load();
    }

    return () => {
      mounted = false;
    };
  }, [portal, profile?.id]);

  return (
    <AppScreen>
      <SectionHeader
        title={portal === 'client' ? 'Property Listings' : 'My Listings'}
        subtitle={portal === 'client' ? 'Explore active inventory' : 'Manage your active and draft inventory'}
      />

      {portal !== 'client' ? (
        <GlassCard>
          <AppButton label="Create Listing" onPress={() => router.push('/(app)/shared/new-listing')} />
        </GlassCard>
      ) : null}

      {loading ? <ActivityIndicator color={colors.primary} /> : null}

      {!loading && items.length === 0 ? (
        <EmptyState title="No listings found" subtitle="Create a listing or adjust access permissions." />
      ) : null}

      {items.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </AppScreen>
  );
}

export function MatchesScreen({ portal }: { portal: LoginPortal }) {
  const { profile } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!profile?.id) return;
      try {
        setLoading(true);
        const [m, r] = await Promise.all([
          dataApi.fetchMyMatches(profile.id),
          dataApi.fetchDealRoomsForProfile(profile.id),
        ]);
        if (mounted) {
          setMatches(m);
          setRooms(r);
        }
      } catch (e: any) {
        Alert.alert('Load failed', e.message || 'Could not fetch match data');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, [profile?.id]);

  const roomByMatch = useMemo(() => {
    const map = new Map<string, any>();
    rooms.forEach((r) => map.set(r.match_id, r));
    return map;
  }, [rooms]);

  return (
    <AppScreen>
      <SectionHeader
        title="Matches & Deal Rooms"
        subtitle={`${portalLabel(portal)} workflow across match, chat, and tasks`}
      />
      {loading ? <ActivityIndicator color={colors.primary} /> : null}

      {!loading && matches.length === 0 ? (
        <EmptyState title="No matches yet" subtitle="Matches appear when both sides accept." />
      ) : null}

      {matches.map((match) => {
        const room = roomByMatch.get(match.id);
        return (
          <GlassCard key={match.id}>
            <Text style={styles.sectionTitle}>{match.listing?.title || 'Listing'}</Text>
            <Text style={styles.body}>Score: {Math.round((match.match_score || 0) * 100)}%</Text>
            <Text style={styles.bodyMuted}>{match.explanation || 'Mutual acceptance'}</Text>
            {room ? (
              <AppButton
                label="Open Deal Room"
                onPress={() => router.push({ pathname: '/(app)/shared/deal-room/[id]', params: { id: room.id } })}
              />
            ) : (
              <Text style={styles.small}>Deal room provisioning in progress...</Text>
            )}
          </GlassCard>
        );
      })}
    </AppScreen>
  );
}

function DirectoryBlock({ title, data }: { title: string; data: Array<Record<string, any>> }) {
  return (
    <GlassCard>
      <Text style={styles.sectionTitle}>{title}</Text>
      {data.map((item) => (
        <View key={item.id} style={styles.rowItem}>
          <Text style={styles.rowTitle}>{item.display_name || 'Unnamed user'}</Text>
          <Text style={styles.rowSubtitle}>
            {item.role} • Verification L{item.verification_level}
          </Text>
        </View>
      ))}
    </GlassCard>
  );
}

export function NetworkScreen() {
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [brokersVendors, setBrokersVendors] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        const data = await dataApi.fetchDirectory();
        if (!mounted) return;
        setAgents(data.agents);
        setClients(data.clients);
        setBrokersVendors(data.brokersVendors);
      } catch (e: any) {
        Alert.alert('Directory failed', e.message || 'Could not load directory.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AppScreen>
      <SectionHeader
        title="Network"
        subtitle="Agents, clients, brokers, and vendors in one unified directory"
      />
      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {!loading && agents.length === 0 && clients.length === 0 && brokersVendors.length === 0 ? (
        <EmptyState title="No directory data" subtitle="Profiles will appear here after user onboarding." />
      ) : null}
      {agents.length > 0 ? <DirectoryBlock title="Agents" data={agents} /> : null}
      {clients.length > 0 ? <DirectoryBlock title="Clients" data={clients} /> : null}
      {brokersVendors.length > 0 ? <DirectoryBlock title="Brokers / Vendors" data={brokersVendors} /> : null}
    </AppScreen>
  );
}

export function ProfileScreen({ portal }: { portal: LoginPortal }) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);

  async function onLogout() {
    try {
      setLoading(true);
      await authApi.signOut();
      router.replace('/(auth)/select-role');
    } catch (e: any) {
      Alert.alert('Logout failed', e.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppScreen>
      <SectionHeader title="Profile & Settings" subtitle="Account, security, and role settings" />
      <GlassCard>
        <Text style={styles.sectionTitle}>{profile?.display_name || 'User'}</Text>
        <Text style={styles.bodyMuted}>Portal: {portalLabel(portal)}</Text>
        <Text style={styles.bodyMuted}>DB Role: {profile?.role || 'unknown'}</Text>
        <Text style={styles.bodyMuted}>Verification: L{profile?.verification_level ?? 0}</Text>
        <Text style={styles.bodyMuted}>Buyer Verified: {profile?.buyer_verified ? 'Yes' : 'No'}</Text>
        <Text style={styles.bodyMuted}>Seller Verified: {profile?.seller_verified ? 'Yes' : 'No'}</Text>
        <Text style={styles.bodyMuted}>Readiness Score: {profile?.readiness_score ?? 0}</Text>
      </GlassCard>
      <GlassCard>
        <AppButton label="Reset Password" onPress={() => router.push('/(auth)/reset-password')} variant="secondary" />
      </GlassCard>
      <GlassCard>
        <AppButton label="Sign Out" onPress={onLogout} variant="danger" loading={loading} />
      </GlassCard>
    </AppScreen>
  );
}

export function NewListingScreen() {
  const { profile } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('');
  const [beds, setBeds] = useState('3');
  const [baths, setBaths] = useState('2');
  const [propertyType, setPropertyType] = useState('House');
  const [features, setFeatures] = useState('Garage, Backyard');
  const [loading, setLoading] = useState(false);

  async function onCreate() {
    if (!profile?.id) return;
    try {
      setLoading(true);
      await dataApi.createListing({
        sellerId: profile.id,
        title,
        description,
        addressPublic: address,
        price: Number(price) || 0,
        beds: Number(beds) || 0,
        baths: Number(baths) || 0,
        propertyType,
        features: features
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean),
        status: 'draft',
      });
      Alert.alert('Listing created', 'Draft listing saved successfully.');
      router.back();
    } catch (e: any) {
      Alert.alert('Create failed', e.message || 'Could not create listing.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppScreen>
      <SectionHeader title="Create Listing" subtitle="Broker, agent, and vendor support flow" />
      <GlassCard>
        <View style={{ gap: 10 }}>
          <TextInputField label="Title" value={title} onChangeText={setTitle} placeholder="Modern 4BR in Austin" />
          <TextInputField label="Description" value={description} onChangeText={setDescription} placeholder="Short property summary" />
          <TextInputField label="Public Address" value={address} onChangeText={setAddress} placeholder="Street, City" />
          <TextInputField label="Price" value={price} onChangeText={setPrice} keyboardType="numeric" />
          <TextInputField label="Beds" value={beds} onChangeText={setBeds} keyboardType="numeric" />
          <TextInputField label="Baths" value={baths} onChangeText={setBaths} keyboardType="numeric" />
          <TextInputField label="Property Type" value={propertyType} onChangeText={setPropertyType} />
          <TextInputField label="Features (comma separated)" value={features} onChangeText={setFeatures} />
          <AppButton label="Save Draft" onPress={onCreate} loading={loading} />
        </View>
      </GlassCard>
    </AppScreen>
  );
}

export function DealRoomScreen({ roomId }: { roomId: string }) {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [composer, setComposer] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        const [taskRows, convo] = await Promise.all([dataApi.fetchTasks(roomId), dataApi.fetchConversation(roomId)]);

        if (!mounted) return;

        setTasks(taskRows);
        setConversationId(convo?.id || null);

        if (convo?.id) {
          const msgRows = await dataApi.fetchMessages(convo.id);
          if (mounted) setMessages(msgRows);
        }
      } catch (e: any) {
        Alert.alert('Deal room error', e.message || 'Could not load deal room.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [roomId]);

  async function changeTask(taskId: string, status: 'todo' | 'doing' | 'done') {
    try {
      await dataApi.updateTaskStatus(taskId, status);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
    } catch (e: any) {
      Alert.alert('Task update failed', e.message || 'Could not update task.');
    }
  }

  async function onSend() {
    if (!conversationId || !profile?.id || !composer.trim()) return;
    try {
      await dataApi.sendMessage(conversationId, profile.id, composer.trim());
      const msgRows = await dataApi.fetchMessages(conversationId);
      setMessages(msgRows);
      setComposer('');
    } catch (e: any) {
      Alert.alert('Send failed', e.message || 'Could not send message.');
    }
  }

  return (
    <AppScreen>
      <SectionHeader title="Deal Room" subtitle={`Room ${roomId.slice(0, 8)}...`} />

      <GlassCard>
        <Text style={styles.sectionTitle}>Task Board</Text>
        {loading ? <ActivityIndicator color={colors.primary} /> : null}
        {!loading && tasks.length === 0 ? (
          <Text style={styles.bodyMuted}>No tasks found for this room.</Text>
        ) : null}
        {tasks.map((task) => (
          <View key={task.id} style={styles.taskRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{task.title}</Text>
              <Text style={styles.rowSubtitle}>{task.status}</Text>
            </View>
            <View style={styles.taskButtons}>
              <Pressable style={styles.pill} onPress={() => changeTask(task.id, 'todo')}>
                <Text style={styles.pillText}>Todo</Text>
              </Pressable>
              <Pressable style={styles.pill} onPress={() => changeTask(task.id, 'doing')}>
                <Text style={styles.pillText}>Doing</Text>
              </Pressable>
              <Pressable style={styles.pill} onPress={() => changeTask(task.id, 'done')}>
                <Text style={styles.pillText}>Done</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </GlassCard>

      <GlassCard>
        <Text style={styles.sectionTitle}>Chat</Text>
        {!conversationId ? <Text style={styles.bodyMuted}>No conversation for this room yet.</Text> : null}
        {messages.map((m) => (
          <View key={m.id} style={styles.messageBubble}>
            <Text style={styles.rowSubtitle}>{m.sender_profile_id.slice(0, 8)}</Text>
            <Text style={styles.body}>{m.content}</Text>
          </View>
        ))}
        {conversationId ? (
          <View style={{ gap: 8, marginTop: 8 }}>
            <TextInput
              value={composer}
              onChangeText={setComposer}
              placeholder="Send message"
              placeholderTextColor={colors.textMuted}
              style={styles.messageInput}
            />
            <AppButton label="Send" onPress={onSend} />
          </View>
        ) : null}
      </GlassCard>
    </AppScreen>
  );
}

export function tabIcon(name: keyof typeof Ionicons.glyphMap) {
  return ({ color, size }: { color: string; size: number }) => (
    <Ionicons name={name} color={color} size={size} />
  );
}

const styles = StyleSheet.create({
  kicker: {
    color: colors.warning,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.9,
  },
  headline: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 10,
  },
  aiInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    minHeight: 92,
    color: colors.text,
    backgroundColor: colors.cardStrong,
    padding: 12,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  body: { color: colors.text, fontSize: 14 },
  bodyMuted: { color: colors.textMuted, fontSize: 13 },
  quickAction: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardStrong,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  quickActionText: { color: colors.text, fontWeight: '600' },
  small: { color: colors.textMuted, fontSize: 12, marginTop: 8 },
  rowItem: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    marginTop: 10,
    gap: 2,
  },
  rowTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
  rowSubtitle: { color: colors.textMuted, fontSize: 12 },
  taskRow: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 10,
    gap: 8,
  },
  taskButtons: { flexDirection: 'row', gap: 8 },
  pill: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: colors.card,
  },
  pillText: { color: colors.text, fontSize: 12, fontWeight: '600' },
  messageBubble: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
    backgroundColor: colors.cardStrong,
    gap: 4,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.card,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
