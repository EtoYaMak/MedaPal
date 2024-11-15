import React, { useState, useRef } from "react";
import { View, TouchableOpacity, Animated, StyleSheet } from "react-native";
import { Href, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;

    Animated.spring(animation, {
      toValue,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();

    setIsOpen(!isOpen);
  };

  const handleNavigate = (route: string) => {
    router.push(route as Href<string>);
    toggleMenu();
  };

  const rotation = {
    transform: [
      {
        rotate: animation.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "45deg"],
        }),
      },
    ],
  };

  const manualButtonStyle = {
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [100, -60],
        }),
      },
    ],
    opacity: animation,
  };

  const aiButtonStyle = {
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [100, -120],
        }),
      },
    ],
    opacity: animation,
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.buttonContainer} pointerEvents="box-none">
        <Animated.View
          style={[styles.button, styles.secondaryButton, aiButtonStyle]}
          pointerEvents="box-none"
        >
          <TouchableOpacity
            style={styles.touchable}
            onPress={() => handleNavigate("/(tabs)/medications")}
          >
            <Ionicons name="mic-outline" size={24} color="white" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[styles.button, styles.secondaryButton, manualButtonStyle]}
          pointerEvents="box-none"
        >
          <TouchableOpacity
            style={styles.touchable}
            onPress={() => handleNavigate("/(tabs)/add")}
          >
            <Ionicons name="keypad-outline" size={24} color="white" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[styles.button, styles.mainButton, rotation]}
          pointerEvents="box-none"
        >
          <TouchableOpacity
            style={styles.touchable}
            onPress={toggleMenu}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  buttonContainer: {
    position: "relative",
    width: 56,
    height: 200,
    marginBottom: 24,
    marginRight: 24,
    alignSelf: "flex-end",
  },
  button: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  touchable: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  mainButton: {
    backgroundColor: "#2196F3",
    bottom: 0,
  },
  secondaryButton: {
    backgroundColor: "#1976D2",
    bottom: 0,
  },
});
