import { mainWindowOptions, showTodosPage, staticWindowsTypes } from './../Modules/WindowsManager';
import { WebviewWindow, appWindow } from '@tauri-apps/api/window';
import { supabase } from './supabase';
import { emit, listen } from '@tauri-apps/api/event'
import { open } from '@tauri-apps/api/shell';
import { AuthError, Provider } from '@supabase/supabase-js'
import { invoke } from '@tauri-apps/api/tauri';

function getParameterByName(name: string, url: string) {
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

export const initializeOAuth = async (loadingState: React.Dispatch<React.SetStateAction<boolean>>, errorSet: React.Dispatch<React.SetStateAction<AuthError | null>>) => {
  listen('scheme-request-received', async (request) => {
    errorSet(null)
    loadingState(true);
    const path = request.payload as string;
    const refresh_token: string = getParameterByName('refresh_token', path) as string;
    //const access_token: string = getParameterByName('access_token', path) as string;
    await supabase.auth.refreshSession({refresh_token}).then((res) => {
      if(res.error){
        loadingState(false);
        errorSet(res.error)
        return null;
      }
      
      showTodosPage();
      loadingState(false);

      console.warn(res)
    })
  })
}

export const authorizeWithOAuth = async (provider: Provider) => {
  await supabase.auth.signInWithOAuth({
    provider,
    options: {skipBrowserRedirect: true}
  }).then(async (res) => {
    if(res.error)
      return res.error;
    
    await open(res.data.url as string)
  })
}