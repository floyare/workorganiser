import { ChangeEventHandler } from "react";
import "../Styles/SSelectBox.scss";

const SelectBox = ({title, selected, options, onChange}: {title: string, selected?: string | null, options: string[] | null, onChange: ChangeEventHandler<HTMLSelectElement>}) => {
  return (  
    <label>
      <p>{title}</p>
      <div className="select">
      <select value={selected ? selected : options![0]} onChange={onChange}>
        {options?.length && 
          (
            options.map((option, index) => {
              return (<option key={index} value={option}>{option}</option>)
            })
          )  
        }
      </select>
    </div>
    </label>
  );
}
 
export default SelectBox;