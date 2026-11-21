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
import { ChevronLeft, Play, User, Bot, Shield, Users } from 'lucide-react-native';

interface SetupScreenProps {
  onBack: () => void;
  onStartGame: () => void;
}

const ALL_BOTS = [
  { name: 'Marcus', role: 'Tactical Aggressor' },
  { name: 'Sophia', role: 'Conservative Counter' },
  { name: 'Elena', role: 'Penalty Specialist' },
  { name: 'Liam', role: 'Adaptive Shedder' },
  { name: 'Zoe', role: 'High-Stakes Gambler' },
];

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
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.75}>
          <ChevronLeft size={18} color={Colors.goldLight} style={{ marginRight: 2 }} />
          <Text style={styles.backBtnText}>BACK</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MATCH SETUP</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Human Player Identity */}
        <View style={styles.cardSection}>
          <View style={styles.sectionHeader}>
            <User size={14} color={Colors.gold} style={{ marginRight: 6 }} />
            <Text style={styles.sectionLabel}>HOST IDENTITY</Text>
          </View>
          <Text style={styles.sectionHint}>
            Your player moniker displayed on the table and recorded in scoreboard history.
          </Text>

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
          <View style={styles.sectionHeader}>
            <Users size={14} color={Colors.gold} style={{ marginRight: 6 }} />
            <Text style={styles.sectionLabel}>
              TABLE SEATS ({playerCount} PLAYERS)
            </Text>
          </View>
          <Text style={styles.sectionHint}>
            1 Human Participant vs {playerCount - 1} Computer AI Opponents (2 to 6 seats).
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
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.countPillNumber,
                      isSelected && styles.countPillNumberSelected,
                    ]}
                  >
                    {count}
                  </Text>
                  <Text
                    style={[
                      styles.countPillLabel,
                      isSelected && styles.countPillLabelSelected,
                    ]}
                  >
                    {count === 2 ? 'Duel' : count === 4 ? 'Classic' : count === 6 ? 'Full' : `${count}P`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Match Roster Preview */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionLabel}>MATCH ROSTER PREVIEW</Text>
          <Text style={styles.sectionHint}>
            Table order progresses clockwise starting from host player in Round 1.
          </Text>

          {/* Host Item */}
          <View style={[styles.rosterRow, styles.hostRosterRow]}>
            <View style={styles.rosterAvatarBox}>
              <Text style={styles.avatarLetter}>
                {playerName.trim().charAt(0).toUpperCase() || 'Y'}
              </Text>
            </View>
            <View style={styles.rosterDetails}>
              <View style={styles.nameBadgeRow}>
                <Text style={styles.rosterName}>{playerName.trim() || 'You'}</Text>
                <View style={styles.hostPill}>
                  <Text style={styles.hostPillText}>YOU · HOST</Text>
                </View>
              </View>
              <Text style={styles.rosterSub}>Manual decision engine</Text>
            </View>
          </View>

          {/* Bots */}
          {activeBots.map((bot, idx) => (
            <View key={bot.name} style={styles.rosterRow}>
              <View style={[styles.rosterAvatarBox, styles.botAvatarBox]}>
                <Bot size={13} color={Colors.textMuted} />
              </View>
              <View style={styles.rosterDetails}>
                <View style={styles.nameBadgeRow}>
                  <Text style={styles.rosterName}>{bot.name}</Text>
                  <View style={styles.botPill}>
                    <Text style={styles.botPillText}>SEAT {idx + 2}</Text>
                  </View>
                </View>
                <Text style={styles.rosterSub}>{bot.role}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Start Button */}
        <Button
          title={`DEAL CARDS & START MATCH (${playerCount}P)`}
          icon={<Play size={16} color="#13110a" fill="#13110a" />}
          variant="gold"
          size="large"
          onPress={handleStart}
          style={styles.startBtn}
          textStyle={styles.startBtnText}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(203, 178, 106, 0.15)',
    backgroundColor: 'rgba(6, 19, 13, 0.95)',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  backBtnText: {
    ...Typography.badge,
    color: Colors.goldLight,
    fontSize: 10,
    letterSpacing: 1,
  },
  headerTitle: {
    ...Typography.badge,
    color: Colors.gold,
    fontSize: 12,
    letterSpacing: 1.8,
  },
  container: {
    padding: 18,
    paddingBottom: 36,
  },
  cardSection: {
    backgroundColor: 'rgba(15, 36, 26, 0.85)',
    borderColor: 'rgba(203, 178, 106, 0.2)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionLabel: {
    ...Typography.labelUpper,
    color: Colors.goldLight,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  sectionHint: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontSize: 11,
    marginBottom: 12,
    lineHeight: 16,
  },
  textInput: {
    backgroundColor: 'rgba(6, 19, 13, 0.9)',
    borderColor: Colors.borderSubtle,
    borderWidth: 1,
    borderRadius: 8,
    color: Colors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    fontWeight: '600',
  },
  selectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  countPill: {
    flex: 1,
    marginHorizontal: 3,
    backgroundColor: 'rgba(6, 19, 13, 0.9)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countPillSelected: {
    backgroundColor: Colors.gold,
    borderColor: Colors.goldLight,
  },
  countPillNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  countPillNumberSelected: {
    color: '#13110a',
  },
  countPillLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.3,
  },
  countPillLabelSelected: {
    color: '#13110a',
  },
  rosterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  hostRosterRow: {
    backgroundColor: 'rgba(203, 178, 106, 0.08)',
    borderRadius: 6,
    borderColor: 'rgba(203, 178, 106, 0.2)',
    borderWidth: 1,
    marginBottom: 4,
  },
  rosterAvatarBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  botAvatarBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
  },
  avatarLetter: {
    color: '#13110a',
    fontSize: 12,
    fontWeight: '800',
  },
  rosterDetails: {
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rosterName: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: 12,
  },
  hostPill: {
    backgroundColor: 'rgba(203, 178, 106, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: Colors.gold,
  },
  hostPillText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: Colors.goldLight,
    letterSpacing: 0.5,
  },
  botPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  botPillText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  rosterSub: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
  },
  startBtn: {
    marginTop: 6,
    paddingVertical: 15,
  },
  startBtnText: {
    fontSize: 13.5,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
