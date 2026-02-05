// app/post/index.tsx
// Post creation selection screen with premium UI
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedButton from '../../components/ui/AnimatedButton';
import AnimatedCard from '../../components/ui/AnimatedCard';
import SafeScreen from '../../components/ui/SafeScreen';
import { Theme } from '../../constants/Theme';

export default function PostIndex() {
  const router = useRouter();

  return (
    <SafeScreen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Create a Post</Text>
          <Text style={styles.subtitle}>Choose the type of post you want to create</Text>
        </View>

        <View style={styles.cardsContainer}>
          <AnimatedCard delay={0} style={styles.card} onPress={() => router.push('/screens/CreateBuyerNeedScreen')}>
            <View style={styles.cardContent}>
              <View style={[styles.iconContainer, { backgroundColor: Theme.colors.accent + '20' }]}>
                <Ionicons name="search" size={32} color={Theme.colors.accent} />
              </View>
              <Text style={styles.cardTitle}>Buyer Need Post</Text>
              <Text style={styles.cardDescription}>
                Post what your buyer is looking for. We'll match them with verified listings.
              </Text>
              <View style={styles.arrowContainer}>
                <Ionicons name="arrow-forward" size={20} color={Theme.colors.accent} />
              </View>
            </View>
          </AnimatedCard>

          <AnimatedCard delay={100} style={styles.card} onPress={() => router.push('/screens/CreateListingScreen')}>
            <View style={styles.cardContent}>
              <View style={[styles.iconContainer, { backgroundColor: Theme.colors.secondary + '20' }]}>
                <Ionicons name="home" size={32} color={Theme.colors.secondary} />
              </View>
              <Text style={styles.cardTitle}>Listing Post</Text>
              <Text style={styles.cardDescription}>
                Create a new property listing. Get matched with verified buyers.
              </Text>
              <View style={styles.arrowContainer}>
                <Ionicons name="arrow-forward" size={20} color={Theme.colors.secondary} />
              </View>
            </View>
          </AnimatedCard>
        </View>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.background,
  },
  header: {
    marginBottom: Theme.spacing.xl,
    paddingTop: Theme.spacing.md,
  },
  title: {
    ...Theme.typography.h1,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
  },
  cardsContainer: {
    gap: Theme.spacing.md,
  },
  card: {
    marginBottom: 0,
  },
  cardContent: {
    padding: Theme.spacing.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.md,
  },
  cardTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.sm,
  },
  cardDescription: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.md,
    lineHeight: 22,
  },
  arrowContainer: {
    alignSelf: 'flex-end',
  },
});
