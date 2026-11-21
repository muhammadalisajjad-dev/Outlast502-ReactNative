import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GameProvider } from './src/context/GameContext';
import { Colors } from './src/theme/colors';
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
}

export default function App() {
  return (
    <SafeAreaProvider>
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
