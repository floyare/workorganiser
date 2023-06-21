import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { getProviderUserInfo } from "../Auth/supabase";
import { TodosListContext } from "../App";

const UserTab = ({children, showSettingsSet}: {children: any, showSettingsSet: Dispatch<SetStateAction<boolean>>}) => {
  const todosListContext = useContext(TodosListContext)
  const [avatar, avatarSet] = useState<string | null>(null)
  const [username, usernameSet] = useState<string | null>(null)
  const [provider, providerSet] = useState<string | null>(null)

  async function getUsersInfo(){
    if(todosListContext.userData?.user === undefined){
      await getProviderUserInfo().then((res) => {
        if(!res.user) return;
        const providerInfo = res.user;
        avatarSet(providerInfo.avatar_url);
        usernameSet(providerInfo.full_name);
        providerSet(res.provider!);
        todosListContext.userDataSet(res);
      })
    }else{
      avatarSet(todosListContext.userData.user.avatar_url);
      usernameSet(todosListContext.userData.user.full_name);
      providerSet(todosListContext.userData.provider!);
    }
  }

  useEffect(() => {
    getUsersInfo();
  }, []);

  return (
    <div className="user__tab">
      {children}
      <div className="user__box" onClick={() => {showSettingsSet(true)}}>
        <img src={`${avatar}`}></img>
        <div>
          <p className="username">{username}</p>
          <p className="provider">{provider}</p>
        </div>
      </div>
    </div>
  );
}
 
export default UserTab;