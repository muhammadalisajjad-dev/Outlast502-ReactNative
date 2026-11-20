import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { triggerHaptic } from '../../utils/haptics';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'gold' | 'emerald' | 'crimson' | 'outline' | 'subtle';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'gold',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}) => {
  const handlePress = () => {
    if (disabled || loading) return;
    triggerHaptic('light');
    onPress();
  };

  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'gold':
        return styles.goldContainer;
      case 'emerald':
        return styles.emeraldContainer;
      case 'crimson':
        return styles.crimsonContainer;
      case 'outline':
        return styles.outlineContainer;
      case 'subtle':
        return styles.subtleContainer;
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'gold':
        return styles.goldText;
      case 'emerald':
        return styles.emeraldText;
      case 'crimson':
        return styles.crimsonText;
      case 'outline':
        return styles.outlineText;
      case 'subtle':
        return styles.subtleText;
    }
  };

  const getSizeStyle = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'small':
        return {
          container: styles.smallContainer,
          text: styles.smallText,
        };
      case 'large':
        return {
          container: styles.largeContainer,
          text: styles.largeText,
        };
      case 'medium':
      default:
        return {
          container: styles.mediumContainer,
          text: styles.mediumText,
        };
    }
  };

  const sizeStyle = getSizeStyle();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.baseContainer,
        getContainerStyle(),
        sizeStyle.container,
        disabled && styles.disabledContainer,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'gold' ? Colors.surfaceDark : Colors.textPrimary}
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.baseText,
              getTextStyle(),
              sizeStyle.text,
              disabled && styles.disabledText,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
  },
  baseText: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    textAlign: 'center',
  },
  goldContainer: {
    backgroundColor: Colors.gold,
    borderColor: Colors.goldLight,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  goldText: {
    color: '#1a1406',
  },
  emeraldContainer: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.borderSubtle,
  },
  emeraldText: {
    color: Colors.textPrimary,
  },
  crimsonContainer: {
    backgroundColor: Colors.crimson,
    borderColor: Colors.crimsonLight,
  },
  crimsonText: {
    color: Colors.textPrimary,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderColor: Colors.gold,
  },
  outlineText: {
    color: Colors.gold,
  },
  subtleContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'transparent',
  },
  subtleText: {
    color: Colors.textSecondary,
  },
  smallContainer: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  smallText: {
    fontSize: 12,
  },
  mediumContainer: {
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  mediumText: {
    fontSize: 14,
  },
  largeContainer: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  largeText: {
    fontSize: 16,
    letterSpacing: 0.5,
  },
  disabledContainer: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledText: {
    color: Colors.textMuted,
  },
});
