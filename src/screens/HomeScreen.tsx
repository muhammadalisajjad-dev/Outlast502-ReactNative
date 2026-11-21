import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useResponsiveInsets } from '../hooks/useResponsiveInsets';
import { Button } from '../components/common/Button';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { useGame } from '../context/GameContext';
import {
  Play,
  Users,
  BarChart3,
  History,
  BookOpen,
  Shield,
  Zap,
  Sparkles,
  Layers,
} from 'lucide-react-native';

interface HomeScreenProps {
  onNavigate: (screen: 'game' | 'setup' | 'scoreboard' | 'history' | 'rules') => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const { startMatch } = useGame();
  const insets = useResponsiveInsets();

  const handleQuickPlay = () => {
    startMatch(4, 'You');
    onNavigate('game');
  };

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Editorial Brand Crest */}
        <View style={styles.brandContainer}>
          <View style={styles.insigniaPill}>
            <Text style={[styles.suitGlyph, { color: Colors.cardBlackSuit }]}>♠</Text>
            <Text style={[styles.suitGlyph, { color: Colors.cardRedSuit }]}>♥</Text>
            <View style={styles.crestShield}>
              <Text style={styles.crestText}>502</Text>
            </View>
            <Text style={[styles.suitGlyph, { color: Colors.cardRedSuit }]}>♦</Text>
            <Text style={[styles.suitGlyph, { color: Colors.cardBlackSuit }]}>♣</Text>
          </View>

          <Text style={styles.logoTitle}>OUTLAST</Text>
          <View style={styles.badgeRow}>
            <View style={styles.silverLine} />
            <Text style={styles.logoSubtitle}>HIGH-STAKES CARD SHEDDING</Text>
            <View style={styles.silverLine} />
          </View>

          <Text style={styles.tagline}>
            Shed every card. Deflect brutal penalties. Outsurvive opponents before reaching 502 points.
          </Text>
        </View>

        {/* Hero Quick Play CTA */}
        <View style={styles.heroSection}>
          <Button
            title="QUICK PLAY (4 PLAYERS)"
            icon={<Play size={16} color="#ffffff" fill="#ffffff" />}
            variant="cobalt"
            size="large"
            onPress={handleQuickPlay}
            style={styles.heroPlayBtn}
            textStyle={styles.heroPlayBtnText}
          />
        </View>

        {/* 2-Column Balanced Navigation Grid */}
        <View style={styles.gridSection}>
          <TouchableOpacity
            style={styles.gridCard}
            activeOpacity={0.75}
            onPress={() => onNavigate('setup')}
          >
            <View style={styles.cardIconBox}>
              <Users size={18} color={Colors.cobaltLight} />
            </View>
            <Text style={styles.gridCardTitle}>Match Setup</Text>
            <Text style={styles.gridCardSub}>2–6 Players & Bots</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            activeOpacity={0.75}
            onPress={() => onNavigate('scoreboard')}
          >
            <View style={styles.cardIconBox}>
              <BarChart3 size={18} color={Colors.cobaltLight} />
            </View>
            <Text style={styles.gridCardTitle}>Scoreboard</Text>
            <Text style={styles.gridCardSub}>Standings & Survival</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            activeOpacity={0.75}
            onPress={() => onNavigate('history')}
          >
            <View style={styles.cardIconBox}>
              <History size={18} color={Colors.cobaltLight} />
            </View>
            <Text style={styles.gridCardTitle}>Match History</Text>
            <Text style={styles.gridCardSub}>Local & Cloud Logs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            activeOpacity={0.75}
            onPress={() => onNavigate('rules')}
          >
            <View style={styles.cardIconBox}>
              <BookOpen size={18} color={Colors.cobaltLight} />
            </View>
            <Text style={styles.gridCardTitle}>Official Rules</Text>
            <Text style={styles.gridCardSub}>Cards & Penalties</Text>
          </TouchableOpacity>
        </View>

        {/* Tactical Intel Overview Card */}
        <View style={styles.tacticalCard}>
          <Text style={styles.tacticalTitle}>TACTICAL OVERVIEW</Text>

          <View style={styles.tacticalRow}>
            <View style={styles.tacticalIconWrap}>
              <Layers size={14} color={Colors.cobaltLight} />
            </View>
            <View style={styles.tacticalContent}>
              <Text style={styles.tacticalHeading}>Shedding Mechanics</Text>
              <Text style={styles.tacticalBody}>
                Play 1 card matching the discard by suit or rank, or draw 1 card to end your turn.
              </Text>
            </View>
          </View>

          <View style={styles.tacticalRow}>
            <View style={styles.tacticalIconWrap}>
              <Zap size={14} color={Colors.amberLight} />
            </View>
            <View style={styles.tacticalContent}>
              <Text style={styles.tacticalHeading}>Brutal Counter-Stacking</Text>
              <Text style={styles.tacticalBody}>
                Counter a 2 with another 2 (+2 stack), A♠ with any Ace, and 8 with another 8 skip.
              </Text>
            </View>
          </View>

          <View style={[styles.tacticalRow, { marginBottom: 0 }]}>
            <View style={styles.tacticalIconWrap}>
              <Shield size={14} color={Colors.silver} />
            </View>
            <View style={styles.tacticalContent}>
              <Text style={styles.tacticalHeading}>502 Point Survival</Text>
              <Text style={styles.tacticalBody}>
                Cards left in hand count as penalty points. 502 points eliminates a player, unless protected as round winner.
              </Text>
            </View>
          </View>
        </View>

        {/* Footer info */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Standard 52-Card Deck · 502 Point Limit · v1.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.tableDeep,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  insigniaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(250, 248, 243, 0.95)',
    borderColor: Colors.borderSubtle,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  suitGlyph: {
    fontSize: 16,
    marginHorizontal: 4,
  },
  crestShield: {
    backgroundColor: '#0c172a',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginHorizontal: 6,
    borderWidth: 0.5,
    borderColor: Colors.cobaltLight,
  },
  crestText: {
    color: Colors.silverLight,
    fontWeight: '900',
    fontSize: 9.5,
    letterSpacing: 0.5,
  },
  logoTitle: {
    ...Typography.displayTitle,
    color: '#ffffff',
    letterSpacing: 4,
    textAlign: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 10,
    width: '85%',
  },
  silverLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: 'rgba(203, 213, 225, 0.3)',
  },
  logoSubtitle: {
    ...Typography.displaySubtitle,
    color: Colors.silverLight,
    marginHorizontal: 8,
  },
  tagline: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 18,
  },
  heroSection: {
    width: '100%',
    marginBottom: 16,
  },
  heroPlayBtn: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 10,
  },
  heroPlayBtnText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  gridSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  gridCard: {
    width: '48%',
    backgroundColor: 'rgba(13, 21, 39, 0.85)',
    borderColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIconBox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    borderWidth: 0.5,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  gridCardTitle: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  gridCardSub: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontSize: 10.5,
  },
  tacticalCard: {
    width: '100%',
    backgroundColor: 'rgba(8, 12, 20, 0.92)',
    borderColor: 'rgba(56, 189, 248, 0.18)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  tacticalTitle: {
    ...Typography.labelUpper,
    color: Colors.cobaltLight,
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  tacticalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tacticalIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  tacticalContent: {
    flex: 1,
  },
  tacticalHeading: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: 12,
    marginBottom: 2,
  },
  tacticalBody: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  footerRow: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  footerText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontSize: 10,
    letterSpacing: 0.5,
  },
});
