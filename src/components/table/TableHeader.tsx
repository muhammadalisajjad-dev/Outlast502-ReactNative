import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { triggerHaptic } from '../../utils/haptics';
import { BarChart3, BookOpen } from 'lucide-react-native';

interface TableHeaderProps {
  roundNumber: number;
  activePlayerName: string;
  isMyTurn: boolean;
  onOpenScoreboard: () => void;
  onOpenRules: () => void;
}

const toRoman = (value: number): string => {
  const numerals: Array<[number, string]> = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let remaining = Math.max(1, Math.floor(value));
  let result = '';
  numerals.forEach(([amount, numeral]) => {
    while (remaining >= amount) {
      result += numeral;
      remaining -= amount;
    }
  });
  return result;
};

export const TableHeader: React.FC<TableHeaderProps> = ({
  roundNumber,
  activePlayerName,
  isMyTurn,
  onOpenScoreboard,
  onOpenRules,
}) => {
  const turnLabel = isMyTurn
    ? 'Your turn'
    : `${activePlayerName} to act`;

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.mark}>
          <Text style={styles.markText}>502</Text>
        </View>
        <View>
          <Text style={styles.title}>Outlast 502</Text>
          <Text style={styles.round}>Round {toRoman(roundNumber)}</Text>
        </View>
      </View>

      <View style={styles.center}>
        <View
          style={[styles.turnDot, isMyTurn && styles.turnDotActive]}
          pointerEvents="none"
        />
        <Text
          style={[styles.turnText, isMyTurn && styles.turnTextActive]}
          numberOfLines={1}
        >
          {turnLabel}
        </Text>
      </View>

      <View style={styles.right}>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={() => {
            triggerHaptic('light');
            onOpenScoreboard();
          }}
          accessibilityLabel="Open Scoreboard"
        >
          <BarChart3 size={15} color={Colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={() => {
            triggerHaptic('light');
            onOpenRules();
          }}
          accessibilityLabel="Open Rules"
        >
          <BookOpen size={15} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.line,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 132,
  },
  mark: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: Colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  markText: {
    fontFamily: Typography.cardRank.fontFamily,
    fontSize: 11,
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: 0.2,
  },
  title: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  round: {
    ...Typography.micro,
    color: Colors.textMuted,
    fontSize: 7,
    letterSpacing: 1.1,
    marginTop: 1,
  },
  center: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  turnDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.lineStrong,
    marginRight: 6,
  },
  turnDotActive: {
    backgroundColor: Colors.accent,
  },
  turnText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontSize: 10.5,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  turnTextActive: {
    color: Colors.textPrimary,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 132,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    backgroundColor: Colors.paperFaint,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
