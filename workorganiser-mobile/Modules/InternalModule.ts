import moment, { Moment } from "moment";
import { REQUEST_RATE_LIMIT, TodoRow, getUser, supabase } from "../Auth/supabase";
import { AppContext } from "../Interfaces/AppContext";
import { AppError } from "../Interfaces/AppError";
import { FetchOptions } from "../Interfaces/FetchOptions";
import * as Notifications from 'expo-notifications';

export async function fetchColor(){
  const {user, error} = await getUser();
  const profile = await supabase.from("profiles").select("*").eq("id", user?.id)
  if(!profile.data) return "rgb(155, 109, 241)"
  COLOR_MAIN = profile.data[0].selected_accent ? profile.data[0].selected_accent : "rgb(155, 109, 241)";
  COLOR_MAIN_40 = profile.data[0].selected_accent ? profile.data[0].selected_accent + "44" : "#9b6df144"
}

export let COLOR_MAIN: string //= "rgb(155, 109, 241)";

export function changeLocalAccentColor(color: string){
  COLOR_MAIN = color
}

export let COLOR_MAIN_40 = "rgba(155, 109, 241, 0.4)"
export const COLOR_BACKGROUND = "#0f0f0f";
export const COLOR_BACKGROUND_A1 = "#151515";
export const COLOR_BACKGROUND_A2 = "#1E1E1E";
export const COLOR_BACKGROUND_40 = "rgba(15,15,15,.4)";
export const COLOR_TEXT = "#f7f7f7";
export const COLOR_SUBTEXT = "#b1afaf";
export const COLOR_SUCCESS = "rgb(64, 173, 50)"
export const COLOR_FAILED = "#f68888"
export const COLOR_WARNING = "rgb(226, 173, 27)"
export const COLOR_INFO = "#000"

export const COLOR_OUTDATED = "rgb(189, 53, 53)";
export const COLOR_NEAREND = "rgb(236, 123, 123)";

export function isEmptyOrSpaces(str: string | null | undefined){
  return str === null || str?.match(/^ *$/) !== null;
}

const convertTimestamp = (unix: number) => {
  return moment.unix(unix).format('YYYY-MM-DD HH:mm:ss');
}

const getTimestamp = (date: Moment) => {
  return moment(date).unix();
}

const getTimeLeft = (unix: number) => {
  return moment(convertTimestamp(unix)).fromNow();
}

const isOutdated = (start: Date) => {
  const date = start;
  const now = (new Date())
  const diffTime = date.valueOf() - now.valueOf();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return (diffDays <= 0 && diffTime < 0) ? true : false;
}

export async function schedulePushNotification(todo: TodoRow) {
  var target = moment(todo.deadline)
  target.subtract(3, 'd')

  await Notifications.scheduleNotificationAsync({
    identifier: todo.id.toString(),
    content: {
      title: (!isOutdated(new Date(todo.deadline!.toString())) ?  "‼ Your todo is about to expire " : "⚠ Your todo is expired since ") + getTimeLeft(moment(todo.deadline).unix()),
      body: todo.content!.replace(/<\/?[^>]+(>|$)/g, ""),
      data: { todo: todo },
      color: (!isOutdated(new Date(todo.deadline!.toString())) ? COLOR_MAIN : COLOR_FAILED),
      autoDismiss: true,
      sticky: true
    },
    trigger: Number(new Date(target.local().format("YYYY-MM-DDTHH:mm:ss"))) - Number(new Date()) <= 0 ? null : { date: new Date(target.local().format("YYYY-MM-DDTHH:mm:ss"))}
  });

}

export function debug(title:string, message: string | string[] | [] | {}, color?: string){
  console.log(`%c[${title}] %c` + message, `color: ${color ? color : "#9b6df1"}`, "color: white");
}

type limit = {func: () => void, requestAmount: number, timeoutVoid?: NodeJS.Timeout}
let limits: limit[] = [];

export function executeErrorAction(appContext: AppContext, error: AppError){
  if(!appContext)
    throw new Error("AppContext is null. This is likely an app bug. Please restart and contact developer.")
  
  appContext.appStateSet(
    {state: "ERROR", error: {content: error.content, code: error.code, initiator: error.initiator}}
  )
}

function decrementRequestsAmount(props: limit){
  if(props.requestAmount > 0){
    props.timeoutVoid = setTimeout(() => {
      props.requestAmount--;

      decrementRequestsAmount(props);
    }, 5000);
  }
}

export function limitRates(func: () => void){
  const selectedFunc = limits.find(f => {return f.func.toString() === func.toString()});
  if(!selectedFunc){
    limits.push({func: func, requestAmount: 0, timeoutVoid: undefined})
    func()
  }else{
    selectedFunc.requestAmount++;

    clearTimeout(selectedFunc.timeoutVoid);
    decrementRequestsAmount(selectedFunc);
    if(selectedFunc.requestAmount >= REQUEST_RATE_LIMIT){
      return {error: "Rate limited"}
    }else{
      func()
    }
  }

  return {error: null}
}

export function reRunFunction(func: () => void){
  debug(func.name, `Failed while running ${func.name}. Restarting in 20 seconds`, "red");
  setTimeout(func, 20000)
}