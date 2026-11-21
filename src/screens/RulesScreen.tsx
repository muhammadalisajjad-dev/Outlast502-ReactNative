import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useResponsiveInsets } from '../hooks/useResponsiveInsets';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import {
  DecoBackdrop,
  ClubHeader,
  LedgerSection,
  OrnamentDivider,
  BrassDiamond,
} from '../components/common/Deco';

interface RulesScreenProps {
  onBack: () => void;
}

const Bullet: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={styles.bulletRow}>
    <BrassDiamond size={4} style={styles.bulletDiamond} />
    <Text style={styles.bulletText}>{children}</Text>
  </View>
);

const SpecialCard: React.FC<{
  rank: string;
  suit: string;
  red?: boolean;
  name: string;
  children: React.ReactNode;
  last?: boolean;
}> = ({ rank, suit, red = false, name, children, last = false }) => (
  <View style={[styles.specialRow, last && styles.specialRowLast]}>
    <View style={styles.cardBadge}>
      <Text style={[styles.cardBadgeRank, red && styles.cardBadgeRed]}>{rank}</Text>
      <Text style={[styles.cardBadgeSuit, red && styles.cardBadgeRed]}>{suit}</Text>
    </View>
    <View style={styles.specialContent}>
      <Text style={styles.specialName}>{name}</Text>
      <Text style={styles.specialBody}>{children}</Text>
    </View>
  </View>
);

