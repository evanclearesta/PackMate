import React, { useState, useMemo } from 'react';
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
import { format, isPast, isFuture } from 'date-fns';
import { Colors } from '@/lib/constants';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import TextInput from '@/components/ui/TextInput';

type FilterTab = 'all' | 'upcoming' | 'past' | 'moving';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
  { key: 'moving', label: 'Moving' },
];

export default function AllTripsScreen() {
  const trips = useQuery(api.trips.list);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const numColumns = width > 768 ? 2 : 1;

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const filteredTrips = useMemo(() => {
    if (!trips) return [];
    let result = [...trips];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t: any) =>
          t.title.toLowerCase().includes(q) ||
          t.destination.toLowerCase().includes(q)
      );
    }

    switch (activeFilter) {
      case 'upcoming':
        result = result.filter(
          (t: any) => t.type !== 'moving' && isFuture(new Date(t.startDate))
        );
        break;
      case 'past':
        result = result.filter(
          (t: any) => t.type !== 'moving' && isPast(new Date(t.endDate))
        );
        break;
      case 'moving':
        result = result.filter((t: any) => t.type === 'moving');
        break;
    }

    return result;
  }, [trips, search, activeFilter]);

  const renderTrip = ({ item }: { item: any }) => {
    const progress =
      item.totalItems > 0 ? item.packedItems / item.totalItems : 0;
    const coverColor = item.coverColor || Colors.primary;

    return (
      <View style={numColumns > 1 ? styles.columnItem : undefined}>
        <Card
          style={styles.card}
          onPress={() => {
            if (item.type === 'moving') {
              router.push(`/(app)/moving/${item._id}`);
            } else {
              router.push(`/(app)/trips/${item._id}`);
            }
          }}
        >
          <View style={[styles.cover, { backgroundColor: coverColor }]}>
            <Ionicons
              name={
                item.type === 'moving' ? 'cube-outline' : 'airplane-outline'
              }
              size={28}
              color={Colors.white}
            />
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.cardSub} numberOfLines={1}>
              {item.destination}
            </Text>
            <Text style={styles.cardDate}>
              {format(new Date(item.startDate), 'MMM d')} -{' '}
              {format(new Date(item.endDate), 'MMM d, yyyy')}
            </Text>
            <ProgressBar progress={progress} height={5} />
          </View>
        </Card>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search trips..."
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.filterRow}>
        {FILTER_TABS.map((tab) => (
          <Pressable
            key={tab.key}
            style={[
              styles.filterTab,
              activeFilter === tab.key && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter(tab.key)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === tab.key && styles.filterTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        key={numColumns}
        data={filteredTrips}
        keyExtractor={(item: any) => item._id}
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
        renderItem={renderTrip}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No trips found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
    gap: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  filterTextActive: {
    color: Colors.white,
  },
  list: {
    paddingBottom: 24,
  },
  row: {
    gap: 12,
  },
  columnItem: {
    flex: 1,
    marginBottom: 12,
  },
  card: {
    marginBottom: 12,
    overflow: 'hidden',
  },
  cover: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    padding: 12,
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  cardSub: {
    fontSize: 13,
    color: Colors.gray,
  },
  cardDate: {
    fontSize: 12,
    color: Colors.gray,
    marginBottom: 4,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.gray,
  },
});
