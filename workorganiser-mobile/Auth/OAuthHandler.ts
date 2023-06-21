import { makeRedirectUri, startAsync } from 'expo-auth-session';
import { supabase } from './supabase';
import { SignInWithOAuthCredentials } from '@supabase/supabase-js';

export const OAuthSignIn = async (provider: SignInWithOAuthCredentials) => {
  const redirectUrl = makeRedirectUri({
    path: '/auth/callback',
    projectNameForProxy: "@floyare/workorganiser-mobile",
    useProxy: true
  });

  const url = await supabase.auth.signInWithOAuth({
    provider: provider.provider,
    options: {redirectTo: !__DEV__ ? "com.floyare.workorganisermobile://auth/callback" : "exp://192.168.33.6:19000/--/auth/callback"}
  })

  if(!url.data.url) return {error: "Auth callback url not found"};

  const authResponse = await startAsync({
    authUrl: url.data.url,
    returnUrl: !__DEV__ ? "com.floyare.workorganisermobile://auth/callback" : "exp://192.168.33.6:19000/--/auth/callback"
  });

  if(!authResponse) return {error: "Auth response returned null"};

  if (authResponse.type === "success") {
    supabase.auth.setSession({
      access_token: authResponse.params.access_token,
      refresh_token: authResponse.params.refresh_token,
    });
    return {error: null};
  }else{
    return {error: "Auth response denied"};
  }
};