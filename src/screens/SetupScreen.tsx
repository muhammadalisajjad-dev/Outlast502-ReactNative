import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Button } from '../components/common/Button';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { useGame } from '../context/GameContext';
import { triggerHaptic } from '../utils/haptics';

interface SetupScreenProps {
  onBack: () => void;
  onStartGame: () => void;
}

const ALL_BOTS = ['Marcus', 'Sophia', 'Elena', 'Liam', 'Zoe'];

export const SetupScreen: React.FC<SetupScreenProps> = ({
  onBack,
  onStartGame,
}) => {
  const { startMatch } = useGame();
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [playerName, setPlayerName] = useState<string>('You');

  const handleSelectCount = (count: number) => {
    triggerHaptic('light');
    setPlayerCount(count);
  };

  const handleStart = () => {
    startMatch(playerCount, playerName.trim() || 'You');
    onStartGame();
  };

  const activeBots = ALL_BOTS.slice(0, playerCount - 1);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>MATCH SETUP</Text>
          <View style={{ width: 50 }} />
        </View>

        <View style={styles.cardSection}>
          <Text style={styles.sectionLabel}>Your Display Name</Text>
          <TextInput
            value={playerName}
            onChangeText={setPlayerName}
            maxLength={16}
            placeholder="Enter name"
            placeholderTextColor={Colors.textMuted}
            style={styles.textInput}
          />
        </View>

        {/* Player Count Selection */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionLabel}>
            Total Table Seats ({playerCount} Players)
          </Text>
          <Text style={styles.sectionHint}>
            1 Human Player vs {playerCount - 1} AI Opponents (Supports 2 to 6)
          </Text>

          <View style={styles.selectorRow}>
            {[2, 3, 4, 5, 6].map(count => {
              const isSelected = count === playerCount;
              return (
                <TouchableOpacity
                  key={count}
                  onPress={() => handleSelectCount(count)}
                  style={[
                    styles.countPill,
                    isSelected && styles.countPillSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.countPillText,
                      isSelected && styles.countPillTextSelected,
                    ]}
                  >
                    {count}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Roster Preview */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionLabel}>Table Roster</Text>
          <View style={styles.rosterList}>
            <View style={styles.rosterItem}>
              <Text style={styles.rosterSeat}>Seat 1 (Host):</Text>
              <Text style={styles.rosterHumanName}>
                {playerName.trim() || 'You'} (Human)
              </Text>
            </View>

            {activeBots.map((bot, idx) => (
              <View key={bot} style={styles.rosterItem}>
                <Text style={styles.rosterSeat}>Seat {idx + 2}:</Text>
                <Text style={styles.rosterBotName}>{bot} (AI)</Text>
              </View>
            ))}
          </View>
        </View>

        <Button
          title="Deal Cards & Start Match ♠"
          variant="gold"
          size="large"
          onPress={handleStart}
          style={styles.startBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.tableDeep,
  },
  container: {
    padding: 20,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: Colors.surfaceElevated,
  },
  backBtnText: {
    color: Colors.goldLight,
    fontWeight: '700',
    fontSize: 13,
  },
  headerTitle: {
    ...Typography.titleMedium,
    color: Colors.gold,
    letterSpacing: 1.5,
  },
  cardSection: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.surfaceCard,
    borderColor: Colors.borderSubtle,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  sectionLabel: {
    ...Typography.bodyMedium,
    color: Colors.textGold,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionHint: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: Colors.surfaceDark,
    borderColor: Colors.borderGold,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  selectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  countPill: {
    flex: 1,
    marginHorizontal: 3,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: Colors.surfaceDark,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  countPillSelected: {
    backgroundColor: Colors.gold,
    borderColor: Colors.goldLight,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 4,
  },
  countPillText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  countPillTextSelected: {
    color: '#1a1406',
  },
  rosterList: {
    marginTop: 6,
  },
  rosterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  rosterSeat: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
  },
  rosterHumanName: {
    ...Typography.bodySmall,
    color: Colors.playableLime,
    fontWeight: '700',
  },
  rosterBotName: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  startBtn: {
    width: '100%',
    maxWidth: 360,
    marginTop: 8,
  },
});
