import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  Pressable,
  TextInput as RNTextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Colors } from '@/lib/constants';
import ProgressBar from '@/components/ui/ProgressBar';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';

export default function MovingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const trip = useQuery(api.trips.getById, { tripId: id as any });
  const categories = useQuery(api.packingItems.listByTrip, {
    tripId: id as any,
  });
  const bags = useQuery(api.bags.listByTrip, { tripId: id as any });

  const togglePacked = useMutation(api.packingItems.togglePacked);
  const addItem = useMutation(api.packingItems.create);
  const addCategory = useMutation(api.packingCategories.create);

  const [selectedBox, setSelectedBox] = useState<string | null>(null);
  const [newItemInputs, setNewItemInputs] = useState<Record<string, string>>(
    {}
  );
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [showFab, setShowFab] = useState(false);

  if (!trip || !categories) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const allItems = categories.flatMap((cat: any) => cat.items || []);
  const filteredCategories = categories
    .map((cat: any) => {
      let items = cat.items || [];
      if (selectedBox) {
        items = items.filter((item: any) =>
          item.bagIds?.includes(selectedBox)
        );
      }
      return { ...cat, data: items };
    })
    .filter((cat: any) => cat.data.length > 0 || !selectedBox);

  const totalItems = allItems.length;
  const packedItems = allItems.filter((i: any) => i.isPacked).length;
  const progress = totalItems > 0 ? packedItems / totalItems : 0;

  const handleToggle = async (itemId: string) => {
    try {
      await togglePacked({ itemId: itemId as any });
    } catch {
      Alert.alert('Error', 'Failed to update item');
    }
  };

  const handleAddItem = async (categoryId: string) => {
    const name = newItemInputs[categoryId]?.trim();
    if (!name) return;
    try {
      await addItem({
        tripId: id as any,
        categoryId: categoryId as any,
        name,
        quantity: 1,
      });
      setNewItemInputs((prev) => ({ ...prev, [categoryId]: '' }));
    } catch {
      Alert.alert('Error', 'Failed to add item');
    }
  };

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    try {
      await addCategory({ tripId: id as any, name });
      setNewCategoryName('');
      setShowCategoryInput(false);
    } catch {
      Alert.alert('Error', 'Failed to add room');
    }
  };

  const boxMap: Record<string, any> = {};
  (bags || []).forEach((b: any) => {
    boxMap[b._id] = b;
  });

  const sections = filteredCategories.map((cat: any) => ({
    title: cat.name,
    categoryId: cat._id,
    data: cat.data,
  }));

  return (
    <View style={styles.container}>
      <Card style={styles.tripHeader}>
        <View style={styles.headerTop}>
          <Ionicons name="cube" size={24} color={Colors.accent} />
          <Text style={styles.movingLabel}>Moving</Text>
        </View>
        <Text style={styles.tripTitle}>{trip.title}</Text>
        <Text style={styles.tripDestination}>{trip.destination}</Text>
        {trip.startDate && trip.endDate && (
          <Text style={styles.tripDate}>
            {format(new Date(trip.startDate), 'MMM d')} -{' '}
            {format(new Date(trip.endDate), 'MMM d, yyyy')}
          </Text>
        )}
        <View style={styles.progressSection}>
          <ProgressBar
            progress={progress}
            height={8}
            color={Colors.accent}
            showLabel
          />
          <Text style={styles.progressDetail}>
            {packedItems} / {totalItems} items shipped
          </Text>
        </View>
      </Card>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.boxTabs}
        contentContainerStyle={styles.boxTabsContent}
      >
        <Pressable
          style={[styles.boxTab, !selectedBox && styles.boxTabActive]}
          onPress={() => setSelectedBox(null)}
        >
          <Text
            style={[
              styles.boxTabText,
              !selectedBox && styles.boxTabTextActive,
            ]}
          >
            All
          </Text>
        </Pressable>
        {(bags || []).map((box: any) => (
          <Pressable
            key={box._id}
            style={[
              styles.boxTab,
              selectedBox === box._id && styles.boxTabActive,
            ]}
            onPress={() =>
              setSelectedBox(selectedBox === box._id ? null : box._id)
            }
          >
            <View
              style={[styles.boxDot, { backgroundColor: box.color }]}
            />
            <Text
              style={[
                styles.boxTabText,
                selectedBox === box._id && styles.boxTabTextActive,
              ]}
            >
              {box.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <SectionList
        sections={sections}
        keyExtractor={(item: any) => item._id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContent}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Ionicons name="home-outline" size={16} color={Colors.accent} />
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionCount}>
              {section.data.filter((i: any) => i.isPacked).length}/
              {section.data.length}
            </Text>
          </View>
        )}
        renderItem={({ item }: { item: any }) => (
          <Pressable
            style={styles.itemRow}
            onPress={() => handleToggle(item._id)}
          >
            <View
              style={[
                styles.shippedIndicator,
                item.isPacked && styles.shippedIndicatorActive,
              ]}
            >
              {item.isPacked && (
                <Ionicons name="checkmark" size={14} color={Colors.white} />
              )}
            </View>
            <View style={styles.itemInfo}>
              <Text
                style={[
                  styles.itemName,
                  item.isPacked && styles.itemNameShipped,
                ]}
              >
                {item.name}
              </Text>
              {item.quantity > 1 && (
                <Text style={styles.itemQty}>x{item.quantity}</Text>
              )}
            </View>
            {item.isPacked && (
              <Badge label="Shipped" color={Colors.accent} variant="filled" />
            )}
            <View style={styles.itemBoxes}>
              {(item.bagIds || []).map((boxId: string) => {
                const box = boxMap[boxId];
                if (!box) return null;
                return (
                  <Badge
                    key={boxId}
                    label={box.name}
                    color={box.color}
                    variant="outlined"
                  />
                );
              })}
            </View>
          </Pressable>
        )}
        renderSectionFooter={({ section }) => (
          <View style={styles.addItemRow}>
            <RNTextInput
              style={styles.addItemInput}
              placeholder="Add item..."
              placeholderTextColor={Colors.gray}
              value={newItemInputs[section.categoryId] || ''}
              onChangeText={(text) =>
                setNewItemInputs((prev) => ({
                  ...prev,
                  [section.categoryId]: text,
                }))
              }
              onSubmitEditing={() => handleAddItem(section.categoryId)}
              returnKeyType="done"
            />
            <Pressable
              style={styles.addItemButton}
              onPress={() => handleAddItem(section.categoryId)}
            >
              <Ionicons name="add" size={20} color={Colors.accent} />
            </Pressable>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            {showCategoryInput ? (
              <View style={styles.addCategoryRow}>
                <RNTextInput
                  style={styles.addCategoryInput}
                  placeholder="Room name..."
                  placeholderTextColor={Colors.gray}
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  onSubmitEditing={handleAddCategory}
                  autoFocus
                />
                <Pressable
                  style={styles.addCategoryBtn}
                  onPress={handleAddCategory}
                >
                  <Text style={styles.addCategoryBtnText}>Add</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setShowCategoryInput(false);
                    setNewCategoryName('');
                  }}
                >
                  <Ionicons name="close" size={20} color={Colors.gray} />
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={styles.addCategoryPressable}
                onPress={() => setShowCategoryInput(true)}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={20}
                  color={Colors.accent}
                />
                <Text style={styles.addCategoryLabel}>Add Room</Text>
              </Pressable>
            )}
          </View>
        }
      />

      <View style={styles.fabContainer}>
        {showFab && (
          <View style={styles.fabMenu}>
            <Pressable
              style={styles.fabMenuItem}
              onPress={() => {
                setShowFab(false);
                router.push(`/(app)/trips/${id}/bags`);
              }}
            >
              <Ionicons
                name="cube-outline"
                size={18}
                color={Colors.white}
              />
              <Text style={styles.fabMenuText}>Manage Boxes</Text>
            </Pressable>
            <Pressable
              style={styles.fabMenuItem}
              onPress={() => {
                setShowFab(false);
                router.push(`/(app)/trips/${id}/assign`);
              }}
            >
              <Ionicons
                name="swap-horizontal-outline"
                size={18}
                color={Colors.white}
              />
              <Text style={styles.fabMenuText}>Assign Items</Text>
            </Pressable>
          </View>
        )}
        <Pressable
          style={styles.fab}
          onPress={() => setShowFab(!showFab)}
        >
          <Ionicons
            name={showFab ? 'close' : 'ellipsis-vertical'}
            size={24}
            color={Colors.white}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  tripHeader: {
    margin: 16,
    padding: 16,
    gap: 4,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  movingLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tripTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  tripDestination: {
    fontSize: 15,
    color: Colors.gray,
  },
  tripDate: {
    fontSize: 13,
    color: Colors.gray,
    marginBottom: 8,
  },
  progressSection: {
    gap: 4,
  },
  progressDetail: {
    fontSize: 13,
    color: Colors.gray,
    textAlign: 'right',
  },
  boxTabs: {
    maxHeight: 44,
    marginBottom: 8,
  },
  boxTabsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  boxTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.lightGray,
  },
  boxTabActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  boxTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  boxTabTextActive: {
    color: Colors.white,
  },
  boxDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingTop: 18,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  sectionCount: {
    fontSize: 13,
    color: Colors.gray,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 6,
    gap: 10,
  },
  shippedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shippedIndicatorActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  itemInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemName: {
    fontSize: 15,
    color: Colors.text,
  },
  itemNameShipped: {
    textDecorationLine: 'line-through',
    color: Colors.gray,
  },
  itemQty: {
    fontSize: 12,
    color: Colors.gray,
    backgroundColor: Colors.lightGray,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  itemBoxes: {
    flexDirection: 'row',
    gap: 4,
  },
  addItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  addItemInput: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.text,
  },
  addItemButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accent + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingVertical: 12,
  },
  addCategoryPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  addCategoryLabel: {
    fontSize: 15,
    color: Colors.accent,
    fontWeight: '600',
  },
  addCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addCategoryInput: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.text,
  },
  addCategoryBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addCategoryBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    alignItems: 'flex-end',
  },
  fabMenu: {
    backgroundColor: Colors.text,
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
    gap: 4,
  },
  fabMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  fabMenuText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
});
