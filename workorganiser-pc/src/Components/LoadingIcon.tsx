import { CSSProperties } from "react";
import "../Styles/LoadingIcon.scss";
const LoadingIcon = ({styles}: {styles?: CSSProperties}) => {
  return (  
    <div className="loading" style={styles} />
  );
}
 
export default LoadingIcon;