import React from "react";
import { Megaphone, MessageSquare } from "lucide-react";

interface NotificationBroadcasterProps {
  broadcastSubject: string;
  setBroadcastSubject: (val: string) => void;
  broadcastBody: string;
  setBroadcastBody: (val: string) => void;
  broadcastTarget: string;
  setBroadcastTarget: (val: string) => void;
  broadcastChannels: { email: boolean; app: boolean; sms: boolean };
  setBroadcastChannels: (val: { email: boolean; app: boolean; sms: boolean }) => void;
  handleSendBroadcast: (e: React.FormEvent) => void;
  setActiveTab: (tab: string) => void;
}

export const NotificationBroadcaster: React.FC<NotificationBroadcasterProps> = ({
  broadcastSubject,
  setBroadcastSubject,
  broadcastBody,
  setBroadcastBody,
  broadcastTarget,
  setBroadcastTarget,
  broadcastChannels,
  setBroadcastChannels,
  handleSendBroadcast,
  setActiveTab
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
      <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
          <Megaphone className="w-4 h-4 text-yellow-600" />
        </div>
        <div>
          <h3 className="font-black text-slate-900">Quick Broadcast</h3>
          <p className="text-[10px] text-slate-500">Send instant alerts to cadets</p>
        </div>
      </div>

      <form onSubmit={handleSendBroadcast} className="space-y-3">
        <div>
          <input
            type="text"
            placeholder="Notice Subject (e.g. Uniform Alert)"
            value={broadcastSubject}
            onChange={(e) => setBroadcastSubject(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
            required
          />
        </div>
        <div>
          <textarea
            placeholder="Type your message here..."
            value={broadcastBody}
            onChange={(e) => setBroadcastBody(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 min-h-[80px]"
            required
          />
        </div>
        
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setBroadcastChannels({...broadcastChannels, app: !broadcastChannels.app})}
            className={`flex-1 py-1.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
              broadcastChannels.app ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
            }`}
          >
            In-App
          </button>
          <button
            type="button"
            onClick={() => setBroadcastChannels({...broadcastChannels, email: !broadcastChannels.email})}
            className={`flex-1 py-1.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
              broadcastChannels.email ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
            }`}
          >
            Email
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-[#002147] hover:bg-[#001533] text-white font-black py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-md"
        >
          <MessageSquare className="w-4 h-4 text-yellow-400" />
          <span>Dispatch Now</span>
        </button>
        
        <button
          type="button"
          onClick={() => setActiveTab("broadcast")}
          className="w-full text-center text-[10px] font-bold text-slate-500 hover:text-blue-600 mt-2 cursor-pointer"
        >
          Open Advanced Broadcast Studio & History →
        </button>
      </form>
    </div>
  );
};
