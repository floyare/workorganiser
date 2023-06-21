import { Icon } from '@iconify/react';
const TodoCreateIcon = ({showCreateSet} : {showCreateSet: React.Dispatch<React.SetStateAction<boolean>>}) => {
  return (
    <button className='todo__create_icon' onClick={() => {showCreateSet(true)}}><Icon icon="material-symbols:add-card" /></button>
  );
}
 
export default TodoCreateIcon;