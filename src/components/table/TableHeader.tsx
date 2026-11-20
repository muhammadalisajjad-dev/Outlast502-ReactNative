import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { triggerHaptic } from '../../utils/haptics';

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
      <View style={styles.leftCol}>
        <Text style={styles.gameTitle}>OUTLAST 502</Text>
        <Text style={styles.roundText}>Round {roundNumber}</Text>
      </View>

      {/* Turn Banner */}
      <View
        style={[
          styles.turnBanner,
          isMyTurn ? styles.myTurnBanner : styles.otherTurnBanner,
        ]}
      >
        <Text
          style={[
            styles.turnBannerText,
            isMyTurn ? styles.myTurnBannerText : styles.otherTurnBannerText,
          ]}
        >
          {isMyTurn ? '⚡ YOUR TURN' : `⏳ ${activePlayerName}'s Turn`}
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.rightCol}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => {
            triggerHaptic('light');
            onOpenScoreboard();
          }}
        >
          <Text style={styles.iconBtnText}>📊</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => {
            triggerHaptic('light');
            onOpenRules();
          }}
        >
          <Text style={styles.iconBtnText}>📖</Text>
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
    backgroundColor: 'rgba(6, 26, 17, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
  },
  leftCol: {
    alignItems: 'flex-start',
  },
  gameTitle: {
    ...Typography.badge,
    color: Colors.gold,
    letterSpacing: 1.5,
  },
  roundText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  turnBanner: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  turnBannerText: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
  myTurnBanner: {
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
    borderColor: Colors.playableLime,
  },
  myTurnBannerText: {
    color: Colors.playableLime,
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  otherTurnBanner: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  otherTurnBannerText: {
    color: Colors.goldLight,
    fontWeight: '600',
    fontSize: 11,
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  iconBtnText: {
    fontSize: 14,
  },
});
