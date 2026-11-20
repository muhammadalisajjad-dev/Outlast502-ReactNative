import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Button } from '../components/common/Button';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { useGame } from '../context/GameContext';

interface HomeScreenProps {
  onNavigate: (screen: 'game' | 'setup' | 'scoreboard' | 'history' | 'rules') => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const { startMatch } = useGame();

  const handleQuickPlay = () => {
    startMatch(4, 'You');
    onNavigate('game');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Luxury Brand Header */}
        <View style={styles.brandContainer}>
          <View style={styles.suitRow}>
            <Text style={[styles.suitGlyph, { color: Colors.cardBlackSuit }]}>♠</Text>
            <Text style={[styles.suitGlyph, { color: Colors.cardRedSuit }]}>♥</Text>
            <Text style={[styles.suitGlyph, { color: Colors.cardRedSuit }]}>♦</Text>
            <Text style={[styles.suitGlyph, { color: Colors.cardBlackSuit }]}>♣</Text>
          </View>

          <Text style={styles.logoTitle}>OUTLAST 502</Text>
          <Text style={styles.logoSubtitle}>HIGH-STAKES CARD SHEDDING</Text>
          <View style={styles.divider} />
          <Text style={styles.tagline}>
            Shed your cards. Stack brutal penalties. Avoid 502 points to survive!
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <Button
            title="Quick Play (4 Players) ⚡"
            variant="gold"
            size="large"
            onPress={handleQuickPlay}
            style={styles.menuBtn}
          />

          <Button
            title="Custom Match Setup (2–6 Players) ⚙️"
            variant="emerald"
            size="large"
            onPress={() => onNavigate('setup')}
            style={styles.menuBtn}
          />

          <Button
            title="Match Scoreboard 📊"
            variant="emerald"
            size="medium"
            onPress={() => onNavigate('scoreboard')}
            style={styles.menuBtn}
          />

          <Button
            title="Match History & Cloud Records ☁️"
            variant="emerald"
            size="medium"
            onPress={() => onNavigate('history')}
            style={styles.menuBtn}
          />

          <Button
            title="Official 502 Rules & Scoring 📖"
            variant="outline"
            size="medium"
            onPress={() => onNavigate('rules')}
            style={styles.menuBtn}
          />
        </View>

        {/* Feature Highlights Card */}
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>The Rules in 30 Seconds</Text>
          <View style={styles.bulletRow}>
            <Text style={styles.bulletSymbol}>🃏</Text>
            <Text style={styles.bulletText}>
              <Text style={styles.boldText}>Match Suit or Rank:</Text> Play 1 card on your turn, or draw from the deck.
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Text style={styles.bulletSymbol}>⚡</Text>
            <Text style={styles.bulletText}>
              <Text style={styles.boldText}>Special Powers:</Text> 2s stack (+2..8), A♠ forces 5 cards, 8 skips turn, Jacks are wild!
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Text style={styles.bulletSymbol}>👑</Text>
            <Text style={styles.bulletText}>
              <Text style={styles.boldText}>7 of Hearts:</Text> Wild instant round win! (Remaining hand counts against winner).
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Text style={styles.bulletSymbol}>💀</Text>
            <Text style={styles.bulletText}>
              <Text style={styles.boldText}>502 Elimination:</Text> Reach 502 points and you are out. Last survivor wins!
            </Text>
          </View>
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
  container: {
    padding: 24,
    alignItems: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 28,
  },
  suitRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  suitGlyph: {
    fontSize: 24,
    marginHorizontal: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  logoTitle: {
    ...Typography.titleLarge,
    fontSize: 32,
    color: Colors.gold,
    letterSpacing: 3,
    textAlign: 'center',
    textShadowColor: Colors.goldDark,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  logoSubtitle: {
    ...Typography.badge,
    fontSize: 12,
    color: Colors.goldLight,
    letterSpacing: 2,
    marginTop: 4,
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: Colors.gold,
    marginVertical: 12,
  },
  tagline: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  actionSection: {
    width: '100%',
    maxWidth: 340,
    marginBottom: 28,
  },
  menuBtn: {
    width: '100%',
    marginBottom: 12,
  },
  featureCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: Colors.surfaceCard,
    borderColor: Colors.borderSubtle,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
  },
  featureTitle: {
    ...Typography.titleSmall,
    fontSize: 15,
    color: Colors.goldLight,
    marginBottom: 12,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletSymbol: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 1,
  },
  bulletText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    flex: 1,
  },
  boldText: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
