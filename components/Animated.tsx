import React from "react";
import { Pressable } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";

interface AnimatedViewProps {
  children: React.ReactNode;
  entering?: "fade" | "slide" | "down" | "none";
  exiting?: "fade" | "slide" | "down" | "none";
  style?: any;
  delay?: number;
}

export function AnimatedView({
  children,
  entering = "fade",
  exiting = "fade",
  style,
  delay = 0,
}: AnimatedViewProps) {
  const getEnteringAnimation = () => {
    switch (entering) {
      case "fade":
        return FadeIn.delay(delay);
      case "slide":
        return SlideInRight.delay(delay);
      case "down":
        return SlideInDown.delay(delay);
      default:
        return undefined;
    }
  };

  const getExitingAnimation = () => {
    switch (exiting) {
      case "fade":
        return FadeOut;
      case "slide":
        return SlideOutLeft;
      case "down":
        return SlideOutDown;
      default:
        return undefined;
    }
  };

  return (
    <Animated.View
      entering={getEnteringAnimation()}
      exiting={getExitingAnimation()}
      style={style}
    >
      {children}
    </Animated.View>
  );
}

export const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