export const RulesScreen: React.FC<RulesScreenProps> = ({ onBack }) => {
  const insets = useResponsiveInsets();

  return (
    <View style={styles.safeArea}>
      <DecoBackdrop variant="screen" />
      <ClubHeader title="OFFICIAL 502 RULES" onBack={onBack} />

      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: Math.max(insets.bottom + 28, 40) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.pageKicker}>THE HOUSE RULES · 502</Text>
          <Text style={styles.pageTitle}>The Book</Text>
          <Text style={styles.pageSub}>
            A shedding game for two to six. Empty your hand. Avoid the debt. Outlast the table.
          </Text>

          <OrnamentDivider style={styles.divider} />

          <LedgerSection first numeral="I" title="THE OBJECT">
            <Text style={styles.bodyText}>
              502 is an intense card shedding game for 2 to 6 participants played with a standard
              52-card deck (no jokers). The goal is to empty your hand. Unplayed cards remaining
              in hand at round end convert into penalty points.
            </Text>
            <View style={styles.callout}>
              <Text style={styles.calloutLabel}>THE HOUSE LIMIT</Text>
              <Text style={styles.calloutText}>
                Any player accumulating 502 or more points is eliminated. The last surviving
                player wins the match.
              </Text>
            </View>
          </LedgerSection>

          <LedgerSection numeral="II" title="THE DEAL & TURN">
            <Bullet>
              <Text style={styles.boldText}>Initial Deal: </Text>
              7 cards dealt to each active player.
            </Bullet>
            <Bullet>
              <Text style={styles.boldText}>Neutral Opening Card: </Text>
              If the starter card is a 2, Jack, Ace, or 7♥, it is tucked to the deck bottom
              until a neutral card appears.
            </Bullet>
            <Bullet>
              <Text style={styles.boldText}>Matching: </Text>
              Play 1 card matching the discard top by suit or rank, or draw 1 card.
            </Bullet>
            <Bullet>
              <Text style={styles.boldText}>Turn Termination: </Text>
              Drawing from the deck immediately concludes your turn; the drawn card cannot be
              played on that turn.
            </Bullet>
            <Bullet>
              <Text style={styles.boldText}>Voluntary Draw: </Text>
              Players may draw voluntarily even when holding playable cards.
            </Bullet>
          </LedgerSection>

          <LedgerSection numeral="III" title="THE POWERS">
            <SpecialCard rank="7" suit="♥" red name="7 of Hearts — Instant Victory">
              Wild card. Immediately concludes the round in victory, regardless of other cards
              held. However, unplayed cards left in hand still count as penalty points! Protected
              from elimination.
            </SpecialCard>

            <SpecialCard rank="J" suit="♠" name="Jack — Wild Suit Demand">
              Playable on any normal card. The player declares a suit. The next participant must
              follow that suit, answer with another Jack or 7♥, or draw.
            </SpecialCard>

            <SpecialCard rank="2" suit="♦" red name="2 — Draw 2 (Stackable: 2, 4, 6, 8)">
              Next player owes 2 cards. Can be answered with another 2, passing and incrementing
              the penalty (+2 each time up to 8). The first player unable or unwilling to add a 2
              draws the entire stack.
            </SpecialCard>

            <SpecialCard rank="A" suit="♠" name="Ace of Spades — Draw 5 (Passable)">
              Next player owes 5 cards. Can be passed by playing any other Ace (A♥, A♦, A♣). The
              penalty remains fixed at 5 cards (never stacks). Other Aces have no special effect
              except passing A♠.
            </SpecialCard>

            <SpecialCard rank="8" suit="♣" name="8 — Skip Next Player" last>
              Skips the next player's turn. Can be answered with another 8 to pass the skip onward.
            </SpecialCard>
          </LedgerSection>

          <LedgerSection
            numeral="IV"
            title="THE LEDGER"
            subtitle="Assessed for unplayed cards remaining in hand at round completion."
          >
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>CARD RANK</Text>
              <Text style={styles.tableHeaderText}>PENALTY</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.tableCol}>Numbered Cards (3–10)</Text>
              <Text style={styles.tableColRight}>Face value</Text>
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
              <Text style={[styles.tableColRight, { color: Colors.crimsonLight }]}>
                50 points
              </Text>
            </View>
            <View style={[styles.tableRow, styles.tableRowLast]}>
              <Text style={styles.tableCol}>7 of Hearts (7♥)</Text>
              <Text style={[styles.tableColRight, { color: Colors.brassLight }]}>
                0 points · free wild
              </Text>
            </View>
          </LedgerSection>

          <LedgerSection numeral="V" title="THE FINAL WORD">
            <Text style={styles.bodyText}>
              If a player wins a round by shedding a 2 or A♠ as their final card, the next player
              in sequence MUST draw the full penalty (2 or 5 cards) before round scoring begins,
              without opportunity to answer.
            </Text>
            <View style={styles.finalOrnament}>
              <View style={styles.finalLine} />
              <BrassDiamond size={4} />
              <View style={styles.finalLine} />
            </View>
          </LedgerSection>
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
    maxWidth: 440,
  },
  divider: {
    marginTop: 16,
    marginBottom: 18,
  },
  bodyText: {
    ...Typography.serifBody,
    color: Colors.textSecondary,
    fontSize: 13.5,
    lineHeight: 21,
  },
  callout: {
    marginTop: 14,
    paddingLeft: 12,
    borderLeftWidth: 1.5,
    borderLeftColor: Colors.burgundyLight,
  },
  calloutLabel: {
    ...Typography.micro,
    color: Colors.crimsonLight,
    fontSize: 6.4,
    letterSpacing: 1.5,
    marginBottom: 3,
  },
  calloutText: {
    ...Typography.serifBody,
    color: '#D9A9AF',
    fontSize: 13,
    lineHeight: 20,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bulletDiamond: {
    marginTop: 7,
    marginRight: 9,
  },
  bulletText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    fontSize: 12.5,
    flex: 1,
    lineHeight: 19,
  },
  boldText: {
    fontWeight: '700',
    color: Colors.ivory,
  },
  specialRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(198, 164, 96, 0.13)',
  },
  specialRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },
  cardBadge: {
    width: 34,
    height: 44,
    backgroundColor: Colors.cardIvoryInner,
    borderWidth: 0.8,
    borderColor: Colors.cardBorder,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  cardBadgeRank: {
    fontFamily: Typography.titleSmall.fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.cardBlackSuit,
    lineHeight: 17,
  },
  cardBadgeSuit: {
    fontSize: 12,
    color: Colors.cardBlackSuit,
    lineHeight: 13,
  },
  cardBadgeRed: {
    color: Colors.cardRedSuit,
  },
  specialContent: {
    flex: 1,
  },
  specialName: {
    ...Typography.serifSubheading,
    color: Colors.ivory,
    fontSize: 16,
    marginBottom: 3,
  },
  specialBody: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontSize: 11.5,
    lineHeight: 17,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 0.8,
    borderBottomColor: 'rgba(198, 164, 96, 0.35)',
  },
  tableHeaderText: {
    ...Typography.micro,
    color: Colors.brassLight,
    fontSize: 6.4,
    letterSpacing: 1.4,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(198, 164, 96, 0.12)',
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableCol: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontSize: 11.5,
    flex: 1,
    paddingRight: 10,
  },
  tableColRight: {
    fontFamily: Typography.numeral.fontFamily,
    color: Colors.ivory,
    fontSize: 13,
    textAlign: 'right',
  },
  finalOrnament: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },
  finalLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(198, 164, 96, 0.2)',
  },
});
