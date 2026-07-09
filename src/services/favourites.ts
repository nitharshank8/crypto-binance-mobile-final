import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@pulsecrypto:favourites';

export async function loadFavourites(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export async function persistFavourites(favs: Set<string>): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify([...favs]));
  } catch {}
}

export async function toggleFavourite(
  pair: string,
  current: Set<string>,
): Promise<Set<string>> {
  const next = new Set(current);
  next.has(pair) ? next.delete(pair) : next.add(pair);
  await persistFavourites(next);
  return next;
}
