import type { ComponentProps } from "react";
import { useEffect } from "react";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export function ElasticSpinnerView(
  props: ComponentProps<typeof Animated.View>,
) {
  const rotation = useSharedValue(0);
  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotateZ: `${rotation.value}deg`,
        },
      ],
    };
  }, [rotation.value]);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(180, {
        duration: 1000,
        easing: Easing.elastic(1),
      }),
      Infinity,
    );
    return () => cancelAnimation(rotation);
  }, [rotation]);

  return (
    <Animated.View style={animatedStyles} {...props}>
      {props.children}
    </Animated.View>
  );
}
