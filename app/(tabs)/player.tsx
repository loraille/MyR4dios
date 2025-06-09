import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import PagerView from 'react-native-pager-view';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface RadioStation {
  _id: string;
  name: string;
  stream_url: string;
  image: string;
  genre: string;
}

export default function PlayerScreen() {
  const params = useLocalSearchParams<{ stations: string; currentIndex: string }>();
  const { stations: stationsJson, currentIndex: currentIndexJson } = params;

  const soundRef = useRef<Audio.Sound | null>(null);
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isChangingStation = useRef(false);
  const pagerRef = useRef<PagerView>(null);

  const stopCurrentSound = useCallback(async () => {
    if (soundRef.current) {
      try {
        console.log('Stopping current sound');
        await soundRef.current.unloadAsync();
      } catch (error) {
        console.log('Error stopping current sound:', error);
      }
      soundRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const playStation = useCallback(async (station: RadioStation) => {
    if (isChangingStation.current) {
      console.log('Already changing station, ignoring request');
      return;
    }

    isChangingStation.current = true;
    setError(null);

    try {
      await stopCurrentSound();

      if (!station.stream_url) {
        throw new Error('Invalid stream URL');
      }

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const { sound: createdSound } = await Audio.Sound.createAsync(
        { uri: station.stream_url },
        { shouldPlay: true, volume }
      );

      soundRef.current = createdSound;

      soundRef.current.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setIsPlaying(status.isPlaying);
          if (status.didJustFinish) {
            soundRef.current = null;
          }
        } else if (status.error) {
          setError(`Playback error: ${status.error}`);
        }
      });

      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing station:', error);
      setError(error instanceof Error ? error.message : 'Failed to play station');
      soundRef.current = null;
      setIsPlaying(false);
    } finally {
      isChangingStation.current = false;
    }
  }, [volume, stopCurrentSound]);

  useEffect(() => {
    if (stationsJson && currentIndexJson) {
      try {
        const parsedStations = JSON.parse(stationsJson) as RadioStation[];
        const parsedIndex = parseInt(currentIndexJson, 10);
        setStations(parsedStations);
        setCurrentIndex(parsedIndex);
        playStation(parsedStations[parsedIndex]);
      } catch (e) {
        console.error('Failed to parse station data:', e);
        setError('Invalid station data');
      }
    }
  }, [stationsJson, currentIndexJson]);

  useEffect(() => {
    return () => {
      stopCurrentSound();
    };
  }, [stopCurrentSound]);

  const handlePageSelected = (e: { nativeEvent: { position: number } }) => {
    const newIndex = e.nativeEvent.position;
    setCurrentIndex(newIndex);
    playStation(stations[newIndex]);
  };

  const togglePlayPause = async () => {
    if (isChangingStation.current || !soundRef.current) {
      return;
    }
    try {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded) {
        if (isPlaying) {
          await soundRef.current.pauseAsync();
        } else {
          await soundRef.current.playAsync();
        }
        setIsPlaying(!isPlaying);
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  const handleVolumeChange = async (value: number) => {
    setVolume(value);
    if (soundRef.current) {
      try {
        await soundRef.current.setVolumeAsync(value);
      } catch (error) {
        console.error('Error setting volume:', error);
      }
    }
  };

  if (!stations.length) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>Loading stations...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <PagerView
      ref={pagerRef}
      style={styles.pagerView}
      initialPage={currentIndex}
      onPageSelected={handlePageSelected}
    >
      {stations.map((station) => (
        <ThemedView key={station._id} style={styles.container}>
          {error && (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          )}
          <View style={styles.nowPlayingContainer}>
            <View style={styles.nowPlayingImageContainer}>
              <Image
                source={{ uri: station.image }}
                style={styles.nowPlayingImage}
                resizeMode="cover"
                onError={(e) => console.log('Image load error:', e)}
              />
            </View>
            <ThemedText type="subtitle">Now Playing</ThemedText>
            <ThemedText style={styles.stationName}>{station.name}</ThemedText>
            <ThemedText style={styles.genreText}>{station.genre}</ThemedText>

            <View style={styles.controlsContainer}>
              <TouchableOpacity
                style={styles.playPauseButton}
                onPress={togglePlayPause}
              >
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={32}
                  color="#0a7ea4"
                />
              </TouchableOpacity>

              <View style={styles.volumeContainer}>
                <Ionicons name="volume-low" size={20} color="#666" />
                <Slider
                  style={styles.volumeSlider}
                  minimumValue={0}
                  maximumValue={1}
                  value={volume}
                  onValueChange={handleVolumeChange}
                  minimumTrackTintColor="#0a7ea4"
                  maximumTrackTintColor="#ccc"
                  thumbTintColor="#0a7ea4"
                />
                <Ionicons name="volume-high" size={20} color="#666" />
              </View>
            </View>
          </View>
        </ThemedView>
      ))}
    </PagerView>
  );
}

const styles = StyleSheet.create({
  pagerView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  nowPlayingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nowPlayingImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  nowPlayingImage: {
    width: 200,
    height: 200,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#0a7ea4',
  },
  stationName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  genreText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  controlsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  playPauseButton: {
    padding: 20,
    marginBottom: 20,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  volumeSlider: {
    flex: 1,
    marginHorizontal: 10,
  },
  errorContainer: {
    padding: 10,
    backgroundColor: '#ffebee',
    borderRadius: 5,
    marginBottom: 10,
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
  },
}); 