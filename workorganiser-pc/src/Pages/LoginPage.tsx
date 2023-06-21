import { Icon } from "@iconify/react";
import "../Styles/SLoginPage.scss";
import { authorizeWithOAuth } from "../Auth/OAuthHandler";
import {useEffect, useState} from "react"
import { getAppFlow } from "../Modules/InternalModuleHandler";
import { IAppFlow } from "../Interfaces/IAppFlow";
import LoadingIcon from "../Components/LoadingIcon";
import { initializeOAuth } from "../Auth/OAuthHandler";
import { AuthError } from "@supabase/supabase-js";
import SmallErrorBox from "../Components/SmallErrorBox";
import { useAutoAnimate } from "@formkit/auto-animate/react";

const LoginPage = () => {
  const [isLoading, isLoadingSet] = useState(true);
  const [error, errorSet] = useState<AuthError | null>(null);
  const [animationParent] = useAutoAnimate({});

  const handleGithubLogin = async () => {
    errorSet(null)
    await authorizeWithOAuth('github');
  }

  useEffect(() => {
    initializeOAuth(isLoadingSet, errorSet);

    async function checkAppFlow(){
      const {isLoggedIn}: IAppFlow = await getAppFlow();
      isLoadingSet(isLoggedIn);
    }

    checkAppFlow();
  },[]);

  return (
    <div className="login__page">
      <div className="login__page_wrapper">
        <div className="login__page_container">
          {isLoading && <LoadingIcon />}
          <div className="animation__handler" ref={animationParent}>
            {error && <SmallErrorBox error={error.message}></SmallErrorBox>}
          </div>
          {!isLoading && 
            <>
              <h1>Sign in with:</h1>
              <div className="login__page_methods">
                <div className="method" onClick={handleGithubLogin}>
                  <Icon icon="mdi:github" />
                  <p>Github</p>
                </div>
              </div>
            </>
          }
        </div>
      </div>
    </div>
  );
}
 
export default LoginPage;

function invoke(arg0: string) {
  throw new Error("Function not implemented.");
}
