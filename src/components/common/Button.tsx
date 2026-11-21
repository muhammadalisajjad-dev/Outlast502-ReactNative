import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { triggerHaptic } from '../../utils/haptics';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'cobalt' | 'gold' | 'emerald' | 'crimson' | 'outline' | 'subtle';
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
  variant = 'cobalt',
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
      case 'cobalt':
      case 'gold': // Alias gold to cobalt in Midnight theme for consistency
        return styles.cobaltContainer;
      case 'emerald':
        return styles.midnightContainer;
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
      case 'cobalt':
      case 'gold':
        return styles.cobaltText;
      case 'emerald':
        return styles.midnightText;
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
      activeOpacity={0.82}
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
          color="#ffffff"
        />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
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
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: 8,
  },
  baseText: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  cobaltContainer: {
    backgroundColor: Colors.cobalt,
    borderColor: Colors.cobaltLight,
    shadowColor: Colors.cobalt,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  cobaltText: {
    color: '#ffffff',
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  midnightContainer: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.borderSubtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  midnightText: {
    color: Colors.textPrimary,
  },
  crimsonContainer: {
    backgroundColor: Colors.crimson,
    borderColor: Colors.crimsonLight,
  },
  crimsonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderColor: Colors.borderSubtle,
  },
  outlineText: {
    color: Colors.textAccent,
  },
  subtleContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'transparent',
  },
  subtleText: {
    color: Colors.textSecondary,
  },
  smallContainer: {
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  smallText: {
    fontSize: 12,
    letterSpacing: 0.3,
  },
  mediumContainer: {
    paddingVertical: 11,
    paddingHorizontal: 16,
  },
  mediumText: {
    fontSize: 13,
  },
  largeContainer: {
    paddingVertical: 14,
    paddingHorizontal: 22,
  },
  largeText: {
    fontSize: 14.5,
    letterSpacing: 0.8,
  },
  disabledContainer: {
    opacity: 0.45,
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledText: {
    color: Colors.textMuted,
  },
});
