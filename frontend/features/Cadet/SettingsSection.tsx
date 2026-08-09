import React from "react";
import { Lock, Bell } from "lucide-react";

interface SettingsSectionProps {
  showToast: (msg: string) => void;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({ showToast }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-2xl font-black text-zinc-900">Cadet Account Settings</h2>
          <p className="text-xs text-zinc-500">
            Manage security, notification alerts, and portal preferences
          </p>
        </div>

        <div className="max-w-xl space-y-6">
          {/* Change Password */}
          <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200 space-y-3">
            <h3 className="font-extrabold text-zinc-900 text-sm flex items-center space-x-2">
              <Lock className="w-4 h-4 text-blue-700" />
              <span>Change Portal Password</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div>
                <label className="font-bold text-zinc-700">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full mt-1 p-2 bg-white border border-zinc-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="font-bold text-zinc-700">New Password</label>
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  className="w-full mt-1 p-2 bg-white border border-zinc-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => showToast("Password updated successfully.")}
                className="py-2 px-4 bg-[#18181B] text-white rounded-xl font-bold text-xs cursor-pointer hover:bg-[#09090B]"
              >
                Update Password
              </button>
            </div>
          </div>

          {/* Notification Toggles */}
          <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200 space-y-3">
            <h3 className="font-extrabold text-zinc-900 text-sm flex items-center space-x-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <span>Alert Preferences</span>
            </h3>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2 bg-white rounded-xl border border-zinc-200 cursor-pointer">
                <span className="font-bold text-zinc-800">Parade SMS Reminders</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#18181B]" />
              </label>

              <label className="flex items-center justify-between p-2 bg-white rounded-xl border border-zinc-200 cursor-pointer">
                <span className="font-bold text-zinc-800">Officer Broadcast Emails</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#18181B]" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
