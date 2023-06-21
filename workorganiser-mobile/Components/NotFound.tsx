import { View, Text, StyleSheet } from "react-native";
import Icon from 'react-native-vector-icons/Feather';
import { COLOR_MAIN, COLOR_SUBTEXT, COLOR_TEXT } from "../Modules/InternalModule";

const NotFound = () => {
  return (
    <View style={style.container}>
      <Icon name="meh" style={style.icon} color={COLOR_MAIN} size={62}></Icon>
      <Text style={style.header}>No todos</Text>
      <Text style={style.desc}>Create your first todo right here!</Text>
    </View>
  );
}

const style = StyleSheet.create({
  icon: {
    verticalAlign: "middle",
    paddingRight: 5,
  },
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: 20
  },
  header: {
    fontSize: 30,
    color: COLOR_TEXT,
    fontWeight: "300"
  },
  desc: {
    color: COLOR_SUBTEXT,
    verticalAlign: 'middle',
  },
})
 
export default NotFound;