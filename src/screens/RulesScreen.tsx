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
import {
  ChevronLeft,
  Shield,
  Zap,
  BookOpen,
  Crown,
  Layers,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react-native';

interface RulesScreenProps {
  onBack: () => void;
}

export const RulesScreen: React.FC<RulesScreenProps> = ({ onBack }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.75}>
          <ChevronLeft size={18} color={Colors.silverLight} style={{ marginRight: 2 }} />
          <Text style={styles.backBtnText}>BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>OFFICIAL 502 RULES</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Core Objective Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Shield size={14} color={Colors.cobaltLight} style={{ marginRight: 6 }} />
            <Text style={styles.cardTitle}>OBJECTIVE & SURVIVAL</Text>
          </View>
          <Text style={styles.bodyText}>
            502 is an intense card shedding game for 2 to 6 participants played with a standard 52-card deck (no jokers). The goal is to empty your hand. Unplayed cards remaining in hand at round end convert into penalty points.
          </Text>
          <View style={styles.calloutBox}>
            <Text style={styles.calloutText}>
              Any player accumulating 502 or more points is eliminated. The last surviving player wins the match.
            </Text>
          </View>
        </View>

        {/* Turn Flow Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Layers size={14} color={Colors.cobaltLight} style={{ marginRight: 6 }} />
            <Text style={styles.cardTitle}>TURN STRUCTURE & DEAL</Text>
          </View>

          <View style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText}>
              <Text style={styles.boldText}>Initial Deal:</Text> 7 cards dealt to each active player.
            </Text>
          </View>

          <View style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText}>
              <Text style={styles.boldText}>Neutral Opening Card:</Text> If the starter card is a 2, Jack, Ace, or 7♥, it is tucked to the deck bottom until a neutral card appears.
            </Text>
          </View>

          <View style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText}>
              <Text style={styles.boldText}>Matching:</Text> Play 1 card matching the discard top by suit or rank, or draw 1 card.
            </Text>
          </View>

          <View style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText}>
              <Text style={styles.boldText}>Turn Termination:</Text> Drawing from the deck immediately concludes your turn; the drawn card cannot be played on that turn.
            </Text>
          </View>

          <View style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText}>
              <Text style={styles.boldText}>Voluntary Draw:</Text> Players may draw voluntarily even when holding playable cards.
            </Text>
          </View>
        </View>

        {/* Action Cards Grid */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Zap size={14} color={Colors.cobaltLight} style={{ marginRight: 6 }} />
            <Text style={styles.cardTitle}>ACTION & PENALTY CARDS</Text>
          </View>

          <View style={styles.specialCardItem}>
            <View style={styles.cardLabelRow}>
              <Text style={styles.specialCardBadge}>7♥</Text>
              <Text style={styles.specialCardName}>7 of Hearts — Instant Victory</Text>
            </View>
            <Text style={styles.bodyText}>
              Wild card. Immediately concludes the round in victory, regardless of other cards held. However, unplayed cards left in hand still count as penalty points! Protected from elimination.
            </Text>
          </View>

          <View style={styles.specialCardItem}>
            <View style={styles.cardLabelRow}>
              <Text style={styles.specialCardBadge}>J</Text>
              <Text style={styles.specialCardName}>Jack — Wild Suit Demand</Text>
            </View>
            <Text style={styles.bodyText}>
              Playable on any normal card. The player declares a suit. The next participant must follow that suit, answer with another Jack or 7♥, or draw.
            </Text>
          </View>

          <View style={styles.specialCardItem}>
            <View style={styles.cardLabelRow}>
              <Text style={styles.specialCardBadge}>2</Text>
              <Text style={styles.specialCardName}>2 — Draw 2 (Stackable: 2, 4, 6, 8)</Text>
            </View>
            <Text style={styles.bodyText}>
              Next player owes 2 cards. Can be answered with another 2, passing and incrementing the penalty (+2 each time up to 8). The first player unable or unwilling to add a 2 draws the entire stack.
            </Text>
          </View>

          <View style={styles.specialCardItem}>
            <View style={styles.cardLabelRow}>
              <Text style={styles.specialCardBadge}>A♠</Text>
              <Text style={styles.specialCardName}>Ace of Spades — Draw 5 (Passable)</Text>
            </View>
            <Text style={styles.bodyText}>
              Next player owes 5 cards. Can be passed by playing any other Ace (A♥, A♦, A♣). The penalty remains fixed at 5 cards (never stacks). Other Aces have no special effect except passing A♠.
            </Text>
          </View>

          <View style={[styles.specialCardItem, { borderBottomWidth: 0 }]}>
            <View style={styles.cardLabelRow}>
              <Text style={styles.specialCardBadge}>8</Text>
              <Text style={styles.specialCardName}>8 — Skip Next Player</Text>
            </View>
            <Text style={styles.bodyText}>
              Skips the next player's turn. Can be answered with another 8 to pass the skip onward.
            </Text>
          </View>
        </View>

        {/* Scoring Table */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <BookOpen size={14} color={Colors.cobaltLight} style={{ marginRight: 6 }} />
            <Text style={styles.cardTitle}>PENALTY POINT VALUES</Text>
          </View>
          <Text style={styles.sectionHint}>
            Assessed for unplayed cards remaining in hand at round completion:
          </Text>

          <View style={styles.tableRowHeader}>
            <Text style={styles.tableColHeader}>Card Rank</Text>
            <Text style={styles.tableColHeaderRight}>Penalty Points</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol}>Numbered Cards (3–10)</Text>
            <Text style={styles.tableColRight}>Face value (3–10 pts)</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol}>Rank 2 (any suit)</Text>
            <Text style={styles.tableColRight}>20 points</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol}>Jack, Queen, King</Text>
            <Text style={styles.tableColRight}>10 points each</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol}>Standard Aces (A♥, A♦, A♣)</Text>
            <Text style={styles.tableColRight}>15 points each</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol}>Ace of Spades (A♠)</Text>
            <Text style={[styles.tableColRight, { color: Colors.crimsonLight, fontWeight: '700' }]}>
              50 points
            </Text>
          </View>
          <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.tableCol}>7 of Hearts (7♥)</Text>
            <Text style={[styles.tableColRight, { color: Colors.goldLight, fontWeight: '700' }]}>
              0 points (Free Wild)
            </Text>
          </View>
        </View>

        {/* End of Round Penalty Clause */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <AlertTriangle size={14} color={Colors.crimsonLight} style={{ marginRight: 6 }} />
            <Text style={styles.cardTitle}>FINAL CARD FORCED PENALTY</Text>
          </View>
          <Text style={styles.bodyText}>
            If a player wins a round by shedding a 2 or A♠ as their final card, the next player in sequence MUST draw the full penalty (2 or 5 cards) before round scoring begins, without opportunity to answer.
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
    borderBottomColor: 'rgba(203, 213, 225, 0.12)',
    backgroundColor: 'rgba(8, 12, 20, 0.95)',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  backBtnText: {
    ...Typography.badge,
    color: Colors.silverLight,
    fontSize: 10,
    letterSpacing: 1,
  },
  title: {
    ...Typography.badge,
    color: Colors.silverLight,
    fontSize: 12,
    letterSpacing: 1.8,
  },
  container: {
    padding: 18,
    paddingBottom: 36,
  },
  card: {
    backgroundColor: 'rgba(13, 21, 39, 0.85)',
    borderColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    ...Typography.labelUpper,
    color: Colors.cobaltLight,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  bodyText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontSize: 12.5,
  },
  calloutBox: {
    backgroundColor: 'rgba(185, 28, 28, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginTop: 10,
  },
  calloutText: {
    ...Typography.bodySmall,
    color: '#fca5a5',
    fontWeight: '700',
    fontSize: 11.5,
    lineHeight: 16,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.cobaltLight,
    marginTop: 7,
    marginRight: 8,
  },
  bulletText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  specialCardItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  specialCardBadge: {
    backgroundColor: Colors.cardIvory,
    color: Colors.cardBlackSuit,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    fontSize: 11,
    fontWeight: '900',
    marginRight: 8,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
  },
  specialCardName: {
    ...Typography.bodySmall,
    color: Colors.silverLight,
    fontWeight: '700',
    fontSize: 12.5,
  },
  sectionHint: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontSize: 11,
    marginBottom: 10,
  },
  tableRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(56, 189, 248, 0.25)',
    marginBottom: 4,
  },
  tableColHeader: {
    ...Typography.labelUpper,
    color: Colors.cobaltLight,
    fontSize: 9.5,
  },
  tableColHeaderRight: {
    ...Typography.labelUpper,
    color: Colors.cobaltLight,
    fontSize: 9.5,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  tableCol: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontSize: 12,
  },
  tableColRight: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    fontWeight: '600',
    fontSize: 12,
  },
});
