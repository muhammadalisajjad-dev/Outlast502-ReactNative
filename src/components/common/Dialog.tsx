import React, { useEffect, useRef } from 'react';
import { Modal, View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { Colors } from '../../theme/colors';

interface DialogProps {
  visible: boolean;
  children: React.ReactNode;
  onRequestClose?: () => void;
  maxWidth?: number;
  style?: ViewStyle;
}

/**
 * A quiet elevated sheet: soft radius, one hairline and a gentle settle.
 */
export const Dialog: React.FC<DialogProps> = ({
  visible,
  children,
  onRequestClose,
  maxWidth = 360,
  style,
}) => {
  const enterAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      enterAnim.setValue(0);
      Animated.spring(enterAnim, {
        toValue: 1,
        speed: 24,
        bounciness: 3,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, enterAnim]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.panel,
            { maxWidth },
            style,
            {
              opacity: enterAnim,
              transform: [
                {
                  scale: enterAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.96, 1],
                  }),
                },
                {
                  translateY: enterAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  panel: {
    width: '100%',
    backgroundColor: Colors.surfaceRaised,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.lineStrong,
    paddingHorizontal: 22,
    paddingVertical: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
});

export const DecoModal = Dialog;

