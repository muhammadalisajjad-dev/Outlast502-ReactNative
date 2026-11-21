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
import {
  DecoBackdrop,
  ClubHeader,
  LedgerSection,
  OrnamentDivider,
  BrassDiamond,
} from '../components/common/Deco';

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

const SEAT_TONES = [
  { bg: '#173B2E', ring: '#C6A460' },
  { bg: '#4A1D26', ring: '#C9A36A' },
  { bg: '#263B2A', ring: '#D8C08A' },
  { bg: '#1D2D38', ring: '#B9A27A' },
  { bg: '#3A2A1E', ring: '#D0B47C' },
];

const SEAT_LABELS: Record<number, string> = {
  2: 'DUEL',
  3: 'TRIO',
  4: 'CLASSIC',
  5: 'FIVE',
  6: 'FULL HOUSE',
};

export const SetupScreen: React.FC<SetupScreenProps> = ({
  onBack,
  onStartGame,
}) => {
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
      <DecoBackdrop variant="screen" />
      <ClubHeader title="MATCH SETUP" onBack={onBack} />

      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: Math.max(insets.bottom + 28, 40) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.pageKicker}>PRIVATE TABLE · HOUSE RULES</Text>
          <Text style={styles.pageTitle}>The Guest List</Text>
          <Text style={styles.pageSub}>
            Name the host, choose the number of seats, and take your place at the table.
          </Text>

          <OrnamentDivider style={styles.divider} />

          <LedgerSection
            first
            numeral="I"
            title="HOST IDENTITY"
            subtitle="The name that will be carved into the score ledger."
          >
            <TextInput
              value={playerName}
              onChangeText={setPlayerName}
              maxLength={16}
              placeholder="Enter name"
              placeholderTextColor={Colors.textMuted}
              style={styles.textInput}
              selectionColor={Colors.brassLight}
            />
            <View style={styles.inputRule} />
          </LedgerSection>

          <LedgerSection
            numeral="II"
            title="TABLE SEATS"
            subtitle={`One human against ${playerCount - 1} automata. The house permits two to six seats.`}
          >
            <View style={styles.selectorRow}>
              {[2, 3, 4, 5, 6].map(count => {
                const isSelected = count === playerCount;
                return (
                  <TouchableOpacity
                    key={count}
                    onPress={() => handleSelectCount(count)}
                    style={[
                      styles.countTile,
                      isSelected && styles.countTileSelected,
                    ]}
                    activeOpacity={0.75}
                  >
                    {isSelected && (
                      <BrassDiamond
                        size={4}
                        filled
                        style={styles.selectedDiamond}
                      />
                    )}
                    <Text
                      style={[
                        styles.countNumber,
                        isSelected && styles.countNumberSelected,
                      ]}
                    >
                      {count}
                    </Text>
                    <Text
                      style={[
                        styles.countLabel,
                        isSelected && styles.countLabelSelected,
                      ]}
                    >
                      {SEAT_LABELS[count]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </LedgerSection>

          <LedgerSection
            numeral="III"
            title="SEATING ORDER"
            subtitle="Play proceeds clockwise from the host in the opening round."
          >
            <View style={styles.hostRow}>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: '#173B2E', borderColor: Colors.brass },
                ]}
              >
                <Text style={styles.avatarLetter}>
                  {playerName.trim().charAt(0).toUpperCase() || 'Y'}
                </Text>
              </View>
              <View style={styles.rosterDetails}>
                <View style={styles.nameLine}>
                  <Text style={styles.rosterName}>{playerName.trim() || 'You'}</Text>
                  <Text style={styles.hostLabel}>HOST</Text>
                </View>
                <Text style={styles.rosterRole}>Manual decision engine</Text>
              </View>
              <Text style={styles.seatNumber}>SEAT I</Text>
            </View>

            {activeBots.map((bot, idx) => {
              const tone = SEAT_TONES[(idx + 1) % SEAT_TONES.length];
              return (
                <View key={bot.name} style={styles.rosterRow}>
                  <View
                    style={[
                      styles.avatar,
                      { backgroundColor: tone.bg, borderColor: tone.ring },
                    ]}
                  >
                    <Text style={styles.avatarLetter}>
                      {bot.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.rosterDetails}>
                    <View style={styles.nameLine}>
                      <Text style={styles.rosterName}>{bot.name}</Text>
                      <Text style={styles.botLabel}>AUTOMATON</Text>
                    </View>
                    <Text style={styles.rosterRole}>{bot.role}</Text>
                  </View>
                  <Text style={styles.seatNumber}>
                    SEAT {['II', 'III', 'IV', 'V', 'VI'][idx]}
                  </Text>
                </View>
              );
            })}
          </LedgerSection>

          <Button
            title={`DEAL THE CARDS · ${playerCount} SEATS`}
            variant="gold"
            size="large"
            onPress={handleStart}
            style={styles.startBtn}
            textStyle={styles.startBtnText}
          />

          <View style={styles.houseNote}>
            <BrassDiamond size={3.5} />
            <Text style={styles.houseNoteText}>
              THE HOUSE DEALS SEVEN CARDS TO EVERY SEAT
            </Text>
            <BrassDiamond size={3.5} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.ink,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  content: {
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center',
  },
  pageKicker: {
    ...Typography.micro,
    color: Colors.brass,
    fontSize: 7.2,
    letterSpacing: 2.6,
  },
  pageTitle: {
    ...Typography.serifDisplay,
    color: Colors.ivory,
    fontSize: 32,
    marginTop: 4,
  },
  pageSub: {
    ...Typography.serifItalic,
    color: Colors.textSecondary,
    fontSize: 13.5,
    lineHeight: 20,
    marginTop: 4,
    maxWidth: 420,
  },
  divider: {
    marginTop: 16,
    marginBottom: 18,
  },
  textInput: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    color: Colors.ivory,
    paddingHorizontal: 0,
    paddingVertical: 8,
    fontFamily: Typography.serifHeading.fontFamily,
    fontSize: 22,
    letterSpacing: 0.4,
  },
  inputRule: {
    height: 1,
    backgroundColor: 'rgba(198, 164, 96, 0.35)',
  },
  selectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 2,
  },
  countTile: {
    flex: 1,
    marginHorizontal: 2.5,
    minHeight: 62,
    borderWidth: 0.7,
    borderColor: 'rgba(198, 164, 96, 0.22)',
    backgroundColor: 'rgba(198, 164, 96, 0.03)',
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  countTileSelected: {
    backgroundColor: 'rgba(18, 56, 44, 0.9)',
    borderColor: Colors.brass,
  },
  selectedDiamond: {
    position: 'absolute',
    top: 5,
  },
  countNumber: {
    fontFamily: Typography.serifHeading.fontFamily,
    fontSize: 21,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  countNumberSelected: {
    color: Colors.brassLight,
  },
  countLabel: {
    ...Typography.micro,
    color: Colors.textMuted,
    fontSize: 5.6,
    letterSpacing: 0.9,
    marginTop: 2,
  },
  countLabelSelected: {
    color: Colors.brassLight,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingLeft: 9,
    borderLeftWidth: 1.5,
    borderLeftColor: Colors.brass,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(198, 164, 96, 0.16)',
    marginBottom: 2,
  },
  rosterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingLeft: 9,
    borderLeftWidth: 1.5,
    borderLeftColor: 'transparent',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(198, 164, 96, 0.12)',
  },
  avatar: {
    width: 31,
    height: 31,
    borderRadius: 15.5,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  avatarLetter: {
    color: Colors.ivory,
    fontFamily: Typography.titleSmall.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  rosterDetails: {
    flex: 1,
  },
  nameLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  rosterName: {
    ...Typography.serifSubheading,
    color: Colors.ivory,
    fontSize: 16,
    marginRight: 8,
  },
  hostLabel: {
    ...Typography.micro,
    color: Colors.brassLight,
    fontSize: 6.4,
    letterSpacing: 1.2,
  },
  botLabel: {
    ...Typography.micro,
    color: Colors.textMuted,
    fontSize: 6.2,
    letterSpacing: 1.1,
  },
  rosterRole: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontSize: 10.5,
    marginTop: 1,
  },
  seatNumber: {
    ...Typography.micro,
    color: 'rgba(198, 164, 96, 0.6)',
    fontSize: 6.2,
    letterSpacing: 1.1,
    marginLeft: 8,
  },
  startBtn: {
    marginTop: 28,
    paddingVertical: 16,
  },
  startBtnText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  houseNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  houseNoteText: {
    ...Typography.micro,
    color: 'rgba(201, 185, 154, 0.45)',
    fontSize: 6.2,
    letterSpacing: 1.5,
    marginHorizontal: 9,
  },
});
