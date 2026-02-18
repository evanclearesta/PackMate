import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/lib/constants';
import Button from '@/components/ui/Button';
import TextInput from '@/components/ui/TextInput';

const tripSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  destination: z.string().min(1, 'Destination is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  type: z.enum(['travel', 'moving']),
});

type TripForm = z.infer<typeof tripSchema>;

export default function NewTripScreen() {
  const router = useRouter();
  const { templateId } = useLocalSearchParams<{ templateId?: string }>();
  const createTrip = useMutation(api.trips.create);
  const applyTemplate = useMutation(api.templates.applyToTrip);
  const templates = useQuery(api.templates.list);

  const [selectedTemplate, setSelectedTemplate] = useState(templateId || '');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TripForm>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      title: '',
      destination: '',
      startDate: '',
      endDate: '',
      type: 'travel',
    },
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) {
      setCoverImage(result.assets[0].uri);
    }
  };

  const onSubmit = async (data: TripForm) => {
    setLoading(true);
    try {
      const tripId = await createTrip({
        title: data.title,
        destination: data.destination,
        startDate: data.startDate,
        endDate: data.endDate,
        type: data.type,
        coverImage: coverImage || undefined,
      });
      if (selectedTemplate) {
        await applyTemplate({
          tripId,
          templateId: selectedTemplate as any,
        });
      }
      router.replace(`/(app)/trips/${tripId}`);
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>Create New Trip</Text>

      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Trip Title"
            value={value}
            onChangeText={onChange}
            placeholder="Summer Vacation"
            error={errors.title?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="destination"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Destination"
            value={value}
            onChangeText={onChange}
            placeholder="Paris, France"
            error={errors.destination?.message}
          />
        )}
      />

      <View style={styles.row}>
        <View style={styles.halfField}>
          <Controller
            control={control}
            name="startDate"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Start Date"
                value={value}
                onChangeText={onChange}
                placeholder="YYYY-MM-DD"
                error={errors.startDate?.message}
              />
            )}
          />
        </View>
        <View style={styles.halfField}>
          <Controller
            control={control}
            name="endDate"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="End Date"
                value={value}
                onChangeText={onChange}
                placeholder="YYYY-MM-DD"
                error={errors.endDate?.message}
              />
            )}
          />
        </View>
      </View>

      <Text style={styles.label}>Trip Type</Text>
      <Controller
        control={control}
        name="type"
        render={({ field: { onChange, value } }) => (
          <View style={styles.typeRow}>
            <Pressable
              style={[
                styles.typeOption,
                value === 'travel' && styles.typeOptionActive,
              ]}
              onPress={() => onChange('travel')}
            >
              <Ionicons
                name="airplane-outline"
                size={20}
                color={value === 'travel' ? Colors.white : Colors.text}
              />
              <Text
                style={[
                  styles.typeText,
                  value === 'travel' && styles.typeTextActive,
                ]}
              >
                Travel
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.typeOption,
                value === 'moving' && styles.typeOptionActive,
              ]}
              onPress={() => onChange('moving')}
            >
              <Ionicons
                name="cube-outline"
                size={20}
                color={value === 'moving' ? Colors.white : Colors.text}
              />
              <Text
                style={[
                  styles.typeText,
                  value === 'moving' && styles.typeTextActive,
                ]}
              >
                Moving
              </Text>
            </Pressable>
          </View>
        )}
      />

      <Text style={styles.label}>Cover Image</Text>
      <Pressable style={styles.imagePicker} onPress={pickImage}>
        <View style={styles.imagePreview}>
          <Ionicons
            name={coverImage ? 'image' : 'camera-outline'}
            size={24}
            color={coverImage ? Colors.primary : Colors.gray}
          />
          <Text
            style={coverImage ? styles.imageText : styles.imagePlaceholder}
          >
            {coverImage ? 'Image selected' : 'Tap to add cover photo'}
          </Text>
        </View>
      </Pressable>

      {templates && templates.length > 0 && (
        <>
          <Text style={styles.label}>Template (optional)</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.templateScroll}
          >
            <Pressable
              style={[
                styles.templateChip,
                !selectedTemplate && styles.templateChipActive,
              ]}
              onPress={() => setSelectedTemplate('')}
            >
              <Text
                style={[
                  styles.templateChipText,
                  !selectedTemplate && styles.templateChipTextActive,
                ]}
              >
                None
              </Text>
            </Pressable>
            {templates.map((t: any) => (
              <Pressable
                key={t._id}
                style={[
                  styles.templateChip,
                  selectedTemplate === t._id && styles.templateChipActive,
                ]}
                onPress={() => setSelectedTemplate(t._id)}
              >
                <Text
                  style={[
                    styles.templateChipText,
                    selectedTemplate === t._id &&
                      styles.templateChipTextActive,
                  ]}
                >
                  {t.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </>
      )}

      <View style={styles.submitContainer}>
        <Button
          title="Create Trip"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          fullWidth
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    gap: 12,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.lightGray,
    backgroundColor: Colors.white,
  },
  typeOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  typeTextActive: {
    color: Colors.white,
  },
  imagePicker: {
    borderWidth: 1.5,
    borderColor: Colors.lightGray,
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 20,
    backgroundColor: Colors.white,
    marginTop: 4,
  },
  imagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  imageText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  imagePlaceholder: {
    color: Colors.gray,
  },
  templateScroll: {
    marginTop: 4,
  },
  templateChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.lightGray,
    backgroundColor: Colors.white,
    marginRight: 8,
  },
  templateChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  templateChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  templateChipTextActive: {
    color: Colors.white,
  },
  submitContainer: {
    marginTop: 20,
  },
});
