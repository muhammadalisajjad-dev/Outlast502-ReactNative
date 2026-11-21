import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { triggerHaptic } from '../../utils/haptics';
import { BarChart3, BookOpen } from 'lucide-react-native';
import { Monogram, BrassDiamond } from '../common/Deco';

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
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 1],
  });

  const turnLabel = isMyTurn ? 'YOUR TURN' : `${activePlayerName.toUpperCase()} TO ACT`;

  return (
    <View style={styles.container}>
      <View style={styles.leftCol}>
        <Monogram size={28} />
        <View style={styles.roundBlock}>
          <Text style={styles.gameTitle}>OUTLAST 502</Text>
          <Text style={styles.roundText}>ROUND {toRoman(roundNumber)}</Text>
        </View>
      </View>

      <Animated.View style={styles.turnBlock}>
        <Animated.View style={{ opacity: isMyTurn ? pulseOpacity : 0.5 }}>
          <BrassDiamond size={5} filled={isMyTurn} />
        </Animated.View>
        <Text
          style={[styles.turnText, isMyTurn && styles.turnTextActive]}
          numberOfLines={1}
        >
          {turnLabel}
        </Text>
      </Animated.View>

      <View style={styles.rightCol}>
        <TouchableOpacity
          style={styles.iconBtn}
          activeOpacity={0.7}
          onPress={() => {
            triggerHaptic('light');
            onOpenScoreboard();
          }}
          accessibilityLabel="Open Scoreboard"
        >
          <BarChart3 size={14} color={Colors.brassLight} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconBtn}
          activeOpacity={0.7}
          onPress={() => {
            triggerHaptic('light');
            onOpenRules();
          }}
          accessibilityLabel="Open Rules"
        >
          <BookOpen size={14} color={Colors.brassLight} />
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
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(198, 164, 96, 0.18)',
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 118,
  },
  roundBlock: {
    marginLeft: 8,
  },
  gameTitle: {
    ...Typography.micro,
    color: Colors.brassLight,
    fontSize: 7.5,
    letterSpacing: 1.6,
  },
  roundText: {
    ...Typography.micro,
    color: Colors.textMuted,
    fontSize: 7,
    letterSpacing: 1.2,
    marginTop: 2,
  },
  turnBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  turnText: {
    ...Typography.micro,
    color: Colors.textSecondary,
    fontSize: 7.5,
    letterSpacing: 1.4,
    marginLeft: 6,
  },
  turnTextActive: {
    color: Colors.brassLight,
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 118,
  },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 0.7,
    borderColor: 'rgba(198, 164, 96, 0.35)',
    backgroundColor: 'rgba(198, 164, 96, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
