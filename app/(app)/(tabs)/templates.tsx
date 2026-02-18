import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/lib/constants';
import Card from '@/components/ui/Card';

interface Template {
  _id: string;
  name: string;
  description: string;
  icon: string;
  itemCount: number;
}

const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  beach: 'sunny-outline',
  business: 'briefcase-outline',
  camping: 'bonfire-outline',
  winter: 'snow-outline',
  moving: 'cube-outline',
  default: 'list-outline',
};

function TemplateCard({ template }: { template: Template }) {
  const router = useRouter();
  const iconName = ICON_MAP[template.icon] || ICON_MAP.default;

  return (
    <Card
      style={styles.card}
      onPress={() =>
        router.push(`/(app)/trips/new?templateId=${template._id}`)
      }
    >
      <View style={styles.iconContainer}>
        <Ionicons name={iconName} size={28} color={Colors.primary} />
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {template.name}
      </Text>
      <Text style={styles.description} numberOfLines={2}>
        {template.description}
      </Text>
      <Text style={styles.count}>{template.itemCount} items</Text>
    </Card>
  );
}

export default function TemplatesScreen() {
  const templates = useQuery(api.templates.list);
  const { width } = useWindowDimensions();
  const numColumns = width > 768 ? 3 : 2;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Templates</Text>
      <Text style={styles.subtitle}>
        Start with a packing template to save time
      </Text>

      {templates === undefined ? (
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : templates.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="list-outline" size={64} color={Colors.lightGray} />
          <Text style={styles.emptyText}>No templates available</Text>
        </View>
      ) : (
        <FlatList
          key={numColumns}
          data={templates}
          keyExtractor={(item) => item._id}
          numColumns={numColumns}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <View style={styles.columnItem}>
              <TemplateCard template={item as Template} />
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
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.gray,
    marginTop: 4,
    marginBottom: 16,
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
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 18,
  },
  count: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
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
  emptyText: {
    fontSize: 16,
    color: Colors.gray,
  },
});
