import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

interface BadgeProps {
  label: string;
  variant?: 'gold' | 'lime' | 'crimson' | 'neutral' | 'suit';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  style,
  textStyle,
}) => {
  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'gold':
        return {
          container: styles.goldContainer,
          text: styles.goldText,
        };
      case 'lime':
        return {
          container: styles.limeContainer,
          text: styles.limeText,
        };
      case 'crimson':
        return {
          container: styles.crimsonContainer,
          text: styles.crimsonText,
        };
      case 'suit':
        return {
          container: styles.suitContainer,
          text: styles.suitText,
        };
      case 'neutral':
      default:
        return {
          container: styles.neutralContainer,
          text: styles.neutralText,
        };
    }
  };

  const v = getVariantStyles();

  return (
    <View style={[styles.baseContainer, v.container, style]}>
      <Text style={[styles.baseText, v.text, textStyle]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseText: {
    ...Typography.badge,
  },
  goldContainer: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderColor: Colors.gold,
  },
  goldText: {
    color: Colors.goldLight,
  },
  limeContainer: {
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
    borderColor: Colors.playableLime,
  },
  limeText: {
    color: Colors.playableLime,
  },
  crimsonContainer: {
    backgroundColor: 'rgba(231, 76, 60, 0.18)',
    borderColor: Colors.crimsonLight,
  },
  crimsonText: {
    color: Colors.crimsonLight,
  },
  suitContainer: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.borderSubtle,
  },
  suitText: {
    color: Colors.textPrimary,
  },
  neutralContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  neutralText: {
    color: Colors.textSecondary,
  },
});
