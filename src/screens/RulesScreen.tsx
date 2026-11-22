import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useResponsiveInsets } from '../hooks/useResponsiveInsets';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Atmosphere, ScreenHeader, SectionHeading, Divider } from '../components/common/Chrome';

interface RulesScreenProps {
  onBack: () => void;
}

const Bullet: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={styles.bulletRow}>
    <View style={styles.bulletDot} />
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
      <Atmosphere variant="screen" />
      <ScreenHeader title="Rules" onBack={onBack} />

      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: Math.max(insets.bottom + 28, 40) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.pageKicker}>House rules</Text>
          <Text style={styles.pageTitle}>The book</Text>
          <Text style={styles.pageSub}>
            A shedding game for two to six. Empty your hand. Avoid the debt. Outlast the table.
          </Text>

          <Divider style={styles.divider} />

          <SectionHeading index="01" title="The object">
            <Text style={styles.bodyText}>
              502 is an intense card shedding game for 2 to 6 participants played with a standard
              52-card deck (no jokers). The goal is to empty your hand. Unplayed cards remaining
              in hand at round end convert into penalty points.
            </Text>
            <View style={styles.callout}>
              <Text style={styles.calloutLabel}>The house limit</Text>
              <Text style={styles.calloutText}>
                Any player accumulating 502 or more points is eliminated. The last surviving
                player wins the match.
              </Text>
            </View>
          </SectionHeading>

          <SectionHeading index="02" title="The deal and turn" style={styles.sectionSpacing}>
            <Bullet><Text style={styles.boldText}>Initial deal: </Text>7 cards dealt to each active player.</Bullet>
            <Bullet><Text style={styles.boldText}>Neutral opening card: </Text>If the starter card is a 2, Jack, Ace, or 7♥, it is tucked to the deck bottom until a neutral card appears.</Bullet>
            <Bullet><Text style={styles.boldText}>Matching: </Text>Play 1 card matching the discard top by suit or rank, or draw 1 card.</Bullet>
            <Bullet><Text style={styles.boldText}>Turn termination: </Text>Drawing from the deck immediately concludes your turn; the drawn card cannot be played on that turn.</Bullet>
            <Bullet><Text style={styles.boldText}>Voluntary draw: </Text>Players may draw voluntarily even when holding playable cards.</Bullet>
          </SectionHeading>

          <SectionHeading index="03" title="The powers" style={styles.sectionSpacing}>
            <SpecialCard rank="7" suit="♥" red name="Seven of hearts — instant victory">
              Wild card. Immediately concludes the round in victory, regardless of other cards held. Unplayed cards left in hand still count as penalty points.
            </SpecialCard>
            <SpecialCard rank="J" suit="♠" name="Jack — wild suit demand">
              Playable on any normal card. The player declares a suit. The next participant must follow that suit, answer with another Jack or 7♥, or draw.
            </SpecialCard>
            <SpecialCard rank="2" suit="♦" red name="Two — draw 2 (stackable)">
              Next player owes 2 cards. Can be answered with another 2, passing and incrementing the penalty (+2 each time, up to 8). The first player unable or unwilling to add a 2 draws the entire stack.
            </SpecialCard>
            <SpecialCard rank="A" suit="♠" name="Ace of spades — draw 5 (passable)">
              Next player owes 5 cards. Can be passed by playing any other Ace (A♥, A♦, A♣). The penalty remains fixed at 5 cards (never stacks).
            </SpecialCard>
            <SpecialCard rank="8" suit="♣" name="Eight — skip next player" last>
              Skips the next player's turn. Can be answered with another 8 to pass the skip onward.
            </SpecialCard>
          </SectionHeading>

          <SectionHeading index="04" title="The ledger" subtitle="Assessed for unplayed cards remaining in hand at round completion." style={styles.sectionSpacing}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Card rank</Text>
              <Text style={styles.tableHeaderText}>Penalty</Text>
            </View>
            <View style={styles.tableRow}><Text style={styles.tableCol}>Numbered cards (3–10)</Text><Text style={styles.tableColRight}>Face value</Text></View>
            <View style={styles.tableRow}><Text style={styles.tableCol}>Rank 2 (any suit)</Text><Text style={styles.tableColRight}>20 points</Text></View>
            <View style={styles.tableRow}><Text style={styles.tableCol}>Jack, Queen, King</Text><Text style={styles.tableColRight}>10 points each</Text></View>
            <View style={styles.tableRow}><Text style={styles.tableCol}>Standard aces (A♥, A♦, A♣)</Text><Text style={styles.tableColRight}>15 points each</Text></View>
            <View style={styles.tableRow}><Text style={styles.tableCol}>Ace of spades (A♠)</Text><Text style={[styles.tableColRight, { color: Colors.danger }]}>50 points</Text></View>
            <View style={[styles.tableRow, styles.tableRowLast]}><Text style={styles.tableCol}>Seven of hearts (7♥)</Text><Text style={[styles.tableColRight, { color: Colors.accentSoft }]}>0 points · free wild</Text></View>
          </SectionHeading>

          <SectionHeading index="05" title="The final word" style={styles.sectionSpacing}>
            <Text style={styles.bodyText}>
              If a player wins a round by shedding a 2 or A♠ as their final card, the next player
              in sequence must draw the full penalty (2 or 5 cards) before round scoring begins,
              without opportunity to answer.
            </Text>
          </SectionHeading>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.ink },
  container: { paddingHorizontal: 20, paddingTop: 18 },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center' },
  pageKicker: { ...Typography.micro, color: Colors.textMuted, fontSize: 8, letterSpacing: 1.6, marginBottom: 4 },
  pageTitle: { ...Typography.titleLarge, color: Colors.textPrimary, fontSize: 28, letterSpacing: -0.8 },
  pageSub: { ...Typography.bodyMedium, color: Colors.textSecondary, fontSize: 13.5, lineHeight: 20, marginTop: 4, maxWidth: 440 },
  divider: { marginTop: 18, marginBottom: 20 },
  sectionSpacing: { marginTop: 26 },
  bodyText: { ...Typography.bodyMedium, color: Colors.textSecondary, fontSize: 13.5, lineHeight: 21 },
  callout: { marginTop: 14, paddingLeft: 12, borderLeftWidth: 1.5, borderLeftColor: Colors.danger, backgroundColor: Colors.dangerMuted, paddingVertical: 10, paddingRight: 10, borderRadius: 8 },
  calloutLabel: { ...Typography.micro, color: Colors.danger, fontSize: 7.5, letterSpacing: 1.2, marginBottom: 3 },
  calloutText: { ...Typography.bodyMedium, color: Colors.textSecondary, fontSize: 13, lineHeight: 20 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  bulletDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.accent, marginTop: 7, marginRight: 9 },
  bulletText: { ...Typography.bodyMedium, color: Colors.textSecondary, fontSize: 12.5, flex: 1, lineHeight: 19 },
  boldText: { fontWeight: '700', color: Colors.textPrimary },
  specialRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.line },
  specialRowLast: { borderBottomWidth: 0, paddingBottom: 2 },
  cardBadge: {
    width: 34,
    height: 44,
    backgroundColor: Colors.paper,
    borderWidth: 1,
    borderColor: Colors.cardEdge,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardBadgeRank: { fontFamily: Typography.cardRank.fontFamily, fontSize: 16, fontWeight: '700', color: Colors.cardBlackSuit, lineHeight: 17 },
  cardBadgeSuit: { fontSize: 12, color: Colors.cardBlackSuit, lineHeight: 13 },
  cardBadgeRed: { color: Colors.cardRedSuit },
  specialContent: { flex: 1 },
  specialName: { ...Typography.titleSmall, color: Colors.textPrimary, fontSize: 14, fontWeight: '600', marginBottom: 3 },
  specialBody: { ...Typography.bodySmall, color: Colors.textSecondary, fontSize: 11.5, lineHeight: 17 },
  tableHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: Colors.lineStrong },
  tableHeaderText: { ...Typography.micro, color: Colors.textMuted, fontSize: 7.5, letterSpacing: 1.2 },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.line },
  tableRowLast: { borderBottomWidth: 0 },
  tableCol: { ...Typography.bodySmall, color: Colors.textSecondary, fontSize: 11.5, flex: 1, paddingRight: 10 },
  tableColRight: { fontFamily: Typography.numeral.fontFamily, color: Colors.textPrimary, fontSize: 13, textAlign: 'right' },
});
