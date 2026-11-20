import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

interface RulesScreenProps {
  onBack: () => void;
}

export const RulesScreen: React.FC<RulesScreenProps> = ({ onBack }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>OFFICIAL 502 RULES</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Goal Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎯 Objective of 502</Text>
          <Text style={styles.bodyText}>
            502 is a fast shedding card game for 2 to 6 players played with a
            standard 52-card deck (no jokers). The goal is to get rid of all your
            cards. Cards remaining in your hand at round end become penalty
            points.
          </Text>
          <Text style={[styles.bodyText, { marginTop: 8, color: Colors.crimsonLight, fontWeight: '700' }]}>
            Any player who reaches 502 points is eliminated. The last survivor wins!
          </Text>
        </View>

        {/* Turn Flow */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔄 Turn & Setup</Text>
          <Text style={styles.bulletPoint}>
            • <Text style={styles.boldText}>Dealing:</Text> 7 cards dealt to each active player.
          </Text>
          <Text style={styles.bulletPoint}>
            • <Text style={styles.boldText}>Neutral Opening Card:</Text> If the opening card is a 2, Jack, Ace, 7♥, or 8, it is put at the bottom of the deck until a neutral card appears.
          </Text>
          <Text style={styles.bulletPoint}>
            • <Text style={styles.boldText}>Normal Turn:</Text> Play 1 card matching the discard top by suit or rank, or draw 1 card.
          </Text>
          <Text style={styles.bulletPoint}>
            • <Text style={styles.boldText}>Drawing Ends Turn:</Text> Drawing ends your turn immediately. You cannot play the drawn card on that turn.
          </Text>
          <Text style={styles.bulletPoint}>
            • <Text style={styles.boldText}>Voluntary Draw:</Text> You may draw even when you hold a playable card.
          </Text>
        </View>

        {/* Special Cards */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚡ Special Cards</Text>

          <View style={styles.specialCardItem}>
            <Text style={styles.specialCardName}>👑 7 of Hearts (7♥) — Instant Win</Text>
            <Text style={styles.bodyText}>
              Wild card. Immediately ends the round with the player as winner,
              regardless of remaining cards. However, cards left in their hand
              still count as penalty points!
            </Text>
          </View>

          <View style={styles.specialCardItem}>
            <Text style={styles.specialCardName}>🃏 Jack (any suit) — Wild Suit Demand</Text>
            <Text style={styles.bodyText}>
              Can be played on any card. Player declares a suit. The next player
              must follow that suit, answer with another Jack or 7♥, or draw.
            </Text>
          </View>

          <View style={styles.specialCardItem}>
            <Text style={styles.specialCardName}>⚔️ 2 (any suit) — Draw 2 (Stackable)</Text>
            <Text style={styles.bodyText}>
              Next player must draw 2 cards. Can be answered with another 2,
              stacking the penalty (+2 each time: 2, 4, 6, 8). The first player
              who cannot or will not add a 2 draws the accumulated total.
            </Text>
          </View>

          <View style={styles.specialCardItem}>
            <Text style={styles.specialCardName}>🗡️ Ace of Spades (A♠) — Draw 5</Text>
            <Text style={styles.bodyText}>
              Next player owes 5 cards. Can be passed by playing any other Ace
              (A♥, A♦, A♣). The penalty remains 5 cards (never grows).
            </Text>
          </View>

          <View style={styles.specialCardItem}>
            <Text style={styles.specialCardName}>🛑 8 (any suit) — Skip</Text>
            <Text style={styles.bodyText}>
              Next player loses their turn without drawing. Can be countered with
              another 8 to pass the skip onward.
            </Text>
          </View>
        </View>

        {/* Penalty Priority Rule */}
        <View style={[styles.card, { borderColor: Colors.crimsonLight }]}>
          <Text style={[styles.cardTitle, { color: Colors.crimsonLight }]}>
            ⚠️ Crucial Rule: Penalties Come First!
          </Text>
          <Text style={styles.bodyText}>
            When a 2-penalty, A♠-penalty, or 8-skip is waiting for you, normal
            play is strictly paused.
          </Text>
          <Text style={[styles.bodyText, { marginTop: 6, fontWeight: '700', color: Colors.goldLight }]}>
            A Jack or 7♥ CANNOT cancel a pending penalty! You may only play the
            matching counter (2, Ace, or 8) or accept the penalty.
          </Text>
        </View>

        {/* Scoring Table */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Penalty Point Table</Text>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>7 of Hearts (7♥) & Ace of Spades (A♠)</Text>
            <Text style={styles.scoreValue}>100 pts</Text>
          </View>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>2, 8, and Jack (any suit)</Text>
            <Text style={styles.scoreValue}>30 pts</Text>
          </View>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>A♥, A♦, and A♣ (other Aces)</Text>
            <Text style={styles.scoreValue}>20 pts</Text>
          </View>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>10, Queen, King (10, Q, K)</Text>
            <Text style={styles.scoreValue}>10 pts</Text>
          </View>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>3, 4, 5, 6, 9, other 7s (7♠, 7♦, 7♣)</Text>
            <Text style={styles.scoreValue}>5 pts</Text>
          </View>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Empty hand round winner</Text>
            <Text style={styles.scoreValue}>0 pts</Text>
          </View>
        </View>

        {/* Elimination & Protection */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🛡️ Elimination & Protection</Text>
          <Text style={styles.bulletPoint}>
            • <Text style={styles.boldText}>502 Threshold:</Text> Players reaching 502 points are eliminated.
          </Text>
          <Text style={styles.bulletPoint}>
            • <Text style={styles.boldText}>Round Winner Immunity:</Text> The round winner is immune from elimination in that round, even if their score crosses 502 (e.g. from 7♥ remaining hand points). They are evaluated again next round.
          </Text>
          <Text style={styles.bulletPoint}>
            • <Text style={styles.boldText}>Tie-Break:</Text> If all remaining players cross 502 in the same round, the player with the lowest score wins.
          </Text>
          <Text style={styles.bulletPoint}>
            • <Text style={styles.boldText}>Next Round Starter:</Text> The winner of the previous round always starts the next round.
          </Text>
        </View>
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
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
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
  title: {
    ...Typography.titleSmall,
    color: Colors.gold,
    letterSpacing: 1.5,
  },
  container: {
    padding: 16,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Colors.surfaceCard,
    borderColor: Colors.borderSubtle,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  cardTitle: {
    ...Typography.titleSmall,
    fontSize: 15,
    color: Colors.goldLight,
    marginBottom: 8,
  },
  bodyText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  bulletPoint: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: 6,
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  specialCardItem: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  specialCardName: {
    ...Typography.bodyMedium,
    color: Colors.goldLight,
    fontWeight: '700',
    marginBottom: 3,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  scoreLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    flex: 1,
  },
  scoreValue: {
    ...Typography.bodySmall,
    color: Colors.goldLight,
    fontWeight: '800',
    marginLeft: 10,
  },
});
