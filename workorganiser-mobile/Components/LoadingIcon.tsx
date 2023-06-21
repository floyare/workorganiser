import { ActivityIndicator, View } from "react-native";
import { COLOR_BACKGROUND_40, COLOR_MAIN } from "../Modules/InternalModule";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

const LoadingIcon = () => {
  return ( 
    <Animated.View entering={FadeIn} exiting={FadeOut} style={{position: "absolute", width: "100%", height: "100%", display: "flex", justifyContent:"center", alignItems: "center", zIndex: 250}}>
      <ActivityIndicator size="large" style={{backgroundColor: COLOR_BACKGROUND_40, borderWidth: 1, borderColor: COLOR_MAIN, padding: 10, borderRadius: 10}} color={COLOR_MAIN} />
    </Animated.View>
  );
}
 
export default LoadingIcon;