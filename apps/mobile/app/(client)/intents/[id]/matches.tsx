import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import { GradientBackground } from '../../../../components/glass/GradientBackground';
import { GlassHeader } from '../../../../components/glass/GlassHeader';
import { GlassCard } from '../../../../components/glass/GlassCard';
import { GlassButton } from '../../../../components/glass/GlassButton';
import { useIntentMatches, IntentMatchListing, IntentMatchMedia } from '../../../../lib/hooks/useIntentMatches';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200';

type ViewMode = 'cards' | 'reels';

function VideoReel({ uri, isActive }: { uri: string; isActive: boolean }) {
  const player = useVideoPlayer({ uri }, (videoPlayer) => {
    videoPlayer.loop = true;
    videoPlayer.muted = true;
  });

  useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, player]);

  return <VideoView player={player} contentFit="cover" nativeControls={false} style={{ flex: 1 }} />;
}

function ReelMedia({
  media,
  isActive,
}: {
  media: IntentMatchMedia | null;
  isActive: boolean;
}) {
  if (!media) {
    return <ExpoImage source={{ uri: FALLBACK_IMAGE }} style={{ flex: 1 }} contentFit="cover" />;
  }

  if (media.type === 'video') {
    return <VideoReel uri={media.uri} isActive={isActive} />;
  }

  return <ExpoImage source={{ uri: media.uri }} style={{ flex: 1 }} contentFit="cover" />;
}

