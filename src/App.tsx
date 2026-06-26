import { useState } from "react";
import ActivityBar, { type TabId } from "./components/ActivityBar";
import Sidebar from "./components/Sidebar";
import MainPanel from "./components/MainPanel";
import StatusBar from "./components/StatusBar";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState<TabId>("serial");
  const [showSend, setShowSend] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-editor">
      <div className="flex flex-1 flex-row overflow-hidden">
        <ActivityBar activeTab={activeTab} onTabChange={setActiveTab} />
        <Sidebar activeTab={activeTab} />
        <MainPanel showSend={showSend} />
      </div>
      <StatusBar showSend={showSend} onToggleSend={() => setShowSend(!showSend)} />
    </div>
  );
}

export default App;
