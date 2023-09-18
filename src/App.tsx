import Help from "./Help";
import Toolbar from "./Toolbar/Toolbar";
import Workspace from "./Workspace/Workspace";

import "./App.css";

function App() {
  return (
    <>
      <header className="my-4 max-w-fit">
        <p className="w-fit rotate-[3deg] transform">сделай</p>
        <p className="w-fit rotate-[-2deg] transform">стикер</p>
        <p className="w-fit rotate-[1deg] transform">с&nbsp;котами</p>
      </header>

      <div className="flex flex-col gap-8">
        <Workspace />
        <Toolbar />
      </div>

      <Help />
    </>
  );
}

export default App;
