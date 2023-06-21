import { REQUEST_RATE_LIMIT, isLoggedIn } from "../Auth/supabase"
import { IAppFlow } from "../Interfaces/IAppFlow";
import { showTodosPage } from "./WindowsManager";

export const getAppFlow: () => Promise<IAppFlow> = async () => {
  const loggedIn = await isLoggedIn();
  if(loggedIn){
    showTodosPage();
    return {isLoggedIn: true};
  }else{
    return {isLoggedIn: false};
  }
}

//https://stackoverflow.com/questions/2161383/how-can-i-get-the-name-of-function-inside-a-javascript-function
export function debug(title:string, message: string | string[] | [] | {}, color?: string){
  console.log(`%c[${title}] %c` + message, `color: ${color ? color : "#9b6df1"}`, "color: white");
}

type limit = {func: () => void, requestAmount: number, timeoutVoid?: NodeJS.Timeout}
let limits: limit[] = [];

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

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255, g /= 255, b /= 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h! /= 6;
  }

  return [h, s, l];
}

function hexToRgb(hex: string) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export function assignHue(color: string){
  const root = document.documentElement;
  const conv = hexToRgb(color)
  const convcur = hexToRgb("#502e9a")
  if(!conv) return
  if(!convcur) return

  const base = rgbToHsl(convcur.r,convcur.g,convcur.b);
  const target = rgbToHsl(conv.r,conv.g,conv.b);

  const h = (target[0]!) - (base[0]!)
  const s = 100 + ((target[1]!) - (base[1]!))
  const l = 100 + ((target[2]!) - (base[2]!))

  root.style.setProperty('--CL_HUE',  `hue-rotate(${h*360}deg) saturate(${s}%) brightness(${l}%)`);
}