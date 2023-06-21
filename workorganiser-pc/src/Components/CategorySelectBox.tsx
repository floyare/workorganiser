import { ChangeEventHandler } from "react";
import "../Styles/SSelectBox.scss";
import { CategoriesTable, CategoryRow } from "../Auth/supabase";

const CategorySelectBox = ({title, selected, options, onChange, showActions = true}: {title: string, selected?: CategoryRow | null, options: CategoriesTable | null, onChange: ChangeEventHandler<HTMLSelectElement>, showActions?: boolean}) => {
  return (  
    <label>
      <p>{title}</p>
      <div className="select">
      {/* BUG:8 */}
      <select value={selected ? selected?.name === "🗑️ Archivized" ? "$_ARCHIVIZED_$" : selected.id : "None"} onChange={onChange}>
        <option>None</option>
        {options?.length && 
          (
            options.map(option => {
              if(option.name === "🗑️ Archivized" && !showActions)
                return;
                
              if(option.name === "🗑️ Archivized" && showActions)
                return(<option className="archive" key={option.id} value={"$_ARCHIVIZED_$"}>🗑️ Archivized</option>)

              return (<option value={option.id as number} key={option.id}>{option.name}</option>)
            })
          )  
        }
        {showActions && <option className="new" value={"$_NEW_CATEGORY_$"}>+ Add new</option>}
      </select>
    </div>
    </label>
  );
}
 
export default CategorySelectBox;