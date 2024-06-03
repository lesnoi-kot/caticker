import Help from "./Help";
import Toolbar, { MainMenu } from "./Toolbar/Toolbar";
import Workspace from "./Workspace/Workspace";
import CatsPackDialog from "./Workspace/CatsPackDialog";

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
          <Workspace />
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
