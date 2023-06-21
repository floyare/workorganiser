import { Icon } from "@iconify/react";
import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { logOut, updateUsersColor } from "../Auth/supabase";
import { returnToLogin } from "../Modules/WindowsManager";
import { executeNotification} from "../Modules/NotificationHandler";
import { assignHue, limitRates} from "../Modules/InternalModuleHandler";
import { HexColorPicker } from "react-colorful";
import { TodosListContext } from "../App";
import { NotificationType } from "../Interfaces/INotificationBox";

const AppSettings = ({showSettingsSet}: {showSettingsSet: Dispatch<SetStateAction<boolean>>}) => {
  const root = document.documentElement;
  const todosListContext = useContext(TodosListContext)

  const [appAccent, setAppAccent] = useState<string | null>(todosListContext.userData?.color_accent ? todosListContext.userData.color_accent : root.style.getPropertyValue('--CL_FOREGROUND'));
  const [localColor, setLocalColor] = useState<string | null>(todosListContext.userData?.color_accent ? todosListContext.userData.color_accent : root.style.getPropertyValue('--CL_FOREGROUND'))

  useEffect(() => {
    root.style.setProperty('--CL_FOREGROUND', appAccent);
    assignHue(appAccent!)
    todosListContext.userDataSet({...todosListContext.userData!, color_accent: appAccent});
  }, [appAccent])

  const handleConfirm = async () => {
    const limit = limitRates(
      () => {
        updateUsersColor(appAccent!).then((res) => {
          if(res.error) {
            executeNotification(todosListContext, res.error.toString(), NotificationType.ERROR);
            return
          }
    
          executeNotification(todosListContext, "User's profile updated!", NotificationType.SUCCESS);
          showSettingsSet(false);
        })
      }
    )
    
    if(limit.error){
      executeNotification(todosListContext, limit.error, NotificationType.ERROR);
      return;
    }
  }

  return (
    <div className="panel__container">
      <div className="side__panel">
        <h1>Settings</h1>
        
        <p className="panel__content_header"><Icon icon="mdi:user" /> Account settings: </p>
        <div className="panel__content" style={{display: "flex", alignItems: "center"}}>
          <div className="user__tab">
            <div className="user__box">
              <img src={todosListContext.userData?.user.avatar_url ? todosListContext.userData?.user.avatar_url : ""}></img>
              <div>
                <p className="username">{todosListContext.userData?.user.preferred_username}</p>
                <p className="provider">{todosListContext.userData?.provider}</p>
              </div>
            </div>
          </div>
          <button className="danger__button" onClick={async() => {
            logOut().then(() => {
              returnToLogin();
            })
          }}><Icon icon="uiw:logout" /> Logout</button>
        </div>

        <p className="panel__content_header" style={{marginTop: 20}}><Icon icon="mdi:color" /> App color accent: </p>
        <div className="panel__content">
          <HexColorPicker color={appAccent ? appAccent : "#9b6df1"} onChange={setAppAccent} />
        </div>

        <div className="todo__create_section">
          <button className="confirm" onClick={handleConfirm}><Icon icon="material-symbols:save" /> Save</button>
          <button className="cancel" onClick={() => {showSettingsSet(false); todosListContext.userDataSet({...todosListContext.userData!, color_accent: localColor}); root.style.setProperty('--CL_FOREGROUND', localColor); assignHue(localColor!)}}><Icon icon="bi:arrow-return-left" /> Cancel</button>
        </div>
      </div>
    </div>
  );
}
 
export default AppSettings;