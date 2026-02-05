// Deal Room - Chat, Tasks, Docs with Liquid Glass UI
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDealRoom } from '../../lib/hooks/useDealRoom';
import { ScreenBackground, LiquidGlassCard, LiquidGlassButton, glassTokens } from '../../src/ui';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatTab } from '../../components/ChatTab';
import { EnhancedTasksTab } from '../../components/EnhancedTasksTab';

type Tab = 'chat' | 'tasks' | 'docs';

export default function DealRoomScreen() {
  const { dealId } = useLocalSearchParams<{ dealId: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [dealRoom, setDealRoom] = useState<any>(null);
  const { fetchDealRoom } = useDealRoom();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (dealId) {
      loadDealRoom();
    }
  }, [dealId]);

  const loadDealRoom = async () => {
    try {
      const room = await fetchDealRoom(dealId);
      setDealRoom(room);
    } catch (error: any) {
      console.error('Failed to load deal room:', error);
      // Show error to user - could add error state here
      if (error.message?.includes('Access denied')) {
        // User doesn't have access, redirect back
        router.back();
      }
    }
  };

  const tabs: { id: Tab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: 'chat', label: 'Chat', icon: 'chatbubbles' },
    { id: 'tasks', label: 'Tasks', icon: 'checkmark-circle' },
    { id: 'docs', label: 'Docs', icon: 'document' },
  ];

  return (
    <ScreenBackground gradient>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 12, paddingBottom: 16 }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={28} color={glassTokens.colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Deal Room</Text>
            {dealRoom && (
              <Text style={styles.headerStatus}>{dealRoom.status?.replace('_', ' ').toUpperCase()}</Text>
            )}
          </View>
        </View>

        {/* Segmented Control */}
        <View style={[styles.segmentedControl, { paddingHorizontal: glassTokens.componentSpacing.screenPadding }]}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.8}
              style={[
                styles.tabButton,
                activeTab === tab.id && styles.tabButtonActive,
              ]}
            >
              <Ionicons
                name={tab.icon}
                size={20}
                color={
                  activeTab === tab.id
                    ? glassTokens.colors.accent.primary
                    : glassTokens.colors.text.secondary
                }
              />
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === tab.id && styles.tabLabelActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {activeTab === 'chat' && dealId && (
            <LiquidGlassCard
              cornerRadius={24}
              padding={0}
              elasticity={0.25}
              blurAmount={0.1}
              style={[styles.tabContent, { marginHorizontal: glassTokens.componentSpacing.screenPadding }]}
            >
              <ChatTab dealRoomId={dealId} />
            </LiquidGlassCard>
          )}
          {activeTab === 'tasks' && dealId && (
            <LiquidGlassCard
              cornerRadius={24}
              padding={0}
              elasticity={0.25}
              blurAmount={0.1}
              style={[styles.tabContent, { marginHorizontal: glassTokens.componentSpacing.screenPadding }]}
            >
              <EnhancedTasksTab dealRoomId={dealId} />
            </LiquidGlassCard>
          )}
          {activeTab === 'docs' && (
            <ScrollView
              contentContainerStyle={[
                styles.docsContent,
                {
                  paddingHorizontal: glassTokens.componentSpacing.screenPadding,
                  paddingBottom: insets.bottom + 40,
                }
              ]}
              showsVerticalScrollIndicator={false}
            >
              <LiquidGlassCard
                title="Documents"
                cornerRadius={24}
                padding={24}
                elasticity={0.25}
                blurAmount={0.1}
              >
                <Text style={styles.emptyText}>
                  Document management coming soon. Upload inspection reports, title documents, contracts, and more.
                </Text>
                <LiquidGlassButton
                  label="Upload Document"
                  onPress={() => {
                    // TODO: Implement document upload
                  }}
                  variant="primary"
                  size="md"
                  style={styles.uploadButton}
                />
              </LiquidGlassCard>
            </ScrollView>
          )}
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
    alignItems: 'center',
    paddingHorizontal: glassTokens.componentSpacing.screenPadding,
    gap: glassTokens.spacing.md,
  },
  backButton: {
    padding: glassTokens.spacing.xs,
    marginLeft: -glassTokens.spacing.xs,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: glassTokens.typography.fontSize['2xl'],
    fontWeight: glassTokens.typography.fontWeight.bold,
    color: glassTokens.colors.text.primary,
    letterSpacing: -0.5,
  },
  headerStatus: {
    fontSize: glassTokens.typography.fontSize.xs,
    color: glassTokens.colors.text.secondary,
    marginTop: glassTokens.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: glassTokens.typography.fontWeight.semibold,
  },
  segmentedControl: {
    flexDirection: 'row',
    paddingBottom: glassTokens.spacing.md,
    gap: glassTokens.spacing.sm,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: glassTokens.spacing.xs,
    paddingVertical: glassTokens.spacing.sm,
    paddingHorizontal: glassTokens.spacing.md,
    borderRadius: glassTokens.radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    marginBottom: glassTokens.spacing.lg,
    marginTop: glassTokens.spacing.sm,
  },
  docsContent: {
    paddingTop: glassTokens.spacing.md,
    paddingBottom: glassTokens.spacing['4xl'],
  },
  emptyText: {
    fontSize: glassTokens.typography.fontSize.base,
    color: glassTokens.colors.text.secondary,
    textAlign: 'center',
    marginBottom: glassTokens.spacing.lg,
    lineHeight: glassTokens.typography.fontSize.base * glassTokens.typography.lineHeight.relaxed,
  },
  uploadButton: {
    marginTop: glassTokens.spacing.md,
  },
});
