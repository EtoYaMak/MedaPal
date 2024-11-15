import React, { createContext, useContext, useEffect, useState } from "react";
import {
  useColorScheme as useSystemColorScheme,
  StatusBar,
} from "react-native";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: typeof lightColors;
}

const lightColors = {
  background: "#F7F7F7",
  card: "#FFFFFF",
  text: "#000000",
  subText: "#666666",
  primary: "#2196F3",
  border: "#E0E0E0",
  badge: {
    background: "#E3F2FD",
    text: "#1976D2",
  },
};

const darkColors = {
  background: "#121212",
  card: "#1E1E1E",
  text: "#FFFFFF",
  subText: "#AAAAAA",
  primary: "#2196F3",
  border: "#333333",
  badge: {
    background: "#1A2737",
    text: "#90CAF9",
  },
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  colors: lightColors,
});

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps): JSX.Element {
  const systemColorScheme = useSystemColorScheme() as Theme;
  const [theme, setTheme] = useState<Theme>(systemColorScheme);

  useEffect(() => {
    setTheme(systemColorScheme);
  }, [systemColorScheme]);

  const toggleTheme = () => {
    setTheme((current) => {
      const newTheme = current === "light" ? "dark" : "light";
      StatusBar.setBarStyle(
        newTheme === "dark" ? "light-content" : "dark-content"
      );
      StatusBar.setBackgroundColor(newTheme === "dark" ? "#121212" : "#F7F7F7");
      return newTheme;
    });
  };

  useEffect(() => {
    StatusBar.setBarStyle(theme === "dark" ? "light-content" : "dark-content");
    StatusBar.setBackgroundColor(theme === "dark" ? "#121212" : "#F7F7F7");
  }, [theme]);

  const colors = theme === "light" ? lightColors : darkColors;

  const value = {
    theme,
    toggleTheme,
    colors,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
