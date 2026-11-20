import AsyncStorage from '@react-native-async-storage/async-storage';
import { MatchRecord } from '../types/history';

const STORAGE_KEY_MATCH_HISTORY = '@outlast502_match_history';

/**
 * Saves a completed match record into local storage.
 */
export async function saveMatchHistory(match: MatchRecord): Promise<void> {
  try {
    const existing = await getMatchHistory();
    const updated = [match, ...existing.filter(m => m.id !== match.id)].slice(0, 30);
    await AsyncStorage.setItem(STORAGE_KEY_MATCH_HISTORY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save match history locally:', error);
  }
}

/**
 * Retrieves all saved match records from local storage.
 */
export async function getMatchHistory(): Promise<MatchRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_MATCH_HISTORY);
    if (!raw) return [];
    return JSON.parse(raw) as MatchRecord[];
  } catch (error) {
    console.error('Failed to load match history:', error);
    return [];
  }
}

/**
 * Clears local match history.
 */
export async function clearMatchHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY_MATCH_HISTORY);
  } catch (error) {
    console.error('Failed to clear match history:', error);
  }
}
