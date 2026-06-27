import { useState } from "react";
import ActivityBar, { type TabId } from "./components/ActivityBar";
import Sidebar from "./components/Sidebar";
import MainPanel from "./components/MainPanel";
import StatusBar from "./components/StatusBar";
import type { SerialConfig } from "./types";
import { DEFAULT_CONFIG } from "./types";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState<TabId>("serial");
  const [showSend, setShowSend] = useState(false);
  const [config, setConfig] = useState<SerialConfig>(DEFAULT_CONFIG);
  const [connected, setConnected] = useState(false);
  const [txCount, setTxCount] = useState(0);
  const [rxCount, setRxCount] = useState(0);

  return (
    <div className="flex h-screen flex-col bg-editor">
      <div className="flex flex-1 flex-row overflow-hidden">
        <ActivityBar activeTab={activeTab} onTabChange={setActiveTab} />
        <Sidebar
          key={activeTab}
          activeTab={activeTab}
          config={config}
          onConfigChange={setConfig}
          connected={connected}
          onConnectChange={setConnected}
        />
        <MainPanel
          showSend={showSend}
          onTxBytes={(n) => setTxCount((c) => c + n)}
          onRxBytes={(n) => setRxCount((c) => c + n)}
        />
      </div>
      <StatusBar
        showSend={showSend}
        onToggleSend={() => setShowSend(!showSend)}
        connected={connected}
        portName={config.port_name}
        baudRate={config.baud_rate}
        txCount={txCount}
        rxCount={rxCount}
      />
    </div>
  );
}

export default App;
