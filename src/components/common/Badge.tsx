import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

interface BadgeProps {
  label: string;
  variant?: 'cobalt' | 'gold' | 'silver' | 'lime' | 'crimson' | 'neutral' | 'suit' | 'amber';
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
      case 'cobalt':
      case 'gold': // Alias gold to cobalt
        return {
          container: styles.cobaltContainer,
          text: styles.cobaltText,
        };
      case 'silver':
        return {
          container: styles.silverContainer,
          text: styles.silverText,
        };
      case 'lime':
        return {
          container: styles.blueHighlightContainer,
          text: styles.blueHighlightText,
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
  cobaltContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: Colors.lineStrong,
  },
  cobaltText: {
    color: Colors.accentSoft,
  },
  silverContainer: {
    backgroundColor: 'rgba(203, 213, 225, 0.1)',
    borderColor: 'rgba(203, 213, 225, 0.3)',
  },
  silverText: {
    color: Colors.textPrimary,
  },
  blueHighlightContainer: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: 'rgba(56, 189, 248, 0.35)',
  },
  blueHighlightText: {
    color: Colors.accentSoft,
  },
  crimsonContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  crimsonText: {
    color: Colors.danger,
  },
  amberContainer: {
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
    borderColor: 'rgba(217, 119, 6, 0.35)',
  },
  amberText: {
    color: Colors.amberLight,
  },
  suitContainer: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.lineStrong,
  },
  suitText: {
    color: Colors.textPrimary,
  },
  neutralContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: Colors.line,
  },
  neutralText: {
    color: Colors.textSecondary,
  },
});
