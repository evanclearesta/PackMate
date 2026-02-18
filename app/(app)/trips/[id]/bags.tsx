import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/lib/constants';
import Button from '@/components/ui/Button';
import TextInput from '@/components/ui/TextInput';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';

const PRESET_COLORS = [
  '#4CAF50',
  '#2196F3',
  '#FF9800',
  '#F44336',
  '#9C27B0',
  '#00BCD4',
  '#795548',
  '#607D8B',
  '#E91E63',
  '#3F51B5',
];

const PRESET_ICONS: Array<keyof typeof Ionicons.glyphMap> = [
  'briefcase-outline',
  'bag-outline',
  'cube-outline',
  'school-outline',
  'cart-outline',
  'gift-outline',
  'medkit-outline',
  'laptop-outline',
  'shirt-outline',
  'body-outline',
];

export default function ManageBagsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bags = useQuery(api.bags.listByTrip, { tripId: id as any });
  const createBag = useMutation(api.bags.create);
  const updateBag = useMutation(api.bags.update);
  const deleteBag = useMutation(api.bags.remove);

  const [showModal, setShowModal] = useState(false);
  const [editingBag, setEditingBag] = useState<any>(null);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState<string>(PRESET_ICONS[0]);

  const openCreate = () => {
    setEditingBag(null);
    setName('');
    setSelectedColor(PRESET_COLORS[0]);
    setSelectedIcon(PRESET_ICONS[0]);
    setShowModal(true);
  };

  const openEdit = (bag: any) => {
    setEditingBag(bag);
    setName(bag.name);
    setSelectedColor(bag.color);
    setSelectedIcon(bag.icon);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    try {
      if (editingBag) {
        await updateBag({
          bagId: editingBag._id,
          name: name.trim(),
          color: selectedColor,
          icon: selectedIcon,
        });
      } else {
        await createBag({
          tripId: id as any,
          name: name.trim(),
          color: selectedColor,
          icon: selectedIcon,
        });
      }
      setShowModal(false);
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to save bag');
    }
  };

  const handleDelete = (bag: any) => {
    Alert.alert('Delete Bag', `Delete "${bag.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteBag({ bagId: bag._id }),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Manage Bags</Text>
        <Button title="Add Bag" onPress={openCreate} />
      </View>

      <FlatList
        data={bags || []}
        keyExtractor={(item: any) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }: { item: any }) => (
          <Card style={styles.bagCard}>
            <View style={styles.bagRow}>
              <View
                style={[styles.bagIcon, { backgroundColor: item.color + '20' }]}
              >
                <Ionicons
                  name={item.icon as any}
                  size={22}
                  color={item.color}
                />
              </View>
              <View style={styles.bagInfo}>
                <Text style={styles.bagName}>{item.name}</Text>
                <View
                  style={[styles.colorDot, { backgroundColor: item.color }]}
                />
              </View>
              <Pressable
                style={styles.editBtn}
                onPress={() => openEdit(item)}
              >
                <Ionicons
                  name="pencil-outline"
                  size={18}
                  color={Colors.gray}
                />
              </Pressable>
              <Pressable
                style={styles.deleteBtn}
                onPress={() => handleDelete(item)}
              >
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color={Colors.error}
                />
              </Pressable>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="briefcase-outline"
              size={48}
              color={Colors.lightGray}
            />
            <Text style={styles.emptyText}>No bags yet</Text>
          </View>
        }
      />

      <Modal
        visible={showModal}
        onClose={() => setShowModal(false)}
        title={editingBag ? 'Edit Bag' : 'New Bag'}
      >
        <View style={styles.modalContent}>
          <TextInput
            label="Bag Name"
            value={name}
            onChangeText={setName}
            placeholder="Carry-on, Suitcase..."
          />

          <Text style={styles.modalLabel}>Color</Text>
          <View style={styles.colorGrid}>
            {PRESET_COLORS.map((color) => (
              <Pressable
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorOptionSelected,
                ]}
                onPress={() => setSelectedColor(color)}
              >
                {selectedColor === color && (
                  <Ionicons name="checkmark" size={16} color={Colors.white} />
                )}
              </Pressable>
            ))}
          </View>

          <Text style={styles.modalLabel}>Icon</Text>
          <View style={styles.iconGrid}>
            {PRESET_ICONS.map((icon) => (
              <Pressable
                key={icon}
                style={[
                  styles.iconOption,
                  selectedIcon === icon && {
                    backgroundColor: selectedColor + '20',
                    borderColor: selectedColor,
                  },
                ]}
                onPress={() => setSelectedIcon(icon)}
              >
                <Ionicons
                  name={icon}
                  size={22}
                  color={
                    selectedIcon === icon ? selectedColor : Colors.gray
                  }
                />
              </Pressable>
            ))}
          </View>

          <Button
            title={editingBag ? 'Save Changes' : 'Create Bag'}
            onPress={handleSave}
            fullWidth
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  list: {
    gap: 10,
    paddingBottom: 24,
  },
  bagCard: {
    padding: 14,
  },
  bagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bagIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bagInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bagName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  editBtn: {
    padding: 8,
  },
  deleteBtn: {
    padding: 8,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.gray,
  },
  modalContent: {
    gap: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lightGray + '50',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
});
