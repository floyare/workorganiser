import { Button, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { HomePageStyle } from "../Styles/HomePage";
import { StatusBar } from 'expo-status-bar';
import { COLOR_BACKGROUND_A1, COLOR_BACKGROUND_A2, COLOR_MAIN, COLOR_SUBTEXT, COLOR_TEXT } from "../Modules/InternalModule";
import Icon from "react-native-vector-icons/AntDesign";
import { supabase } from "../Auth/supabase";
import { SignInWithOAuthCredentials } from "@supabase/supabase-js";
import { OAuthSignIn } from "../Auth/OAuthHandler";
import { useContext } from "react";
import { AppContextProvider, Stack } from "../App";
import Toast from "react-native-toast-message";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image } from "react-native";
import { useAssets } from "expo-asset";

const LoginPage = () => {
  const appContext = useContext(AppContextProvider)
  const navigation = useNavigation<NativeStackNavigationProp<any>>()
  const [assets, error] = useAssets([require('../assets/icon.png')]);
  const handleOAuthLogin = async (provider: SignInWithOAuthCredentials) => {
    const result = await OAuthSignIn(provider)
    if(!result.error){
      Toast.show({
        type: 'success',
        text1: 'Logged in successfully!',
      });

    }else{
      Toast.show({
        type: 'error',
        text1: result.error,
        visibilityTime: 8000   
      });
    }
  }

  const HomePageStyleReference = HomePageStyle(COLOR_MAIN)
  return (
    <SafeAreaView style={HomePageStyleReference.container}>
      <StatusBar style="auto" />
      <View style={style.container}>
        {!appContext?.userData ?
        <>
          {assets ? <Image source={{uri: assets[0].uri, width: 150, height:100}}></Image> : null}
          <Text style={{fontSize: 24, color: COLOR_TEXT, fontWeight: "900", letterSpacing: 2}}>workorganiser.</Text>
          <Text style={{fontSize: 14, color: COLOR_SUBTEXT, fontWeight: "300"}}>Select your login method:</Text>
          <View style={style.loginMethods}>
            <TouchableOpacity style={style.loginOption} onPress={() => {handleOAuthLogin({provider: "github"})}}>
              <Text style={{color: COLOR_SUBTEXT, fontSize: 18}}><Icon name="github"></Icon> Github</Text>
            </TouchableOpacity>
          </View>
        </>
        :
        <ActivityIndicator size="large" color={COLOR_MAIN} />}
      </View>
    </SafeAreaView>
  );
}

const style = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center"
  },
  loginMethods: {
    margin: 15
  },
  loginOption: {
    backgroundColor: COLOR_BACKGROUND_A1,
    padding: 15,
    borderRadius: 15
  }
})
 
export default LoginPage;