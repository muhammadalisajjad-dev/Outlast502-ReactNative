import React, { useEffect, useRef } from 'react';
import { Modal, View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { Colors } from '../../theme/colors';

interface DecoModalProps {
  visible: boolean;
  children: React.ReactNode;
  onRequestClose?: () => void;
  maxWidth?: number;
  style?: ViewStyle;
}

/**
 * Shared Art Deco dialog shell: a deep emerald panel, double brass hairline,
 * clipped corners and a slow spring entrance.
 */
export const DecoModal: React.FC<DecoModalProps> = ({
  visible,
  children,
  onRequestClose,
  maxWidth = 360,
  style,
}) => {
  const popAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      popAnim.setValue(0);
      Animated.spring(popAnim, {
        toValue: 1,
        speed: 22,
        bounciness: 4,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, popAnim]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <View style={styles.overlay}>
        <View style={styles.vignette} pointerEvents="none" />

        <Animated.View
          style={[
            styles.panel,
            { maxWidth },
            style,
            {
              opacity: popAnim,
              transform: [
                {
                  scale: popAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.94, 1],
                  }),
                },
                {
                  translateY: popAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.innerBorder} pointerEvents="none" />
          <View style={[styles.corner, styles.cornerTL]} pointerEvents="none" />
          <View style={[styles.corner, styles.cornerTR]} pointerEvents="none" />
          <View style={[styles.corner, styles.cornerBL]} pointerEvents="none" />
          <View style={[styles.corner, styles.cornerBR]} pointerEvents="none" />
          <View style={styles.content}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(3, 8, 6, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  vignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 30, 24, 0.16)',
  },
  panel: {
    width: '100%',
    backgroundColor: Colors.emeraldDeep,
    borderWidth: 1,
    borderColor: 'rgba(198, 164, 96, 0.65)',
    borderRadius: 4,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
    position: 'relative',
  },
  innerBorder: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderWidth: 0.6,
    borderColor: 'rgba(198, 164, 96, 0.18)',
    borderRadius: 2,
  },
  content: {
    position: 'relative',
    zIndex: 2,
  },
  corner: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderColor: Colors.brass,
    zIndex: 3,
  },
  cornerTL: {
    top: 8,
    left: 8,
    borderTopWidth: 1,
    borderLeftWidth: 1,
  },
  cornerTR: {
    top: 8,
    right: 8,
    borderTopWidth: 1,
    borderRightWidth: 1,
  },
  cornerBL: {
    bottom: 8,
    left: 8,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
  },
  cornerBR: {
    bottom: 8,
    right: 8,
    borderBottomWidth: 1,
    borderRightWidth: 1,
  },
});
