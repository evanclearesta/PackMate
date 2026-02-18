import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Stack } from 'expo-router';
import { Colors } from '@/lib/constants';

export default function AppLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontWeight: '600' },
        contentStyle: { backgroundColor: Colors.background },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="trips/new"
        options={{ title: 'New Trip', presentation: 'modal' }}
      />
      <Stack.Screen name="trips/all" options={{ title: 'All Trips' }} />
      <Stack.Screen
        name="trips/[id]/index"
        options={{ title: 'Packing List' }}
      />
      <Stack.Screen
        name="trips/[id]/bags"
        options={{ title: 'Manage Bags', presentation: 'modal' }}
      />
      <Stack.Screen
        name="trips/[id]/assign"
        options={{ title: 'Assign Items', presentation: 'modal' }}
      />
      <Stack.Screen
        name="moving/[id]"
        options={{ title: 'Moving Checklist' }}
      />
    </Stack>
  );
}
