import React from "react";
import { Megaphone, MessageSquare, Send } from "lucide-react";

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
  broadcastChannels,
  setBroadcastChannels,
  handleSendBroadcast,
  setActiveTab,
}) => {
  return (
    <div className="glass-panel rounded-2xl p-6 space-y-4 shadow-xl border border-white/10">
      <div className="flex items-center space-x-3 border-b border-white/10 pb-4">
        <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
          <Megaphone className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-black text-white text-base tracking-tight">Quick Broadcast</h3>
          <p className="text-[11px] text-zinc-400">Send instant alerts to battalion cadets</p>
        </div>
      </div>

      <form onSubmit={handleSendBroadcast} className="space-y-3">
        <div>
          <input
            type="text"
            placeholder="Notice Subject (e.g. Uniform & Drill Alert)"
            value={broadcastSubject}
            onChange={(e) => setBroadcastSubject(e.target.value)}
            className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs font-semibold placeholder:text-zinc-500"
            required
          />
        </div>
        <div>
          <textarea
            placeholder="Type official notification message..."
            value={broadcastBody}
            onChange={(e) => setBroadcastBody(e.target.value)}
            className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs font-medium placeholder:text-zinc-500 min-h-[90px] resize-y"
            required
          />
        </div>

        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() =>
              setBroadcastChannels({ ...broadcastChannels, app: !broadcastChannels.app })
            }
            className={`flex-1 py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
              broadcastChannels.app
                ? "bg-blue-600/30 text-blue-300 border-blue-500/50 shadow-sm"
                : "glass-pill text-zinc-400 border-white/10 hover:text-white"
            }`}
          >
            In-App Notice
          </button>
          <button
            type="button"
            onClick={() =>
              setBroadcastChannels({ ...broadcastChannels, email: !broadcastChannels.email })
            }
            className={`flex-1 py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
              broadcastChannels.email
                ? "bg-blue-600/30 text-blue-300 border-blue-500/50 shadow-sm"
                : "glass-pill text-zinc-400 border-white/10 hover:text-white"
            }`}
          >
            Email Alert
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-blue-600/25 hover:scale-[1.02]"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Dispatch Now</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("broadcast")}
          className="w-full text-center text-[11px] font-semibold text-zinc-400 hover:text-blue-400 pt-1 cursor-pointer transition-colors"
        >
          Open Advanced Broadcast Studio & History →
        </button>
      </form>
    </div>
  );
};
