import { GestureResponderEvent, ScrollView, StyleProp, StyleSheet, Text, TouchableNativeFeedback, View, ViewProps, ViewStyle } from "react-native";
import { COLOR_BACKGROUND_A2, COLOR_MAIN, COLOR_TEXT, COLOR_BACKGROUND_A1, COLOR_SUBTEXT, COLOR_OUTDATED, COLOR_NEAREND } from "../../Modules/InternalModule";
import { RegionCode, TodoRow } from "../../Auth/supabase";
import Icon from "react-native-vector-icons/AntDesign";
import moment, { Moment } from "moment";
import {useContext} from "react"
import { AppContextProvider, ModalType } from "../../App";
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';

const convertTimestamp = (unix: number) => {
  return moment.unix(unix).format('YYYY-MM-DD HH:mm:ss');
}

const getTimestamp = (date: Moment) => {
  return moment(date).unix();
}

const getTimeLeft = (unix: number) => {
  return moment(convertTimestamp(unix)).fromNow();
}

export const is3DayDifference = (start: Date) => {
  const date = start;
  const now = (new Date())
  const diffTime = date.valueOf() - now.valueOf();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return diffDays <= 3 ? true : false;
}

export const isOutdated = (start: Date) => {
  const date = start;
  const now = (new Date())
  const diffTime = date.valueOf() - now.valueOf();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return (diffDays <= 0 && diffTime < 0) ? true : false;
}

const getColor = (deadline: string | null, defaultColor: string) => {
  return deadline ? (isOutdated(new Date(deadline)) ? COLOR_OUTDATED : 
  is3DayDifference(new Date(deadline)) ? COLOR_NEAREND : defaultColor) : defaultColor
}

const TodoBox = ({todo, styles, onStartShouldSetResponder}: {todo: TodoRow, styles?: StyleProp<ViewStyle>, onStartShouldSetResponder?: ((event: GestureResponderEvent) => boolean) | undefined}) => {
  const appContext = useContext(AppContextProvider)
  const handleLongPress = () => {
    appContext?.selectedTodoSet(todo)
    appContext?.showModalSet(ModalType.TODO_PANEL)
  } 

  function convertLink(text: string){
    var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
    var newStr = text.replace(urlRegex, (url) => {
      var hyperlink = url;

      if (!hyperlink.match('^https?:\/\/')) {
        hyperlink = 'http://' + hyperlink;
      }

      return `<a href="${hyperlink}" style="color:'${COLOR_MAIN}' cursor: pointer;">${hyperlink}</a>`
      })
      return newStr;
  }
  
  const { width } = useWindowDimensions();
  return (
    <>
      <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple(getColor(todo.deadline, COLOR_MAIN), false
      )} style={{borderRadius: 10}} onLongPress={handleLongPress} onPress={() => {}}>
        <View style={[style.todoBox, styles, {borderColor: getColor(todo.deadline, todo.is_important ? COLOR_MAIN : COLOR_BACKGROUND_A2)}]}>

          <Text style={[style.smallText, {marginVertical: 5}]}><Icon name="calendar" /> {new Date(todo.created_at!).toLocaleDateString(RegionCode, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>

          <View>
            <ScrollView style={onStartShouldSetResponder ? {maxHeight: 300} : null}>
              <View onStartShouldSetResponder={onStartShouldSetResponder}>
                {/* <Hyperlink linkStyle={{color: COLOR_MAIN}} linkDefault={true}> */}
                  <Text style={[style.text, {marginVertical: 10, maxWidth: 100}]}>
                    {
                      <RenderHtml
                        contentWidth={width}
                        source={{html: `<p style="color: '${COLOR_TEXT}', whiteSpace: 'normal', textAlign: 'left', maxWidth: 300, fontSize: '18px'">${convertLink(todo.content!)}</p>`}}
                        tagsStyles={{p: {color: COLOR_TEXT, whiteSpace: 'normal', textAlign: 'left', maxWidth: 300, fontSize: 18}, a: {color: COLOR_MAIN, fontWeight: "900"}}}
                        enableExperimentalMarginCollapsing={true}
                        enableExperimentalGhostLinesPrevention={true}
                        />
                    } {todo.edit_date ? <Text style={style.smallText}>(edited)</Text> : null}
                  </Text>
                {/* </Hyperlink> */}
              </View>
            </ScrollView>
          </View>

          {todo.deadline && 
            (
              <>       
                <Text style={[style.smallText, {color: COLOR_SUBTEXT, marginTop: 10}]}><Icon name="clockcircle"></Icon> Deadline:</Text>
                <Text style={[
                  style.text,
                  {
                    color: getColor(todo.deadline, COLOR_TEXT)
                  },
                  {
                    fontWeight: isOutdated(new Date(todo.deadline)) ? "900" : "300"
                  }
                ]}>{getTimeLeft(moment(todo.deadline).unix())}</Text>
              </>
            )
          }
        </View>
      </TouchableNativeFeedback>
    </>
  );
}

const style = StyleSheet.create({
  text: {
    color: COLOR_TEXT,
    fontSize: 18,
  },
  todoBox: {
    borderColor: COLOR_BACKGROUND_A2,
    backgroundColor: COLOR_BACKGROUND_A1,
    borderWidth: 1,
    borderRadius: 10,
    margin: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    minWidth: 350,
    position: 'relative',
    overflow: 'hidden',
    //maxHeight: 450,
  },
  pseudoLight: {
    height: 120,
    width: 160,
    top: -30,
    left: -40,
    position: "absolute",
    zIndex: -1,
    borderRadius: 100,
    backgroundColor: "gray",
    opacity: 0.1
  },
  smallText: {
    color: COLOR_SUBTEXT,
    fontSize: 14,
  }
});
 
export default TodoBox
;