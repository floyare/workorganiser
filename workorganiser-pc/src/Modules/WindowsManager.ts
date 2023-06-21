import { WebviewWindow, appWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/tauri";

export enum staticWindowsTypes {
  LOGIN_WINDOW = "loginWindow",
  TODOS_WINDOW = "todosWindow",
  DASHBOARD_WINDOW = "dashboardWindow",
}

export const mainWindowOptions = {
  url: 'index.html',
  resizable: false,
  transparent: true, 
  width: 1100,
  height: 600,
  center: true,
  decorations: false,
  title: "workorganiser"
}

export const loginWindowOptions = {
  url: 'index.html#/login',
  resizable: false,
  transparent: true, 
  width: 400,
  height: 650,
  center: true,
  decorations: false,
  title: "workorganiser - Login"
}

export function showTodosPage(){
  const webwiew = new WebviewWindow(staticWindowsTypes.TODOS_WINDOW, mainWindowOptions);
  webwiew.once('tauri://created', async (a) => {
    invoke('applyBlur', {label: staticWindowsTypes.TODOS_WINDOW});
    WebviewWindow.getByLabel(staticWindowsTypes.LOGIN_WINDOW)?.close();
  });
}

export function returnToLogin(){
  const webwiew = new WebviewWindow(staticWindowsTypes.LOGIN_WINDOW, loginWindowOptions);
  webwiew.once('tauri://created', async (a) => {
    invoke('applyBlur', {label: staticWindowsTypes.LOGIN_WINDOW});
    WebviewWindow.getByLabel(staticWindowsTypes.TODOS_WINDOW)?.close();
  });
}

export const hideWindow = (window: staticWindowsTypes) => {
  WebviewWindow.getByLabel(window)?.hide();
}

export const showWindow = (window: staticWindowsTypes) => {
  WebviewWindow.getByLabel(window)?.show();
}