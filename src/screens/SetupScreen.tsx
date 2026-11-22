import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useResponsiveInsets } from '../hooks/useResponsiveInsets';
import { Button } from '../components/common/Button';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { useGame } from '../context/GameContext';
import { triggerHaptic } from '../utils/haptics';
import { Atmosphere, ScreenHeader, SectionHeading, Divider } from '../components/common/Chrome';

interface SetupScreenProps {
  onBack: () => void;
  onStartGame: () => void;
}

const ALL_BOTS = [
  { name: 'Marcus', role: 'Tactical aggressor' },
  { name: 'Sophia', role: 'Conservative counter' },
  { name: 'Elena', role: 'Penalty specialist' },
  { name: 'Liam', role: 'Adaptive shedder' },
  { name: 'Zoe', role: 'High-stakes gambler' },
];

const SEAT_LABELS: Record<number, string> = {
  2: 'Duel',
  3: 'Trio',
  4: 'Classic',
  5: 'Five',
  6: 'Full house',
};

export const SetupScreen: React.FC<SetupScreenProps> = ({ onBack, onStartGame }) => {
  const { startMatch } = useGame();
  const insets = useResponsiveInsets();
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
    <View style={styles.safeArea}>
      <Atmosphere variant="screen" />
      <ScreenHeader title="New match" onBack={onBack} />

      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: Math.max(insets.bottom + 28, 40) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.pageKicker}>Table setup</Text>
          <Text style={styles.pageTitle}>Choose your table</Text>
          <Text style={styles.pageSub}>
            Name the host, choose the number of seats, and take your place.
          </Text>

          <Divider style={styles.divider} />

          <SectionHeading index="01" title="Host" subtitle="The name that leads the first round." />
          <TextInput
            value={playerName}
            onChangeText={setPlayerName}
            maxLength={16}
            placeholder="Enter name"
            placeholderTextColor={Colors.textMuted}
            style={styles.textInput}
            selectionColor={Colors.accent}
          />
          <View style={styles.inputRule} />

          <SectionHeading index="02" title="Seats" subtitle={`One human against ${playerCount - 1} opponents. Two to six seats.`} style={styles.sectionSpacing} />
          <View style={styles.selectorRow}>
            {[2, 3, 4, 5, 6].map(count => {
              const isSelected = count === playerCount;
              return (
                <TouchableOpacity
                  key={count}
                  onPress={() => handleSelectCount(count)}
                  style={[styles.countTile, isSelected && styles.countTileSelected]}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.countNumber, isSelected && styles.countNumberSelected]}>
                    {count}
                  </Text>
                  <Text style={[styles.countLabel, isSelected && styles.countLabelSelected]}>
                    {SEAT_LABELS[count]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <SectionHeading index="03" title="Seating order" subtitle="Play proceeds clockwise from the host." style={styles.sectionSpacing} />
          <View style={styles.roster}>
            <View style={styles.hostRow}>
              <View style={[styles.avatar, { backgroundColor: Colors.surfaceElevated, borderColor: Colors.accent }]}>
                <Text style={styles.avatarLetter}>
                  {playerName.trim().charAt(0).toUpperCase() || 'Y'}
                </Text>
              </View>
              <View style={styles.rosterDetails}>
                <View style={styles.nameLine}>
                  <Text style={styles.rosterName}>{playerName.trim() || 'You'}</Text>
                  <Text style={styles.hostLabel}>Host</Text>
                </View>
                <Text style={styles.rosterRole}>Manual decisions</Text>
              </View>
              <Text style={styles.seatNumber}>Seat 1</Text>
            </View>

            {activeBots.map((bot, idx) => {
              const tone = ['#26362F', '#3A2B28', '#2B3530', '#32302A', '#253239'][idx % 5];
              return (
                <View key={bot.name} style={styles.rosterRow}>
                  <View style={[styles.avatar, { backgroundColor: tone, borderColor: Colors.lineStrong }]}>
                    <Text style={styles.avatarLetter}>{bot.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.rosterDetails}>
                    <View style={styles.nameLine}>
                      <Text style={styles.rosterName}>{bot.name}</Text>
                      <Text style={styles.botLabel}>Opponent</Text>
                    </View>
                    <Text style={styles.rosterRole}>{bot.role}</Text>
                  </View>
                  <Text style={styles.seatNumber}>Seat {idx + 2}</Text>
                </View>
              );
            })}
          </View>

          <Button
            title={`Deal cards · ${playerCount} seats`}
            variant="primary"
            size="large"
            onPress={handleStart}
            style={styles.startBtn}
            textStyle={styles.startBtnText}
          />

          <Text style={styles.houseNote}>Seven cards dealt to every seat.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.ink },
  container: { paddingHorizontal: 20, paddingTop: 18 },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center' },
  pageKicker: { ...Typography.micro, color: Colors.textMuted, fontSize: 8, letterSpacing: 1.6, marginBottom: 4 },
  pageTitle: { ...Typography.titleLarge, color: Colors.textPrimary, fontSize: 28, letterSpacing: -0.8 },
  pageSub: { ...Typography.bodyMedium, color: Colors.textSecondary, fontSize: 13.5, lineHeight: 20, marginTop: 4, maxWidth: 420 },
  divider: { marginTop: 18, marginBottom: 20 },
  sectionSpacing: { marginTop: 22 },
  textInput: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    color: Colors.textPrimary,
    paddingHorizontal: 0,
    paddingVertical: 10,
    fontFamily: Typography.titleMedium.fontFamily,
    fontSize: 20,
    letterSpacing: -0.2,
  },
  inputRule: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.lineStrong },
  selectorRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 4, gap: 6 },
  countTile: {
    flex: 1,
    minHeight: 58,
    borderWidth: 1,
    borderColor: Colors.line,
    backgroundColor: Colors.paperFaint,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  countTileSelected: {
    backgroundColor: Colors.accentMuted,
    borderColor: Colors.accent,
  },
  countNumber: {
    fontFamily: Typography.titleMedium.fontFamily,
    fontSize: 20,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  countNumberSelected: { color: Colors.accentSoft },
  countLabel: {
    ...Typography.micro,
    color: Colors.textMuted,
    fontSize: 7,
    letterSpacing: 0.8,
    marginTop: 2,
    textTransform: 'none',
  },
  countLabelSelected: { color: Colors.accentSoft },
  roster: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.line,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.line,
  },
  rosterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.line,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarLetter: {
    color: Colors.textPrimary,
    fontFamily: Typography.titleSmall.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  rosterDetails: { flex: 1 },
  nameLine: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  rosterName: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  hostLabel: {
    ...Typography.micro,
    color: Colors.accentSoft,
    fontSize: 7,
    letterSpacing: 1,
  },
  botLabel: {
    ...Typography.micro,
    color: Colors.textMuted,
    fontSize: 7,
    letterSpacing: 1,
  },
  rosterRole: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  seatNumber: {
    ...Typography.micro,
    color: Colors.textMuted,
    fontSize: 7,
    letterSpacing: 1,
    marginLeft: 8,
  },
  startBtn: { marginTop: 28, paddingVertical: 16 },
  startBtnText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.4 },
  houseNote: {
    ...Typography.micro,
    color: Colors.textMuted,
    fontSize: 7.5,
    letterSpacing: 1.2,
    textAlign: 'center',
    marginTop: 16,
  },
});
