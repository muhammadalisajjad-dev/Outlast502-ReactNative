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

const SEVEN_OF_HEARTS = { id: 'home-seven-hearts', suit: 'hearts' as const, rank: '7' as const };
const ACE_OF_SPADES = { id: 'home-ace-spades', suit: 'spades' as const, rank: 'A' as const };

const NAV_ITEMS: Array<{ label: string; target: 'setup' | 'scoreboard' | 'history' | 'rules' }> = [
  { label: 'Table', target: 'setup' },
  { label: 'Standings', target: 'scoreboard' },
  { label: 'Archive', target: 'history' },
  { label: 'Rules', target: 'rules' },
];

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

          <Text style={styles.eyebrow}>A card game of nerve and numbers</Text>
          <Text style={styles.title}>Outlast</Text>
          <Text style={styles.titleAccent}>502</Text>
          <Text style={styles.tagline}>
            Shed every card. Survive every penalty. Be the last seated when the
            deck runs dry.
          </Text>

          <View style={styles.heroRule} />
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

        <View style={styles.navRow}>
          {NAV_ITEMS.map(item => (
            <TouchableOpacity
              key={item.target}
              activeOpacity={0.7}
              onPress={() => handleMenu(item.target)}
              style={styles.navChip}
            >
              <Text style={styles.navChipText}>{item.label}</Text>
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
    paddingTop: 22,
    paddingBottom: 8,
  },
  cardFan: {
    width: 250,
    height: 136,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 18,
  },
  fanCard: { position: 'absolute', top: 12 },
  fanLeft: { zIndex: 1 },
  fanCenter: { top: 0, zIndex: 3 },
  fanRight: { zIndex: 2 },
  eyebrow: {
    ...Typography.micro,
    color: Colors.textMuted,
    fontSize: 8.5,
    letterSpacing: 1.8,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: Typography.hero.fontFamily,
    fontSize: 56,
    fontWeight: '700',
    letterSpacing: -2,
    lineHeight: 58,
    color: Colors.textPrimary,
  },
  titleAccent: {
    fontFamily: Typography.serifDisplay.fontFamily,
    fontSize: 32,
    fontWeight: '400',
    color: Colors.accent,
    marginTop: -2,
    marginBottom: 8,
  },
  tagline: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 300,
    marginBottom: 0,
  },
  heroRule: {
    width: 110,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.lineStrong,
    marginTop: 14,
  },
  actions: {
    marginTop: 20,
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
  navRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 26,
    flexWrap: 'wrap',
  },
  navChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.lineStrong,
    borderRadius: 20,
    backgroundColor: Colors.paperFaint,
  },
  navChipText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontSize: 11.5,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  footer: {
    ...Typography.micro,
    color: Colors.textMuted,
    fontSize: 7.5,
    letterSpacing: 1.4,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
});
