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
import {
  DecoBackdrop,
  Monogram,
  OrnamentDivider,
  BrassDiamond,
} from '../components/common/Deco';
import { ChevronRight } from 'lucide-react-native';
import { triggerHaptic } from '../utils/haptics';
import { soundManager } from '../utils/sound';

interface HomeScreenProps {
  onNavigate: (screen: 'game' | 'setup' | 'scoreboard' | 'history' | 'rules') => void;
}

const MENU_ITEMS: Array<{
  numeral: string;
  title: string;
  caption: string;
  target: 'setup' | 'scoreboard' | 'history' | 'rules';
}> = [
  {
    numeral: 'I',
    title: 'THE TABLE',
    caption: 'Choose two to six seats',
    target: 'setup',
  },
  {
    numeral: 'II',
    title: 'THE STANDINGS',
    caption: 'Live survival ledger',
    target: 'scoreboard',
  },
  {
    numeral: 'III',
    title: 'THE ARCHIVE',
    caption: 'Past matches, kept',
    target: 'history',
  },
  {
    numeral: 'IV',
    title: 'HOUSE RULES',
    caption: 'Powers, penalties and points',
    target: 'rules',
  },
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
          Animated.timing(value, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration,
            useNativeDriver: true,
          }),
        ])
      );

    const loops = [
      makeLoop(floatA, 3800),
      makeLoop(floatB, 4600),
      makeLoop(floatC, 4200),
    ];
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

  const titleSize = compact ? 34 : 42;
  const titleSpacing = compact ? 4 : 6;
  const fanScale = compact ? 0.9 : 1;

  return (
    <View style={styles.safeArea}>
      <DecoBackdrop variant="home" />

      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: insets.top + 10,
            paddingBottom: Math.max(insets.bottom + 18, 28),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Club masthead */}
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <Monogram size={30} shape="diamond" />
            <View style={styles.clubBlock}>
              <Text style={styles.clubName}>PRIVATE CARD CLUB</Text>
              <Text style={styles.clubEst}>EST. MMXXVI</Text>
            </View>
          </View>
          <View style={styles.topBarRight}>
            <BrassDiamond size={4} />
            <Text style={styles.membership}>NO. 502</Text>
          </View>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>THE HOUSE OF</Text>

          <Text
            style={[
              styles.title,
              { fontSize: titleSize, letterSpacing: titleSpacing },
            ]}
          >
            OUTLAST
          </Text>

          <View style={styles.fiveOhTwoRow}>
            <View style={styles.fiveOhTwoLine} />
            <Text style={styles.fiveOhTwo}>502</Text>
            <View style={styles.fiveOhTwoLine} />
          </View>

          <Text style={styles.subtitle}>A GAME OF NERVE & NUMBERS</Text>

          <OrnamentDivider style={styles.heroOrnament} />

          <Text style={styles.tagline}>
            Shed every card. Survive every penalty. Be the last seated when the deck runs dry.
          </Text>

          {/* Fanned house hand */}
          <View style={[styles.cardFan, { transform: [{ scale: fanScale }] }]}>
            <Animated.View
              style={[
                styles.fanCard,
                styles.fanLeft,
                {
                  transform: [
                    { translateX: -56 },
                    { translateY: floatA.interpolate({ inputRange: [0, 1], outputRange: [4, -4] }) },
                    { rotate: '-13deg' },
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
                    { translateY: floatB.interpolate({ inputRange: [0, 1], outputRange: [-3, 4] }) },
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
                    { translateX: 56 },
                    { translateY: floatC.interpolate({ inputRange: [0, 1], outputRange: [4, -4] }) },
                    { rotate: '13deg' },
                  ],
                },
              ]}
            >
              <PlayingCard faceDown size="normal" />
            </Animated.View>
          </View>
        </View>

        {/* Primary invitation */}
        <View style={styles.actions}>
          <Button
            title="TAKE A SEAT"
            variant="cobalt"
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
            <Text style={styles.secondaryText}>CHOOSE YOUR TABLE</Text>
            <View style={styles.secondaryMeta}>
              <BrassDiamond size={3.5} />
              <Text style={styles.secondaryMetaText}>2–6 PLAYERS</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Club ledger navigation */}
        <View style={styles.menu}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.target}
              activeOpacity={0.65}
              onPress={() => handleMenu(item.target)}
              style={[styles.menuRow, index === 0 && styles.menuRowFirst]}
            >
              <Text style={styles.menuNumeral}>{item.numeral}</Text>
              <View style={styles.menuTextBlock}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuCaption}>{item.caption}</Text>
              </View>
              <ChevronRight size={14} color="rgba(198, 164, 96, 0.55)" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>52 CARDS · 7 IN HAND · ONE SURVIVOR</Text>
          <View style={styles.footerDiamonds}>
            <BrassDiamond size={3} />
            <BrassDiamond size={3} style={{ marginHorizontal: 5 }} />
            <BrassDiamond size={3} />
          </View>
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
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    paddingHorizontal: 22,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(198, 164, 96, 0.18)',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clubBlock: {
    marginLeft: 10,
  },
  clubName: {
    ...Typography.micro,
    color: Colors.ivory,
    fontSize: 7.4,
    letterSpacing: 1.8,
  },
  clubEst: {
    ...Typography.micro,
    color: Colors.textMuted,
    fontSize: 6.2,
    letterSpacing: 1.4,
    marginTop: 2,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  membership: {
    ...Typography.micro,
    color: Colors.brass,
    fontSize: 6.4,
    letterSpacing: 1.4,
    marginLeft: 6,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 26,
  },
  eyebrow: {
    ...Typography.micro,
    color: Colors.brass,
    fontSize: 7.5,
    letterSpacing: 3.4,
    marginBottom: 4,
  },
  title: {
    fontFamily: Typography.displayTitle.fontFamily,
    fontWeight: '400',
    color: Colors.ivory,
    textAlign: 'center',
    lineHeight: 52,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  fiveOhTwoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  fiveOhTwoLine: {
    width: 34,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(198, 164, 96, 0.5)',
  },
  fiveOhTwo: {
    fontFamily: Typography.displayTitle.fontFamily,
    fontSize: 22,
    fontWeight: '400',
    letterSpacing: 4,
    color: Colors.brassLight,
    marginHorizontal: 12,
  },
  subtitle: {
    ...Typography.micro,
    color: Colors.textSecondary,
    fontSize: 7.4,
    letterSpacing: 2.6,
    marginTop: 8,
  },
  heroOrnament: {
    width: 210,
    marginTop: 12,
    marginBottom: 4,
  },
  tagline: {
    ...Typography.serifItalic,
    color: Colors.textSecondary,
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 300,
    marginTop: 6,
  },
  cardFan: {
    width: 250,
    height: 132,
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  fanCard: {
    position: 'absolute',
    top: 14,
  },
  fanLeft: {
    zIndex: 1,
  },
  fanCenter: {
    top: 0,
    zIndex: 3,
  },
  fanRight: {
    zIndex: 2,
  },
  actions: {
    marginTop: 4,
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 16,
  },
  primaryButtonText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2.6,
  },
  secondaryAction: {
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 4,
  },
  secondaryText: {
    ...Typography.micro,
    color: Colors.brassLight,
    fontSize: 8,
    letterSpacing: 2,
  },
  secondaryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  secondaryMetaText: {
    ...Typography.micro,
    color: Colors.textMuted,
    fontSize: 6.5,
    letterSpacing: 1.4,
    marginLeft: 5,
  },
  menu: {
    marginTop: 22,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(198, 164, 96, 0.18)',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(198, 164, 96, 0.14)',
  },
  menuRowFirst: {},
  menuNumeral: {
    ...Typography.serifBody,
    color: Colors.brass,
    fontSize: 10,
    letterSpacing: 1,
    width: 28,
  },
  menuTextBlock: {
    flex: 1,
  },
  menuTitle: {
    ...Typography.labelUpper,
    color: Colors.ivory,
    fontSize: 9.5,
    letterSpacing: 2.2,
  },
  menuCaption: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    marginTop: 26,
  },
  footerText: {
    ...Typography.micro,
    color: 'rgba(201, 185, 154, 0.5)',
    fontSize: 6.2,
    letterSpacing: 1.8,
  },
  footerDiamonds: {
    flexDirection: 'row',
    marginTop: 9,
  },
});
