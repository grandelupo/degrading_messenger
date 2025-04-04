import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

const messengerBlue = '#0084FF';
const messengerLightBlue = '#00B2FF';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: messengerBlue,
    primaryContainer: messengerLightBlue,
    secondary: '#F3F3F3',
    secondaryContainer: '#E4E6EB',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    error: '#FF3B30',
    onPrimary: '#FFFFFF',
    onSecondary: '#000000',
    onBackground: '#000000',
    onSurface: '#000000',
    elevation: {
      level0: 'transparent',
      level1: '#F7F7F7',
      level2: '#F3F3F3',
      level3: '#EFEFEF',
      level4: '#EBEBEB',
      level5: '#E7E7E7',
    },
  },
  roundness: 20,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: messengerBlue,
    primaryContainer: messengerLightBlue,
    secondary: '#2E2E2E',
    secondaryContainer: '#3A3B3C',
    background: '#000000',
    surface: '#121212',
    error: '#FF453A',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#FFFFFF',
    onSurface: '#FFFFFF',
    elevation: {
      level0: 'transparent',
      level1: '#1C1C1C',
      level2: '#232323',
      level3: '#282828',
      level4: '#2E2E2E',
      level5: '#333333',
    },
  },
  roundness: 20,
}; 