import { Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/theme';
import type { ListingWithMedia } from '../lib/types/app';
import { GlassCard } from './GlassCard';

function fmtPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

export function ListingCard({ listing }: { listing: ListingWithMedia }) {
  const media = listing.listing_media?.[0]?.storage_path;

  return (
    <GlassCard>
      {media ? <Image source={{ uri: media }} style={styles.image} /> : null}
      <View style={styles.content}>
        <Text style={styles.title}>{listing.title}</Text>
        <Text style={styles.price}>{fmtPrice(listing.price)}</Text>
        <Text style={styles.meta}>
          {listing.beds} bd • {listing.baths} ba {listing.sqft ? `• ${listing.sqft} sqft` : ''}
        </Text>
        <Text style={styles.address}>{listing.address_public || listing.property_type}</Text>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 170,
    borderRadius: 14,
  },
  content: { marginTop: 10, gap: 4 },
  title: { color: colors.text, fontSize: 16, fontWeight: '700' },
  price: { color: colors.primary, fontWeight: '800', fontSize: 18 },
  meta: { color: colors.textMuted, fontSize: 13 },
  address: { color: colors.text, fontSize: 13 },
});
