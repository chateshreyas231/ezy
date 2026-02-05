// Pro Clients / Listings Management
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenBackground, LiquidGlassCard, LiquidGlassButton, glassTokens } from '../../../src/ui';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../../lib/hooks/useAuth';

export default function ProClientsScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const [clients, setClients] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'clients' | 'listings'>('clients');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'clients') {
      loadClients();
    } else {
      loadListings();
    }
  }, [activeTab]);

  const loadClients = async () => {
    // TODO: Fetch clients (buyer_agent) or listings (seller_agent)
    setLoading(false);
  };

  const loadListings = async () => {
    // TODO: Fetch listings
    setLoading(false);
  };

  const isBuyerAgent = profile?.role === 'buyer_agent';

  return (
    <ScreenBackground gradient>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={[styles.header, { paddingTop: insets.top + 20, paddingBottom: 16 }]}>
          <Text style={styles.headerTitle}>
            {isBuyerAgent ? 'Clients' : 'Listings'}
          </Text>
          <LiquidGlassButton
            label={isBuyerAgent ? '+ Client' : '+ Listing'}
            onPress={() => {
              // TODO: Navigate to create client/listing
            }}
            variant="primary"
            size="sm"
          />
        </View>

        {/* Tab Switcher */}
        {isBuyerAgent && (
          <View style={[styles.tabSwitcher, { paddingHorizontal: glassTokens.componentSpacing.screenPadding }]}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'clients' && styles.tabButtonActive]}
              onPress={() => setActiveTab('clients')}
            >
              <Text style={[styles.tabLabel, activeTab === 'clients' && styles.tabLabelActive]}>
                Clients
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'listings' && styles.tabButtonActive]}
              onPress={() => setActiveTab('listings')}
            >
              <Text style={[styles.tabLabel, activeTab === 'listings' && styles.tabLabelActive]}>
                Listings
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.emptyContainer}>
          <LiquidGlassCard 
            title={activeTab === 'clients' ? 'No clients yet' : 'No listings yet'}
            cornerRadius={24}
            padding={24}
            elasticity={0.25}
          >
            <Text style={styles.emptyText}>
              {activeTab === 'clients' 
                ? 'Add clients to manage their buyer intents'
                : 'Create listings to connect with buyers'}
            </Text>
            <Text style={styles.todoText}>
              TODO: Implement {activeTab} list with real data
            </Text>
          </LiquidGlassCard>
        </View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: glassTokens.componentSpacing.screenPadding,
    marginBottom: glassTokens.spacing.md,
  },
  headerTitle: {
    fontSize: glassTokens.typography.fontSize['2xl'],
    fontWeight: glassTokens.typography.fontWeight.bold,
    color: glassTokens.colors.text.primary,
    letterSpacing: -0.5,
  },
  tabSwitcher: {
    flexDirection: 'row',
    gap: glassTokens.spacing.sm,
    marginBottom: glassTokens.spacing.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: glassTokens.spacing.sm,
    paddingHorizontal: glassTokens.spacing.md,
    borderRadius: glassTokens.radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: glassTokens.colors.accent.primary,
  },
  tabLabel: {
    fontSize: glassTokens.typography.fontSize.sm,
    color: glassTokens.colors.text.secondary,
    fontWeight: glassTokens.typography.fontWeight.medium,
  },
  tabLabelActive: {
    color: glassTokens.colors.accent.primary,
    fontWeight: glassTokens.typography.fontWeight.semibold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: glassTokens.componentSpacing.screenPadding,
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: glassTokens.typography.fontSize.base,
    color: glassTokens.colors.text.secondary,
    textAlign: 'center',
    marginBottom: glassTokens.spacing.md,
  },
  todoText: {
    fontSize: glassTokens.typography.fontSize.sm,
    color: glassTokens.colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

