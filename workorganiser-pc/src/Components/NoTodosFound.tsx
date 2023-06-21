import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const NoTodosFound = ({showCreateSet}: {showCreateSet: React.Dispatch<React.SetStateAction<boolean>> | undefined}) => {
  const [t, i18n] = useTranslation("global")
  return (
    <div className="no__todos">
      <Icon icon="ion:sad" />
      <h1>{t("noTodos.title")}</h1>
      <p onClick={() => {showCreateSet !== undefined ? showCreateSet(true) : null}}>{showCreateSet === undefined ? 
        <Link to="/todos#create"><Icon icon="gridicons:create" /> {t("noTodos.desc")}</Link>
        :
        <><Icon icon="gridicons:create" /> {t("noTodos.desc")}</>
      }</p>
    </div>
  );
}
 
export default NoTodosFound;