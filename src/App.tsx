import Toolbar, { MainMenu } from "./toolbars/Toolbar";
import { SidebarMenu } from "./toolbars/SidebarMenu";
import { Workspace } from "./workspace";
import Help from "./Help";
import CatsPackDialog from "./CatsPackDialog";

import "./App.css";

function App() {
  return (
    <>
      <div className="max-w-3xl mx-auto">
        <header className="my-6 text-5xl font-bold uppercase select-none">
          <p className="w-fit rotate-[3deg]">сделай</p>
          <p className="w-fit rotate-[-2deg]">стикер</p>
          <p className="w-fit rotate-[1deg]">с&nbsp;котами</p>
        </header>

        <div className="flex flex-col gap-8">
          <MainMenu />
          <div className="flex gap-4">
            <Workspace />
            <SidebarMenu />
          </div>
          <Toolbar />
          <CatsPackDialog />
        </div>
      </div>

      <div className="mt-16 pt-16 pb-8 bg-slate-50 dark:bg-slate-900">
        <div className="mx-auto w-fit">
          <Help />
        </div>
      </div>
    </>
  );
}

export default App;