export default function IntentMatches() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { fetchIntentMatches } = useIntentMatches();

  const [mode, setMode] = useState<ViewMode>('cards');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<IntentMatchListing[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<IntentMatchListing | null>(null);
  const [intentSummary, setIntentSummary] = useState<{
    budget_min: number;
    budget_max: number;
    beds_min: number;
    baths_min: number;
    property_types: string[];
  } | null>(null);
  const [activeReelIndex, setActiveReelIndex] = useState(0);

  const reelHeight = Math.max(460, SCREEN_HEIGHT - insets.top - 180);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const result = await fetchIntentMatches(id);
        if (!mounted) return;
        setMatches(result.matches);
        setIntentSummary(result.intent);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || 'Unable to load matches');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [fetchIntentMatches, id]);

  const cardsData = useMemo(() => matches, [matches]);

  const getPrimaryImage = useCallback((match: IntentMatchListing) => {
    const imageMedia = match.media.find((item) => item.type === 'image');
    return imageMedia?.uri || match.media[0]?.uri || FALLBACK_IMAGE;
  }, []);

  const getReelMedia = useCallback((match: IntentMatchListing) => {
    const video = match.media.find((item) => item.type === 'video');
    if (video) return video;
    const image = match.media.find((item) => item.type === 'image');
    return image || null;
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: { index: number | null }[] }) => {
    const firstVisibleIndex = viewableItems[0]?.index;
    if (typeof firstVisibleIndex === 'number') {
      setActiveReelIndex(firstVisibleIndex);
    }
  }).current;

  const reelViewabilityConfig = useRef({ itemVisiblePercentThreshold: 70 }).current;

  return (
    <GradientBackground>
      <GlassHeader title="View Matches" showBack />

      <View style={{ paddingTop: insets.top + 60, flex: 1 }}>
        <View className="px-4 mb-4">
          <GlassCard className="mb-4">
            <Text className="text-white font-semibold text-base mb-2">Buying Intent {id}</Text>
            <View className="flex-row flex-wrap">
              <Text className="text-white/70 mr-4">
                Budget: $
                {intentSummary?.budget_min ? `${intentSummary.budget_min.toLocaleString()}` : 'Any'} - $
                {intentSummary?.budget_max ? `${intentSummary.budget_max.toLocaleString()}` : 'Any'}
              </Text>
              <Text className="text-white/70 mr-4">Beds: {intentSummary?.beds_min || 0}+</Text>
              <Text className="text-white/70">Baths: {intentSummary?.baths_min || 0}+</Text>
            </View>
            <Text className="text-ezriya-blue mt-3">{matches.length} listing matches found</Text>
          </GlassCard>

          <View className="flex-row">
            <GlassButton
              title="Cards"
              size="sm"
              variant={mode === 'cards' ? 'primary' : 'glass'}
              className="mr-2"
              onPress={() => setMode('cards')}
              icon={<Ionicons name="grid-outline" size={14} color="white" style={{ marginRight: 8 }} />}
            />
            <GlassButton
              title="Reels"
              size="sm"
              variant={mode === 'reels' ? 'primary' : 'glass'}
              onPress={() => setMode('reels')}
              icon={<Ionicons name="play-circle-outline" size={14} color="white" style={{ marginRight: 8 }} />}
            />
          </View>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#2F5CFF" size="large" />
            <Text className="text-white/60 mt-3">Loading your matches...</Text>
          </View>
        ) : error ? (
          <View className="px-4">
            <GlassCard>
              <Text className="text-red-300 mb-3">{error}</Text>
              <GlassButton
                title="Try Again"
                onPress={async () => {
                  if (!id) return;
                  setLoading(true);
                  setError(null);
                  try {
                    const result = await fetchIntentMatches(id);
                    setMatches(result.matches);
                    setIntentSummary(result.intent);
                  } catch (err: any) {
                    setError(err?.message || 'Unable to load matches');
                  } finally {
                    setLoading(false);
                  }
                }}
              />
            </GlassCard>
          </View>
        ) : matches.length === 0 ? (
          <View className="px-4">
            <GlassCard className="items-center py-8">
              <Ionicons name="home-outline" size={30} color="rgba(255,255,255,0.7)" />
              <Text className="text-white text-base mt-3">No matches yet</Text>
              <Text className="text-white/60 text-center mt-2">
                We are still finding listings that fit your buying intent.
              </Text>
              <GlassButton title="Back to Intent" className="mt-5" onPress={() => router.back()} />
            </GlassCard>
          </View>
        ) : mode === 'cards' ? (
          <FlatList
            data={cardsData}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140 }}
            renderItem={({ item }) => (
              <TouchableOpacity activeOpacity={0.92} onPress={() => setSelectedMatch(item)}>
                <GlassCard className="mb-4 p-0 overflow-hidden">
                  <View className="h-52 w-full relative">
                    <ExpoImage source={{ uri: getPrimaryImage(item) }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                    <View className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 border border-white/20">
                      <Text className="text-white text-xs font-semibold">{item.score}% match</Text>
                    </View>
                  </View>

                  <View className="p-4">
                    <View className="flex-row items-start justify-between mb-2">
                      <View className="flex-1 pr-3">
                        <Text className="text-white text-lg font-semibold">{item.title}</Text>
                        <Text className="text-white/60 mt-1">{item.address}</Text>
                      </View>
                      <Text className="text-ezriya-blue text-lg font-bold">${item.price.toLocaleString()}</Text>
                    </View>

                    <View className="flex-row items-center mb-3">
                      <Text className="text-white/70 mr-3">{item.beds} bd</Text>
                      <Text className="text-white/70 mr-3">{item.baths} ba</Text>
                      {item.sqft ? <Text className="text-white/70">{item.sqft.toLocaleString()} sqft</Text> : null}
                    </View>

                    <View className="flex-row">
                      <Ionicons name="sparkles" size={16} color="#2F5CFF" style={{ marginTop: 2, marginRight: 8 }} />
                      <Text className="text-white/80 flex-1 leading-5">{item.reason}</Text>
                    </View>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            )}
          />
        ) : (
          <FlatList
            data={matches}
            keyExtractor={(item) => item.id}
            pagingEnabled
            decelerationRate="fast"
            snapToAlignment="start"
            showsVerticalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={reelViewabilityConfig}
            contentContainerStyle={{ paddingBottom: 140 }}
            renderItem={({ item, index }) => (
              <View style={{ height: reelHeight, marginHorizontal: 16, marginBottom: 12, borderRadius: 18, overflow: 'hidden' }}>
                <ReelMedia media={getReelMedia(item)} isActive={index === activeReelIndex} />
                <LinearGradient
                  colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.75)']}
                  style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16 }}
                >
                  <Text className="text-white text-xl font-semibold">{item.title}</Text>
                  <Text className="text-white/80">{item.address}</Text>
                  <Text className="text-ezriya-blue text-lg font-bold mt-2">${item.price.toLocaleString()}</Text>
                  <Text className="text-white/85 mt-2">{item.reason}</Text>

                  <View className="flex-row mt-4">
                    <GlassButton
                      title="Open Details"
                      size="sm"
                      className="mr-2"
                      onPress={() => setSelectedMatch(item)}
                    />
                    <GlassButton
                      title="Deal Room"
                      size="sm"
                      variant="glass"
                      onPress={() => {
                        if (item.dealRoomId) {
                          router.push(`/(client)/deals/${item.dealRoomId}`);
                        }
                      }}
                    />
                  </View>
                </LinearGradient>
              </View>
            )}
          />
        )}
      </View>

      <Modal
        visible={!!selectedMatch}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedMatch(null)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setSelectedMatch(null)}
        >
          <Pressable
            className="rounded-t-3xl overflow-hidden"
            onPress={() => {}}
          >
            <GradientBackground variant="dark">
              <View style={{ paddingTop: 22, paddingBottom: insets.bottom + 16 }} className="px-4">
                {selectedMatch ? (
                  <>
                    <View className="w-full h-52 rounded-2xl overflow-hidden mb-4">
                      <ExpoImage
                        source={{ uri: getPrimaryImage(selectedMatch) }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                      />
                    </View>

                    <View className="flex-row items-center justify-between">
                      <Text className="text-white text-xl font-semibold flex-1 pr-4">{selectedMatch.title}</Text>
                      <Text className="text-ezriya-blue text-lg font-bold">
                        ${selectedMatch.price.toLocaleString()}
                      </Text>
                    </View>

                    <Text className="text-white/65 mt-1">{selectedMatch.address}</Text>

                    <View className="flex-row mt-3">
                      <View className="px-3 py-1 rounded-full bg-white/10 mr-2">
                        <Text className="text-white/85">{selectedMatch.beds} bd</Text>
                      </View>
                      <View className="px-3 py-1 rounded-full bg-white/10 mr-2">
                        <Text className="text-white/85">{selectedMatch.baths} ba</Text>
                      </View>
                      <View className="px-3 py-1 rounded-full bg-ezriya-blue/25 border border-ezriya-blue/40">
                        <Text className="text-ezriya-blue font-medium">{selectedMatch.score}% match</Text>
                      </View>
                    </View>

                    <GlassCard className="mt-4">
                      <View className="flex-row">
                        <Ionicons name="sparkles" size={16} color="#2F5CFF" style={{ marginTop: 2, marginRight: 8 }} />
                        <Text className="text-white/85 flex-1 leading-5">{selectedMatch.reason}</Text>
                      </View>
                    </GlassCard>

                    <View className="flex-row mt-4">
                      <GlassButton
                        title="Close"
                        variant="glass"
                        className="flex-1 mr-2"
                        onPress={() => setSelectedMatch(null)}
                      />
                      <GlassButton
                        title="Open Deal Room"
                        className="flex-1 ml-2"
                        onPress={() => {
                          if (selectedMatch.dealRoomId) {
                            setSelectedMatch(null);
                            router.push(`/(client)/deals/${selectedMatch.dealRoomId}`);
                          }
                        }}
                      />
                    </View>
                  </>
                ) : null}
              </View>
            </GradientBackground>
          </Pressable>
        </Pressable>
      </Modal>
    </GradientBackground>
  );
}
