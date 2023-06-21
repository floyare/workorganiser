import { StyleSheet } from "react-native";
import { Text } from "react-native";
import Constants from "expo-constants";
import moment from "moment";

const Version = () => {
  return ( 
    <Text style={style.text}>{Constants.expoConfig?.version} ({Constants.expoConfig?.extra!.buildDate})</Text>
  );
}

const style = StyleSheet.create({
  text: {
    color: 'white',
    position: 'absolute',
    bottom: 0,
    left: 0,
    opacity: 0.5,
    fontSize: 10,
    zIndex: Number.MAX_SAFE_INTEGER
  }
});
 
export default Version;