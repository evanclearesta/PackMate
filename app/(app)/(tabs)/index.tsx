import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Colors } from '@/lib/constants';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';

interface Trip {
  _id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  type: 'travel' | 'moving';
  coverColor?: string;
  packedItems: number;
  totalItems: number;
}

function TripCard({ trip }: { trip: Trip }) {
  const router = useRouter();
  const progress = trip.totalItems > 0 ? trip.packedItems / trip.totalItems : 0;
  const percentage = Math.round(progress * 100);
  const coverColor = trip.coverColor || Colors.primary;

  const handlePress = () => {
    if (trip.type === 'moving') {
      router.push(`/(app)/moving/${trip._id}`);
    } else {
      router.push(`/(app)/trips/${trip._id}`);
    }
  };

  return (
    <Card style={styles.card} onPress={handlePress}>
      <View style={[styles.coverImage, { backgroundColor: coverColor }]}>
        <Ionicons
          name={trip.type === 'moving' ? 'cube-outline' : 'airplane-outline'}
          size={32}
          color={Colors.white}
        />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {trip.title}
        </Text>
        <Text style={styles.cardDestination} numberOfLines={1}>
          {trip.destination}
        </Text>
        <Text style={styles.cardDate}>
          {format(new Date(trip.startDate), 'MMM d')} -{' '}
          {format(new Date(trip.endDate), 'MMM d, yyyy')}
        </Text>
        <View style={styles.progressRow}>
          <ProgressBar progress={progress} height={6} />
          <Text style={styles.progressText}>{percentage}% packed</Text>
        </View>
      </View>
    </Card>
  );
}

export default function MyTripsScreen() {
  const trips = useQuery(api.trips.list);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const numColumns = width > 768 ? 2 : 1;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>My Trips</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => router.push('/(app)/trips/new')}
        >
          <Ionicons name="add" size={24} color={Colors.white} />
        </Pressable>
      </View>

      {trips === undefined ? (
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : trips.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="airplane-outline" size={64} color={Colors.lightGray} />
          <Text style={styles.emptyTitle}>No trips yet</Text>
          <Text style={styles.emptySubtitle}>
            Create your first trip!
          </Text>
        </View>
      ) : (
        <FlatList
          key={numColumns}
          data={trips}
          keyExtractor={(item) => item._id}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
          renderItem={({ item }) => (
            <View style={numColumns > 1 ? styles.columnItem : undefined}>
              <TripCard trip={item as Trip} />
            </View>
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  list: {
    paddingBottom: 24,
  },
  row: {
    gap: 12,
  },
  columnItem: {
    flex: 1,
  },
  card: {
    marginBottom: 12,
    overflow: 'hidden',
  },
  coverImage: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 14,
    gap: 4,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  cardDestination: {
    fontSize: 14,
    color: Colors.gray,
  },
  cardDate: {
    fontSize: 13,
    color: Colors.gray,
    marginTop: 2,
  },
  progressRow: {
    marginTop: 8,
    gap: 4,
  },
  progressText: {
    fontSize: 12,
    color: Colors.gray,
    textAlign: 'right',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.gray,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.gray,
  },
});
