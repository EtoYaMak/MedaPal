import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';

export function useAppTheme() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return {
    colors,
    colorScheme,
  };
} 