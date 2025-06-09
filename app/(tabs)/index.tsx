import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

interface RadioStation {
  _id: string;
  name: string;
  stream_url: string;
  image: string;
  genre: string;
}

interface ApiResponse {
  result: boolean;
  data: RadioStation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function HomeScreen() {
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [genres, setGenres] = useState<string[]>([]);

  const fetchStations = async () => {
    try {
      const response = await fetch('https://back-radios.vercel.app/api/radios');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result: ApiResponse = await response.json();
      if (result.result && result.data) {
        setStations(result.data);
        const uniqueGenres = Array.from(new Set(result.data.map(station => station.genre)));
        setGenres(uniqueGenres);
        setError(null);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (e) {
      console.error('Error fetching stations:', e);
      setError('Failed to fetch stations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const filteredStations = selectedGenre
    ? stations.filter(station => station.genre === selectedGenre)
    : stations;

  const handleStationPress = (station: RadioStation, index: number) => {
    router.push({
      pathname: '/player',
      params: {
        stations: JSON.stringify(filteredStations),
        currentIndex: index,
      },
    });
  };

  const renderItem = ({ item, index }: { item: RadioStation; index: number }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handleStationPress(item, index)}
    >
      <View style={styles.stationImageContainer}>
        <Image 
          source={{ uri: item.image }} 
          style={styles.stationImage}
          onError={(e) => console.log('Error loading image:', e)}
        />
      </View>
      <View style={styles.stationInfo}>
        <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
        <ThemedText style={styles.genreText}>{item.genre}</ThemedText>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <ThemedText>Loading stations...</ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => {
            setLoading(true);
            setError(null);
            fetchStations();
          }}
        >
          <ThemedText style={styles.retryText}>Retry</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.titleContainer}>
        <ThemedText type="title" style={styles.title}>MyR</ThemedText>
        <ThemedText type="title" style={[styles.title, styles.titleBlue]}>4</ThemedText>
        <ThemedText type="title" style={styles.title}>dios</ThemedText>
      </View>
      
      <View style={styles.genreContainer}>
        <TouchableOpacity
          style={[
            styles.genreChip,
            !selectedGenre && styles.genreChipSelected
          ]}
          onPress={() => setSelectedGenre(null)}
        >
          <ThemedText style={[
            styles.genreChipText,
            !selectedGenre && styles.genreChipTextSelected
          ]}>All</ThemedText>
        </TouchableOpacity>
        
        {genres.map((genre) => (
          <TouchableOpacity
            key={genre}
            style={[
              styles.genreChip,
              selectedGenre === genre && styles.genreChipSelected
            ]}
            onPress={() => setSelectedGenre(genre)}
          >
            <ThemedText style={[
              styles.genreChipText,
              selectedGenre === genre && styles.genreChipTextSelected
            ]}>{genre}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredStations}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        style={{ flex: 1 }}
        ListEmptyComponent={
          <View style={styles.centered}>
            <ThemedText>No radio stations found</ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 64,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 36,
  },
  title: {
    textAlign: 'center',
    fontSize: 34,
    fontWeight: '600',
    letterSpacing: 1,
    opacity: 0.85,
    lineHeight: 42,
  },
  titleBlue: {
    color: '#0a7ea4',
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  genreChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  genreChipSelected: {
    backgroundColor: '#0a7ea4',
  },
  genreChipText: {
    color: '#666',
  },
  genreChipTextSelected: {
    color: 'white',
  },
  itemContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'center',
  },
  stationImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0a7ea4',
    marginRight: 15,
    overflow: 'hidden',
  },
  stationImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  stationInfo: {
    flex: 1,
  },
  genreText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    margin: 20,
  },
  retryButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#0a7ea4',
    borderRadius: 5,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
  }
});
