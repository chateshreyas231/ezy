// ReelsPlayer - TikTok/Instagram-style video/image player
import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Image } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { glassTokens } from './tokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MediaItem {
  id: string;
  uri: string;
  type: 'video' | 'image';
  thumbnail?: string;
}

interface ReelsPlayerProps {
  media: MediaItem[];
  autoPlay?: boolean;
  onMediaChange?: (index: number) => void;
}

export const ReelsPlayer: React.FC<ReelsPlayerProps> = ({
  media,
  autoPlay = true,
  onMediaChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const videoRefs = useRef<{ [key: string]: Video | null }>({});

  const currentMedia = media[currentIndex];

  useEffect(() => {
    // Auto-play current video
    if (currentMedia?.type === 'video' && isPlaying) {
      const videoRef = videoRefs.current[currentMedia.id];
      if (videoRef) {
        videoRef.playAsync();
      }
    }
  }, [currentIndex, currentMedia, isPlaying]);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus, mediaId: string) => {
    if (status.isLoaded) {
      if (status.didJustFinish) {
        // Move to next media when video finishes
        if (currentIndex < media.length - 1) {
          setCurrentIndex(currentIndex + 1);
          onMediaChange?.(currentIndex + 1);
        }
      }
    }
  };

  const togglePlayPause = () => {
    if (currentMedia?.type === 'video') {
      const videoRef = videoRefs.current[currentMedia.id];
      if (videoRef) {
        if (isPlaying) {
          videoRef.pauseAsync();
        } else {
          videoRef.playAsync();
        }
        setIsPlaying(!isPlaying);
      }
    }
  };

  if (!currentMedia) {
    return null;
  }

  return (
    <View style={styles.container}>
      {currentMedia.type === 'video' ? (
        <Video
          ref={(ref) => {
            videoRefs.current[currentMedia.id] = ref;
          }}
          source={{ uri: currentMedia.uri }}
          style={styles.media}
          resizeMode={ResizeMode.COVER}
          shouldPlay={isPlaying}
          isLooping={false}
          onPlaybackStatusUpdate={(status) => handlePlaybackStatusUpdate(status, currentMedia.id)}
        />
      ) : (
        <Image
          source={{ uri: currentMedia.uri }}
          style={styles.media}
          resizeMode="cover"
        />
      )}

      {/* Play/Pause overlay for videos */}
      {currentMedia.type === 'video' && (
        <TouchableOpacity
          style={styles.playButton}
          onPress={togglePlayPause}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={48}
            color="rgba(255, 255, 255, 0.9)"
          />
        </TouchableOpacity>
      )}

      {/* Media indicator dots */}
      {media.length > 1 && (
        <View style={styles.indicators}>
          {media.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentIndex && styles.indicatorActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  indicatorActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 20,
  },
});

