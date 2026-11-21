import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
  Animated,
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
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || loading) return;
    Animated.spring(scaleAnim, {
      toValue: 0.975,
      useNativeDriver: true,
      speed: 40,
      bounciness: 2,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const handlePress = () => {
    if (disabled || loading) return;
    triggerHaptic('light');
    onPress();
  };

  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'cobalt':
        return styles.primaryContainer;
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
      case 'cobalt':
        return styles.primaryText;
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
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
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
          <ActivityIndicator size="small" color={Colors.brassLight} />
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
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    borderRadius: 3,
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
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 1.1,
  },
  primaryContainer: {
    backgroundColor: Colors.emeraldMid,
    borderColor: Colors.brass,
    shadowColor: Colors.brass,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryText: {
    color: Colors.brassLight,
    fontWeight: '700',
    letterSpacing: 1.6,
  },
  goldContainer: {
    backgroundColor: Colors.brass,
    borderColor: Colors.brassLight,
    shadowColor: Colors.brass,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 7,
    elevation: 4,
  },
  goldText: {
    color: Colors.inkBlack,
    fontWeight: '700',
    letterSpacing: 1.6,
  },
  emeraldContainer: {
    backgroundColor: 'rgba(13, 42, 33, 0.7)',
    borderColor: 'rgba(198, 164, 96, 0.4)',
  },
  emeraldText: {
    color: Colors.ivory,
    fontWeight: '600',
  },
  crimsonContainer: {
    backgroundColor: Colors.burgundy,
    borderColor: 'rgba(198, 164, 96, 0.55)',
  },
  crimsonText: {
    color: Colors.ivory,
    fontWeight: '700',
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(198, 164, 96, 0.5)',
  },
  outlineText: {
    color: Colors.brassLight,
    fontWeight: '600',
  },
  subtleContainer: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(198, 164, 96, 0.16)',
  },
  subtleText: {
    color: Colors.textSecondary,
  },
  smallContainer: {
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  smallText: {
    fontSize: 10.5,
    letterSpacing: 0.9,
  },
  mediumContainer: {
    paddingVertical: 11,
    paddingHorizontal: 16,
  },
  mediumText: {
    fontSize: 12.5,
  },
  largeContainer: {
    paddingVertical: 15,
    paddingHorizontal: 22,
  },
  largeText: {
    fontSize: 13,
    letterSpacing: 1.4,
  },
  disabledContainer: {
    opacity: 0.4,
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledText: {
    color: Colors.textMuted,
  },
});
