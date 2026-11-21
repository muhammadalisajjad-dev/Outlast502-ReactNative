import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

interface BadgeProps {
  label: string;
  variant?: 'gold' | 'lime' | 'crimson' | 'neutral' | 'suit' | 'amber';
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  icon,
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
      case 'amber':
        return {
          container: styles.amberContainer,
          text: styles.amberText,
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
      {icon && <View style={styles.iconBox}>{icon}</View>}
      <Text style={[styles.baseText, v.text, textStyle]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  iconBox: {
    marginRight: 4,
  },
  baseText: {
    ...Typography.badge,
    fontSize: 9.5,
  },
  goldContainer: {
    backgroundColor: 'rgba(203, 178, 106, 0.12)',
    borderColor: Colors.borderSubtle,
  },
  goldText: {
    color: Colors.goldLight,
  },
  limeContainer: {
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    borderColor: 'rgba(52, 211, 153, 0.35)',
  },
  limeText: {
    color: Colors.playableMint,
  },
  crimsonContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  crimsonText: {
    color: Colors.crimsonLight,
  },
  amberContainer: {
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
    borderColor: 'rgba(217, 119, 6, 0.35)',
  },
  amberText: {
    color: Colors.amberLight,
  },
  suitContainer: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.borderSubtle,
  },
  suitText: {
    color: Colors.textPrimary,
  },
  neutralContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: Colors.borderMuted,
  },
  neutralText: {
    color: Colors.textSecondary,
  },
});
