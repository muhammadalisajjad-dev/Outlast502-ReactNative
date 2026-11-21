import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GameProvider } from './src/context/GameContext';
import { Colors } from './src/theme/colors';
import { ScreenTransition } from './src/components/common/ScreenTransition';
import { HomeScreen } from './src/screens/HomeScreen';
import { SetupScreen } from './src/screens/SetupScreen';
import { GameScreen } from './src/screens/GameScreen';
import { ScoreboardScreen } from './src/screens/ScoreboardScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { RulesScreen } from './src/screens/RulesScreen';

type ScreenType = 'home' | 'setup' | 'game' | 'scoreboard' | 'history' | 'rules';

function MainNavigator() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [previousScreen, setPreviousScreen] = useState<ScreenType>('home');

  const navigateTo = (screen: ScreenType) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
  };

  const handleBack = () => {
    setCurrentScreen(previousScreen === 'setup' ? 'home' : previousScreen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onNavigate={navigateTo} />;

      case 'setup':
        return (
          <SetupScreen
            onBack={() => setCurrentScreen('home')}
            onStartGame={() => setCurrentScreen('game')}
          />
        );

      case 'game':
        return (
          <GameScreen
            onOpenScoreboard={() => navigateTo('scoreboard')}
            onOpenRules={() => navigateTo('rules')}
            onGoHome={() => setCurrentScreen('home')}
          />
        );

      case 'scoreboard':
        return <ScoreboardScreen onBack={handleBack} />;

      case 'history':
        return <HistoryScreen onBack={() => setCurrentScreen('home')} />;

      case 'rules':
        return <RulesScreen onBack={handleBack} />;

      default:
        return <HomeScreen onNavigate={navigateTo} />;
    }
  };

  return (
    <ScreenTransition key={currentScreen}>
      {renderScreen()}
    </ScreenTransition>
  );
}

export default function App() {
  // Web-only: replace the browser's default white focus ring with a brass one
  // so keyboard focus still reads clearly without breaking the club palette.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const styleId = 'outlast502-web-focus';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      *:focus { outline: none; }
      html.keyboard-nav *:focus { outline: 1px solid rgba(198, 164, 96, 0.85); outline-offset: 2px; }
    `;
    document.head.appendChild(style);

    const enableKeyboardNav = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        document.documentElement.classList.add('keyboard-nav');
      }
    };
    const disableKeyboardNav = () => {
      document.documentElement.classList.remove('keyboard-nav');
    };
    window.addEventListener('keydown', enableKeyboardNav);
    window.addEventListener('mousedown', disableKeyboardNav);
    window.addEventListener('touchstart', disableKeyboardNav);
    return () => {
      window.removeEventListener('keydown', enableKeyboardNav);
      window.removeEventListener('mousedown', disableKeyboardNav);
      window.removeEventListener('touchstart', disableKeyboardNav);
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={styles.rootContainer}>
        <GameProvider>
          <MainNavigator />
        </GameProvider>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: Colors.tableDeep,
  },
});
