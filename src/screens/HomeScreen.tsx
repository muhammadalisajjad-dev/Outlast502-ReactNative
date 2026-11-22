import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useResponsiveInsets } from '../hooks/useResponsiveInsets';
import { Button } from '../components/common/Button';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { useGame } from '../context/GameContext';
import { PlayingCard } from '../components/card/PlayingCard';
import { Atmosphere, Divider } from '../components/common/Chrome';
import { ChevronRight } from 'lucide-react-native';
import { triggerHaptic } from '../utils/haptics';
import { soundManager } from '../utils/sound';

interface HomeScreenProps {
  onNavigate: (screen: 'game' | 'setup' | 'scoreboard' | 'history' | 'rules') => void;
}

const MENU_ITEMS: Array<{
  index: string;
  title: string;
  caption: string;
  target: 'setup' | 'scoreboard' | 'history' | 'rules';
}> = [
  { index: '01', title: 'The table', caption: 'Choose two to six seats', target: 'setup' },
  { index: '02', title: 'Standings', caption: 'Live survival ledger', target: 'scoreboard' },
  { index: '03', title: 'Archive', caption: 'Past matches, kept', target: 'history' },
  { index: '04', title: 'Rules', caption: 'Powers, penalties and points', target: 'rules' },
];

const SEVEN_OF_HEARTS = { id: 'home-seven-hearts', suit: 'hearts' as const, rank: '7' as const };
const ACE_OF_SPADES = { id: 'home-ace-spades', suit: 'spades' as const, rank: 'A' as const };

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const { startMatch } = useGame();
  const insets = useResponsiveInsets();
  const { width, height } = useWindowDimensions();
  const compact = width < 380 || height < 780;

  const floatA = useRef(new Animated.Value(0)).current;
  const floatB = useRef(new Animated.Value(0)).current;
  const floatC = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const makeLoop = (value: Animated.Value, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, { toValue: 1, duration, useNativeDriver: true }),
          Animated.timing(value, { toValue: 0, duration, useNativeDriver: true }),
        ])
      );
    const loops = [makeLoop(floatA, 3800), makeLoop(floatB, 4600), makeLoop(floatC, 4200)];
    loops.forEach(loop => loop.start());
    return () => loops.forEach(loop => loop.stop());
  }, [floatA, floatB, floatC]);

  const handleQuickPlay = () => {
    soundManager.playClick();
    triggerHaptic('light');
    startMatch(4, 'You');
    onNavigate('game');
  };

  const handleMenu = (target: 'setup' | 'scoreboard' | 'history' | 'rules') => {
    soundManager.playClick();
    triggerHaptic('light');
    onNavigate(target);
  };

  const titleSize = compact ? 44 : 52;
  const fanScale = compact ? 0.86 : 1;

  return (
    <View style={styles.safeArea}>
      <Atmosphere variant="home" />

      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: insets.top + 12,
            paddingBottom: Math.max(insets.bottom + 20, 28),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Text style={styles.wordmark}>Outlast 502</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>A card game of nerve and numbers</Text>
          <Text style={[styles.title, { fontSize: titleSize }]}>Outlast</Text>
          <Text style={styles.titleAccent}>502</Text>
          <Text style={styles.tagline}>
            Shed every card. Survive every penalty. Be the last seated when the
            deck runs dry.
          </Text>

          <View style={[styles.cardFan, { transform: [{ scale: fanScale }] }]}>
            <Animated.View
              style={[
                styles.fanCard,
                styles.fanLeft,
                {
                  transform: [
                    { translateX: -62 },
                    { translateY: floatA.interpolate({ inputRange: [0, 1], outputRange: [5, -5] }) },
                    { rotate: '-14deg' },
                  ],
                },
              ]}
            >
              <PlayingCard card={ACE_OF_SPADES} size="normal" />
            </Animated.View>

            <Animated.View
              style={[
                styles.fanCard,
                styles.fanCenter,
                {
                  transform: [
                    { translateY: floatB.interpolate({ inputRange: [0, 1], outputRange: [-4, 5] }) },
                  ],
                },
              ]}
            >
              <PlayingCard card={SEVEN_OF_HEARTS} size="normal" />
            </Animated.View>

            <Animated.View
              style={[
                styles.fanCard,
                styles.fanRight,
                {
                  transform: [
                    { translateX: 62 },
                    { translateY: floatC.interpolate({ inputRange: [0, 1], outputRange: [5, -5] }) },
                    { rotate: '14deg' },
                  ],
                },
              ]}
            >
              <PlayingCard faceDown size="normal" />
            </Animated.View>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="Play"
            variant="primary"
            size="large"
            onPress={handleQuickPlay}
            style={styles.primaryButton}
            textStyle={styles.primaryButtonText}
          />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleMenu('setup')}
            style={styles.secondaryAction}
          >
            <Text style={styles.secondaryText}>Choose your table</Text>
            <ChevronRight size={15} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.facts}>
          <View style={styles.fact}>
            <Text style={styles.factNumber}>52</Text>
            <Text style={styles.factLabel}>cards</Text>
          </View>
          <View style={styles.factDivider} />
          <View style={styles.fact}>
            <Text style={styles.factNumber}>2–6</Text>
            <Text style={styles.factLabel}>players</Text>
          </View>
          <View style={styles.factDivider} />
          <View style={styles.fact}>
            <Text style={styles.factNumber}>502</Text>
            <Text style={styles.factLabel}>limit</Text>
          </View>
        </View>

        <Divider style={styles.menuDivider} />

        <View style={styles.menu}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.target}
              activeOpacity={0.7}
              onPress={() => handleMenu(item.target)}
              style={[styles.menuRow, index === 0 && styles.menuRowFirst]}
            >
              <Text style={styles.menuIndex}>{item.index}</Text>
              <View style={styles.menuTextBlock}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuCaption}>{item.caption}</Text>
              </View>
              <ChevronRight size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.footer}>52 cards · 7 in hand · one survivor</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.ink },
  container: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  wordmark: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 18,
  },
  eyebrow: {
    ...Typography.micro,
    color: Colors.textMuted,
    fontSize: 8.5,
    letterSpacing: 1.8,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: Typography.hero.fontFamily,
    fontSize: 52,
    fontWeight: '700',
    letterSpacing: -1.8,
    lineHeight: 54,
    color: Colors.textPrimary,
  },
  titleAccent: {
    fontFamily: Typography.serifDisplay.fontFamily,
    fontSize: 30,
    fontWeight: '400',
    color: Colors.accent,
    marginTop: -2,
    marginBottom: 10,
  },
  tagline: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 300,
    marginBottom: 16,
  },
  cardFan: {
    width: 250,
    height: 136,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 4,
  },
  fanCard: { position: 'absolute', top: 12 },
  fanLeft: { zIndex: 1 },
  fanCenter: { top: 0, zIndex: 3 },
  fanRight: { zIndex: 2 },
  actions: {
    marginTop: 16,
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 16,
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  secondaryAction: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 6,
  },
  secondaryText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  facts: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.line,
  },
  fact: {
    flex: 1,
    alignItems: 'center',
  },
  factNumber: {
    fontFamily: Typography.numeral.fontFamily,
    fontSize: 20,
    lineHeight: 22,
    color: Colors.textPrimary,
  },
  factLabel: {
    ...Typography.micro,
    color: Colors.textMuted,
    fontSize: 7.5,
    letterSpacing: 1.2,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  factDivider: {
    width: StyleSheet.hairlineWidth,
    height: 28,
    backgroundColor: Colors.line,
  },
  menuDivider: {
    marginTop: 22,
  },
  menu: {
    marginTop: 0,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.line,
  },
  menuRowFirst: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.line,
  },
  menuIndex: {
    fontFamily: Typography.cardRank.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accent,
    width: 26,
  },
  menuTextBlock: {
    flex: 1,
  },
  menuTitle: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontSize: 13.5,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  menuCaption: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  footer: {
    ...Typography.micro,
    color: Colors.textMuted,
    fontSize: 7.5,
    letterSpacing: 1.4,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
});
