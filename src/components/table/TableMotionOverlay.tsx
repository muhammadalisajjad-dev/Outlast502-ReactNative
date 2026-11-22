import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Card } from '../../types/card';
import { PlayingCard } from '../card/PlayingCard';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Crown, Flame, Zap, Sparkles } from 'lucide-react-native';

export interface FlyingCardAction {
  card?: Card;
  from: 'hand' | 'deck' | 'opponent';
  to: 'discard' | 'hand' | 'opponent';
}

export interface SpecialEventNotice {
  title: string;
  subtitle: string;
  type: 'victory' | 'penalty' | 'jack' | 'skip';
}

interface TableMotionOverlayProps {
  isDealing: boolean;
  flyingAction: FlyingCardAction | null;
  specialEvent: SpecialEventNotice | null;
}

export const TableMotionOverlay: React.FC<TableMotionOverlayProps> = ({
  isDealing,
  flyingAction,
  specialEvent,
}) => {
  // Deal animations for 4 directions
  const dealAnim1 = useRef(new Animated.Value(0)).current;
  const dealAnim2 = useRef(new Animated.Value(0)).current;
  const dealAnim3 = useRef(new Animated.Value(0)).current;
  const dealAnim4 = useRef(new Animated.Value(0)).current;

  // Single card fly animation
  const flyProgress = useRef(new Animated.Value(0)).current;

  // Special banner animation
  const bannerAnim = useRef(new Animated.Value(0)).current;

  // Dealing sequence effect
  useEffect(() => {
    if (isDealing) {
      dealAnim1.setValue(0);
      dealAnim2.setValue(0);
      dealAnim3.setValue(0);
      dealAnim4.setValue(0);

      Animated.stagger(120, [
        Animated.spring(dealAnim1, { toValue: 1, speed: 20, bounciness: 4, useNativeDriver: true }),
        Animated.spring(dealAnim2, { toValue: 1, speed: 20, bounciness: 4, useNativeDriver: true }),
        Animated.spring(dealAnim3, { toValue: 1, speed: 20, bounciness: 4, useNativeDriver: true }),
        Animated.spring(dealAnim4, { toValue: 1, speed: 20, bounciness: 4, useNativeDriver: true }),
      ]).start();
    }
  }, [isDealing, dealAnim1, dealAnim2, dealAnim3, dealAnim4]);

  // Flying action effect
  useEffect(() => {
    if (flyingAction) {
      flyProgress.setValue(0);
      Animated.timing(flyProgress, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [flyingAction, flyProgress]);

  // Special event banner effect
  useEffect(() => {
    if (specialEvent) {
      bannerAnim.setValue(0);
      Animated.sequence([
        Animated.spring(bannerAnim, {
          toValue: 1,
          speed: 25,
          bounciness: 6,
          useNativeDriver: true,
        }),
        Animated.delay(1800),
        Animated.timing(bannerAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [specialEvent, bannerAnim]);

  // Coordinates for flying action
  let startX = 0;
  let startY = 0;
  let endX = 0;
  let endY = 0;

  if (flyingAction) {
    if (flyingAction.from === 'hand' && flyingAction.to === 'discard') {
      startX = 0;
      startY = 180;
      endX = 35;
      endY = 0;
    } else if (flyingAction.from === 'deck' && flyingAction.to === 'hand') {
      startX = -35;
      startY = 0;
      endX = 0;
      endY = 180;
    } else if (flyingAction.from === 'opponent' && flyingAction.to === 'discard') {
      startX = 0;
      startY = -160;
      endX = 35;
      endY = 0;
    } else if (flyingAction.from === 'deck' && flyingAction.to === 'opponent') {
      startX = -35;
      startY = 0;
      endX = 0;
      endY = -160;
    }
  }

  const flyTranslateX = flyProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [startX, endX],
  });

  const flyTranslateY = flyProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [startY, endY],
  });

  const flyScale = flyProgress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.1, 1],
  });

  if (!isDealing && !flyingAction && !specialEvent) {
    return null;
  }

  return (
    <View style={styles.overlayContainer} pointerEvents="none">
      {/* Dealing sequence flying cards */}
      {isDealing && (
        <>
          {/* Card flying to Opponent 1 (Top Left) */}
          <Animated.View
            style={[
              styles.dealCard,
              {
                opacity: dealAnim1.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] }),
                transform: [
                  { translateX: dealAnim1.interpolate({ inputRange: [0, 1], outputRange: [0, -90] }) },
                  { translateY: dealAnim1.interpolate({ inputRange: [0, 1], outputRange: [0, -140] }) },
                  { scale: dealAnim1.interpolate({ inputRange: [0, 1], outputRange: [1, 0.6] }) },
                  { rotate: dealAnim1.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-20deg'] }) },
                ],
              },
            ]}
          >
            <PlayingCard faceDown size="mini" />
          </Animated.View>

          {/* Card flying to Opponent 2 (Top Center) */}
          <Animated.View
            style={[
              styles.dealCard,
              {
                opacity: dealAnim2.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] }),
                transform: [
                  { translateX: dealAnim2.interpolate({ inputRange: [0, 1], outputRange: [0, 0] }) },
                  { translateY: dealAnim2.interpolate({ inputRange: [0, 1], outputRange: [0, -150] }) },
                  { scale: dealAnim2.interpolate({ inputRange: [0, 1], outputRange: [1, 0.6] }) },
                ],
              },
            ]}
          >
            <PlayingCard faceDown size="mini" />
          </Animated.View>

          {/* Card flying to Opponent 3 (Top Right) */}
          <Animated.View
            style={[
              styles.dealCard,
              {
                opacity: dealAnim3.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] }),
                transform: [
                  { translateX: dealAnim3.interpolate({ inputRange: [0, 1], outputRange: [0, 90] }) },
                  { translateY: dealAnim3.interpolate({ inputRange: [0, 1], outputRange: [0, -140] }) },
                  { scale: dealAnim3.interpolate({ inputRange: [0, 1], outputRange: [1, 0.6] }) },
                  { rotate: dealAnim3.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '20deg'] }) },
                ],
              },
            ]}
          >
            <PlayingCard faceDown size="mini" />
          </Animated.View>

          {/* Card flying to Human Player (Bottom) */}
          <Animated.View
            style={[
              styles.dealCard,
              {
                opacity: dealAnim4.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] }),
                transform: [
                  { translateX: dealAnim4.interpolate({ inputRange: [0, 1], outputRange: [0, 0] }) },
                  { translateY: dealAnim4.interpolate({ inputRange: [0, 1], outputRange: [0, 170] }) },
                  { scale: dealAnim4.interpolate({ inputRange: [0, 1], outputRange: [1, 0.9] }) },
                ],
              },
            ]}
          >
            <PlayingCard faceDown size="normal" />
          </Animated.View>
        </>
      )}

      {/* Single card active fly trajectory */}
      {flyingAction && (
        <Animated.View
          style={[
            styles.flyingCardWrapper,
            {
              transform: [
                { translateX: flyTranslateX },
                { translateY: flyTranslateY },
                { scale: flyScale },
              ],
            },
          ]}
        >
          {flyingAction.card ? (
            <PlayingCard card={flyingAction.card} size="normal" />
          ) : (
            <PlayingCard faceDown size="normal" />
          )}
        </Animated.View>
      )}

      {/* Special Event Cinematic Banner */}
      {specialEvent && (
        <Animated.View
          style={[
            styles.specialBannerCard,
            specialEvent.type === 'victory' && styles.bannerVictory,
            specialEvent.type === 'penalty' && styles.bannerPenalty,
            specialEvent.type === 'jack' && styles.bannerJack,
            specialEvent.type === 'skip' && styles.bannerSkip,
            {
              transform: [
                {
                  scale: bannerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
              opacity: bannerAnim,
            },
          ]}
        >
          <View
            style={[
              styles.bannerAccent,
              specialEvent.type === 'victory' && { backgroundColor: Colors.accent },
              specialEvent.type === 'penalty' && {
                backgroundColor: Colors.danger,
              },
              specialEvent.type === 'jack' && { backgroundColor: Colors.accent },
              specialEvent.type === 'skip' && {
                backgroundColor: Colors.textMuted,
              },
            ]}
            pointerEvents="none"
          />

          <View style={styles.bannerIconBox}>
            {specialEvent.type === 'victory' && (
              <Crown size={20} color={Colors.accentSoft} />
            )}
            {specialEvent.type === 'penalty' && (
              <Flame size={20} color={Colors.danger} />
            )}
            {specialEvent.type === 'jack' && (
              <Sparkles size={20} color={Colors.accentSoft} />
            )}
            {specialEvent.type === 'skip' && (
              <Zap size={20} color={Colors.textSecondary} />
            )}
          </View>
          <View style={styles.bannerTextBox}>
            <Text
              style={[
                styles.bannerTitle,
                specialEvent.type === 'victory' && { color: Colors.accentSoft },
                specialEvent.type === 'penalty' && {
                  color: Colors.danger,
                },
                specialEvent.type === 'jack' && { color: Colors.accentSoft },
                specialEvent.type === 'skip' && { color: Colors.paper },
              ]}
            >
              {specialEvent.title}
            </Text>
            <Text style={styles.bannerSubtitle}>{specialEvent.subtitle}</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
    pointerEvents: 'none' as const,
  },
  dealCard: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flyingCardWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  specialBannerCard: {
    position: 'absolute',
    top: '24%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 18,
    paddingRight: 16,
    paddingVertical: 11,
    borderRadius: 3,
    borderWidth: 1,
    backgroundColor: 'rgba(7, 19, 15, 0.97)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.65,
    shadowRadius: 12,
    elevation: 14,
    maxWidth: '86%',
    overflow: 'hidden',
  },
  bannerAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
  },
  bannerVictory: {
    borderColor: 'rgba(198, 164, 96, 0.7)',
    shadowColor: Colors.accent,
  },
  bannerPenalty: {
    borderColor: 'rgba(196, 85, 95, 0.7)',
    shadowColor: Colors.danger,
  },
  bannerJack: {
    borderColor: 'rgba(198, 164, 96, 0.6)',
    shadowColor: Colors.accent,
  },
  bannerSkip: {
    borderColor: 'rgba(242, 232, 213, 0.3)',
    shadowColor: '#000',
  },
  bannerIconBox: {
    marginRight: 12,
  },
  bannerTextBox: {
    flexShrink: 1,
  },
  bannerTitle: {
    ...Typography.serifSubheading,
    fontSize: 13,
    letterSpacing: 1.5,
    lineHeight: 16,
  },
  bannerSubtitle: {
    ...Typography.serifItalic,
    color: Colors.textMuted,
    fontSize: 10.5,
    lineHeight: 14,
    marginTop: 2,
  },
});
