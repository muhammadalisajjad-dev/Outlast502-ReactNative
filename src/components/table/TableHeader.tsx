import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { triggerHaptic } from '../../utils/haptics';
import { BarChart3, BookOpen, Zap, Clock } from 'lucide-react-native';

interface TableHeaderProps {
  roundNumber: number;
  activePlayerName: string;
  isMyTurn: boolean;
  onOpenScoreboard: () => void;
  onOpenRules: () => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  roundNumber,
  activePlayerName,
  isMyTurn,
  onOpenScoreboard,
  onOpenRules,
}) => {
  return (
    <View style={styles.container}>
      {/* Brand & Round Info */}
      <View style={styles.leftCol}>
        <Text style={styles.gameTitle}>OUTLAST 502</Text>
        <Text style={styles.roundText}>ROUND {roundNumber}</Text>
      </View>

      {/* Turn Banner */}
      <View
        style={[
          styles.turnBanner,
          isMyTurn ? styles.myTurnBanner : styles.otherTurnBanner,
        ]}
      >
        {isMyTurn ? (
          <Zap size={11} color={Colors.playableMint} style={{ marginRight: 5 }} />
        ) : (
          <Clock size={11} color={Colors.textMuted} style={{ marginRight: 5 }} />
        )}
        <Text
          style={[
            styles.turnBannerText,
            isMyTurn ? styles.myTurnBannerText : styles.otherTurnBannerText,
          ]}
        >
          {isMyTurn ? 'YOUR TURN' : `${activePlayerName.toUpperCase()}'S TURN`}
        </Text>
      </View>

      {/* Top Action Buttons (Scoreboard & Rules) */}
      <View style={styles.rightCol}>
        <TouchableOpacity
          style={styles.iconBtn}
          activeOpacity={0.75}
          onPress={() => {
            triggerHaptic('light');
            onOpenScoreboard();
          }}
          accessibilityLabel="Open Scoreboard"
        >
          <BarChart3 size={15} color={Colors.goldLight} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconBtn}
          activeOpacity={0.75}
          onPress={() => {
            triggerHaptic('light');
            onOpenRules();
          }}
          accessibilityLabel="Open Rules"
        >
          <BookOpen size={15} color={Colors.goldLight} />
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
    backgroundColor: 'rgba(6, 19, 13, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(203, 178, 106, 0.15)',
  },
  leftCol: {
    alignItems: 'flex-start',
  },
  gameTitle: {
    ...Typography.badge,
    color: Colors.gold,
    fontSize: 11,
    letterSpacing: 1.6,
  },
  roundText: {
    ...Typography.bodySmall,
    fontSize: 9.5,
    color: Colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  turnBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  myTurnBanner: {
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    borderColor: 'rgba(52, 211, 153, 0.4)',
  },
  otherTurnBanner: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  turnBannerText: {
    ...Typography.badge,
    fontSize: 9.5,
  },
  myTurnBannerText: {
    color: Colors.playableMint,
  },
  otherTurnBannerText: {
    color: Colors.textSecondary,
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: 'rgba(203, 178, 106, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(203, 178, 106, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
