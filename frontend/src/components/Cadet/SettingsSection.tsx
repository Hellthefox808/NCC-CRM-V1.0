import React from "react";
import { Lock, Bell } from "lucide-react";

interface SettingsSectionProps {
  showToast: (msg: string) => void;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({ showToast }) => {
  return (
    <div className="space-y-6">
      
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Cadet Account Settings</h2>
          <p className="text-xs text-slate-500">Manage security, notification alerts, and portal preferences</p>
        </div>

        <div className="max-w-xl space-y-6">
          
          {/* Change Password */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
              <Lock className="w-4 h-4 text-yellow-600" />
              <span>Change Portal Password</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div>
                <label className="font-bold text-slate-700">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full mt-1 p-2 bg-white border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">New Password</label>
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  className="w-full mt-1 p-2 bg-white border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <button
                onClick={() => showToast("Password updated successfully.")}
                className="py-2 px-4 bg-[#002147] text-white rounded-xl font-bold text-xs cursor-pointer hover:bg-[#001838]"
              >
                Update Password
              </button>
            </div>
          </div>

          {/* Notification Toggles */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <span>Alert Preferences</span>
            </h3>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200 cursor-pointer">
                <span className="font-bold text-slate-800">Parade SMS Reminders</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#002147]" />
              </label>

              <label className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200 cursor-pointer">
                <span className="font-bold text-slate-800">Officer Broadcast Emails</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#002147]" />
              </label>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
