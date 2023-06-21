import { StatusInterface } from "../Interfaces/StatusInterface";
import { StyleSheet, Text, View } from 'react-native';
import { COLOR_BACKGROUND, COLOR_TEXT, COLOR_BACKGROUND_40, COLOR_SUCCESS, COLOR_MAIN, COLOR_WARNING, COLOR_FAILED} from "../Modules/InternalModule";
import { StatusType } from "../Auth/supabase";
import Icon from 'react-native-vector-icons/FontAwesome';

const StatusPanel = ({statusMessage, statusType}: StatusInterface) => {
  return (
    <View style={[style.statusBox, 
      {backgroundColor: statusType === StatusType.SUCCESS ? COLOR_SUCCESS : 
        statusType === StatusType.ERROR ? COLOR_FAILED : 
          statusType === StatusType.WARNING ? COLOR_WARNING : COLOR_MAIN}
      ]}>
      <Icon style={style.icon} name={statusType === StatusType.SUCCESS ? "check-circle" :
          StatusType.ERROR ? "error" :
          StatusType.WARNING ? "warning" : "questioncircle"} size={20}/>
      <Text style={style.text}>
        {statusMessage}
      </Text>
    </View>
  );
}

const style = StyleSheet.create({
  icon: {
    verticalAlign: "middle",
    color: 'white',
    paddingRight: 5
  },
  text: {
    color: COLOR_TEXT,
    verticalAlign: 'middle',
  },
  statusBox: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 35,
    margin: 10,
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  }
})

export default StatusPanel;