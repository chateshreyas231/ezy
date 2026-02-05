import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert, PanResponder, Animated } from 'react-native';
import { FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useFeed } from '../../lib/hooks/useFeed';
import { useSwipe } from '../../lib/hooks/useSwipe';
import { ListingCard } from '@shared/types';
import { SWIPE_DIRECTIONS } from '@shared/constants/swipe';
import { useAuth } from '../../lib/hooks/useAuth';
import { useTheme } from '../../lib/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Helper function to create styles with theme
const createStyles = (theme: any) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  listContent: {
    alignItems: 'center' as const,
  },
  cardContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 200,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  card: {
    width: SCREEN_WIDTH - 40,
    height: SCREEN_HEIGHT - 250,
    borderRadius: theme.borderRadius['3xl'],
    overflow: 'hidden',
    ...theme.shadows.lg,
  },
  cardBlur: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius['3xl'],
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    padding: 0,
  },
  cardContent: {
    flex: 1,
    padding: 20,
  },
  cardTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 8,
  },
  cardPrice: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: 12,
  },
  cardDetails: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  cardDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
    marginBottom: 16,
  },
  explanationBox: {
    backgroundColor: theme.colors.inputBackground,
    padding: 12,
    borderRadius: theme.borderRadius.lg,
    marginTop: 'auto' as const,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    overflow: 'hidden',
  },
  explanationText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
  },
  actionButtons: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    padding: 20,
    backgroundColor: 'transparent',
  },
  actionButton: {
    width: 120,
    height: 60,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    overflow: 'hidden',
  },
  yesButton: {
    backgroundColor: theme.colors.swipeYes,
    ...theme.shadows.md,
  },
  noButton: {
    backgroundColor: theme.colors.swipeNo,
    ...theme.shadows.md,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textSecondary,
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.lg,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});

// Separate component for swipeable card to use hooks properly
function SwipeableCard({ 
  item, 
  onSwipe 
}: { 
  item: ListingCard; 
  onSwipe: (direction: 'yes' | 'no') => void;
}) {
  const theme = useTheme();
  const cardStyles = createStyles(theme);
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // Use PanResponder for swipe gestures with React Native's Animated API
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Reset position when gesture starts
        translateX.setValue(0);
        translateY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx);
        translateY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        const swipeThreshold = SCREEN_WIDTH * 0.25;
        if (Math.abs(gestureState.dx) > swipeThreshold) {
          const direction = gestureState.dx > 0 ? 'no' : 'yes';
          onSwipe(direction);
        }
        // Animate back to center
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }),
        ]).start();
      },
    })
  ).current;

  const animatedStyle = {
    transform: [
      { translateX },
      { translateY },
      { 
        rotate: translateX.interpolate({
          inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
          outputRange: ['-30deg', '0deg', '30deg'],
        }),
      },
    ],
  };

  return (
    <View style={cardStyles.cardContainer}>
      <Animated.View 
        style={[cardStyles.card, animatedStyle]}
        {...panResponder.panHandlers}
      >
        <View
          style={cardStyles.cardBlur}
        >
          <View style={cardStyles.cardContent}>
            <Text style={cardStyles.cardTitle}>{item.listing.title}</Text>
            <Text style={cardStyles.cardPrice}>${item.listing.price.toLocaleString()}</Text>
            <Text style={cardStyles.cardDetails}>
              {item.listing.beds} bed • {item.listing.baths} bath
              {item.listing.sqft && ` • ${item.listing.sqft} sqft`}
            </Text>
            <Text style={cardStyles.cardDescription}>{item.listing.description}</Text>
            {item.explanation && (
              <View
                style={cardStyles.explanationBox}
              >
                <Text style={cardStyles.explanationText}>{item.explanation}</Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

export default function FeedScreen() {
  const theme = useTheme();
  const [cards, setCards] = useState<ListingCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { user } = useAuth();
  const { fetchFeed } = useFeed();
  const { createSwipe } = useSwipe();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      const feedCards = await fetchFeed();
      setCards(feedCards);
    } catch (error: any) {
      if (error.message?.includes('intent')) {
        router.replace('/(buyer)/intent');
      } else if (error.message?.includes('listing')) {
        router.replace('/(seller)/create-listing');
      } else {
        Alert.alert('Error', error.message || 'Failed to load feed');
      }
    }
  };

  const handleSwipe = async (direction: 'yes' | 'no') => {
    if (currentIndex >= cards.length) {
      // Load more or show empty state
      return;
    }

    const currentCard = cards[currentIndex];
    if (!currentCard) return;

    try {
      await createSwipe({
        target_type: 'listing',
        target_id: currentCard.listing.id,
        direction,
      });

      // Move to next card
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      if (nextIndex < cards.length && flatListRef.current) {
        flatListRef.current.scrollToIndex({ index: nextIndex, animated: true });
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to swipe');
    }
  };

  const renderCard = ({ item, index }: { item: ListingCard; index: number }) => {
    if (index !== currentIndex) {
      return null; // Only show current card
    }

    return <SwipeableCard item={item} onSwipe={handleSwipe} />;
  };

  const styles = createStyles(theme);

  if (cards.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No listings available</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadFeed}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={cards}
        renderItem={renderCard}
        keyExtractor={(item) => item.listing.id}
        pagingEnabled
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      <View
        style={styles.actionButtons}
      >
        <TouchableOpacity
          style={[styles.actionButton, styles.noButton]}
          onPress={() => handleSwipe('no')}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>NO</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.yesButton]}
          onPress={() => handleSwipe('yes')}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>YES</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
