import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  Pressable,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/lib/constants';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function AssignItemsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const categories = useQuery(api.packingItems.listByTrip, {
    tripId: id as any,
  });
  const bags = useQuery(api.bags.listByTrip, { tripId: id as any });
  const assignToBag = useMutation(api.packingItems.assignToBag);

  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  if (!categories || !bags) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const bagMap: Record<string, any> = {};
  bags.forEach((b: any) => {
    bagMap[b._id] = b;
  });

  const handleAssign = async (itemId: string, bagId: string) => {
    try {
      await assignToBag({ itemId: itemId as any, bagId: bagId as any });
      setExpandedItem(null);
    } catch {
      Alert.alert('Error', 'Failed to assign item');
    }
  };

  const handleAssignAll = async (categoryItems: any[], bagId: string) => {
    try {
      for (const item of categoryItems) {
        await assignToBag({ itemId: item._id, bagId: bagId as any });
      }
    } catch {
      Alert.alert('Error', 'Failed to assign items');
    }
  };

  const sections = categories.map((cat: any) => ({
    title: cat.name,
    categoryId: cat._id,
    data: cat.items || [],
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Assign Items to Bags</Text>
      <Text style={styles.subtitle}>
        Tap an item to assign it to a bag
      </Text>

      <SectionList
        sections={sections}
        keyExtractor={(item: any) => item._id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.list}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {bags.length > 0 && (
              <View style={styles.assignAllRow}>
                <Text style={styles.assignAllLabel}>Assign all:</Text>
                {bags.map((bag: any) => (
                  <Pressable
                    key={bag._id}
                    style={[
                      styles.assignAllChip,
                      { borderColor: bag.color },
                    ]}
                    onPress={() => handleAssignAll(section.data, bag._id)}
                  >
                    <View
                      style={[
                        styles.chipDot,
                        { backgroundColor: bag.color },
                      ]}
                    />
                    <Text style={styles.chipText}>{bag.name}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}
        renderItem={({ item }: { item: any }) => (
          <View style={styles.itemContainer}>
            <Pressable
              style={styles.itemRow}
              onPress={() =>
                setExpandedItem(
                  expandedItem === item._id ? null : item._id
                )
              }
            >
              <Text style={styles.itemName}>{item.name}</Text>
              <View style={styles.itemBadges}>
                {(item.bagIds || []).map((bagId: string) => {
                  const bag = bagMap[bagId];
                  if (!bag) return null;
                  return (
                    <Badge
                      key={bagId}
                      label={bag.name}
                      color={bag.color}
                      variant="filled"
                    />
                  );
                })}
              </View>
              <Ionicons
                name={
                  expandedItem === item._id
                    ? 'chevron-up'
                    : 'chevron-down'
                }
                size={18}
                color={Colors.gray}
              />
            </Pressable>
            {expandedItem === item._id && (
              <View style={styles.bagSelector}>
                {bags.map((bag: any) => {
                  const isAssigned = (item.bagIds || []).includes(bag._id);
                  return (
                    <Pressable
                      key={bag._id}
                      style={[
                        styles.bagOption,
                        isAssigned && {
                          backgroundColor: bag.color + '20',
                          borderColor: bag.color,
                        },
                      ]}
                      onPress={() => handleAssign(item._id, bag._id)}
                    >
                      <Ionicons
                        name={bag.icon as any}
                        size={18}
                        color={isAssigned ? bag.color : Colors.gray}
                      />
                      <Text
                        style={[
                          styles.bagOptionText,
                          isAssigned && { color: bag.color },
                        ]}
                      >
                        {bag.name}
                      </Text>
                      {isAssigned && (
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color={bag.color}
                        />
                      )}
                    </Pressable>
                  );
                })}
                {bags.length === 0 && (
                  <Text style={styles.noBagsText}>
                    Create bags first to assign items
                  </Text>
                )}
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.gray,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 16,
  },
  list: {
    paddingBottom: 40,
  },
  sectionHeader: {
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  assignAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  assignAllLabel: {
    fontSize: 12,
    color: Colors.gray,
    marginRight: 4,
  },
  assignAllChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
  },
  itemContainer: {
    marginBottom: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  itemName: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  itemBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  bagSelector: {
    backgroundColor: Colors.white,
    marginTop: 2,
    borderRadius: 10,
    padding: 10,
    gap: 6,
  },
  bagOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.lightGray,
  },
  bagOptionText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  noBagsText: {
    fontSize: 13,
    color: Colors.gray,
    textAlign: 'center',
    paddingVertical: 8,
  },
});
