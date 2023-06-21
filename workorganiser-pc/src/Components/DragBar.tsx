import { Icon } from '@iconify/react';
import { appWindow } from '@tauri-apps/api/window'
import { IDragBar } from '../Interfaces/IDragBar';

const DragBar = ({showControls = true, windowTitle = "Workorganiser"}: IDragBar)=> {
  return (
    <div data-tauri-drag-region className="drag__bar">
      <div className="drag__content" data-tauri-drag-region>
        <div className="window__name" data-tauri-drag-region>
          <img src="/icon.png" width={50}></img>
          <p>{windowTitle}</p>
        </div>
        {showControls && 
          <div className="controls" data-tauri-drag-region>
            <Icon icon="material-symbols:chrome-minimize" onClick={() => {appWindow.minimize()}}/>
            <Icon icon="material-symbols:close" onClick={() => {appWindow.close()}}/>
          </div>
        }
      </div>
    </div>
  );
}
 
export default DragBar;