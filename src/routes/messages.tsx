import { createFileRoute } from "@tanstack/react-router";
import { CommunicationHub } from "@frontend/features/Messaging/CommunicationHub";
import { useAppShell } from "@backend/lib/app-shell";
import { useNavigate } from "@backend/lib/navigation";
import { ArrowLeft, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Communication Hub — 19 Jharkhand Battalion NCC" },
      {
        name: "description",
        content:
          "Official NCC communication platform: Direct messaging, platoon groups, and ANO administrative directives.",
      },
    ],
  }),
  component: MessagesRoute,
});

function MessagesRoute() {
  const shell = useAppShell();
  const navigate = useNavigate();

  const user = shell.currentUser as { id?: string; name?: string; fullName?: string } | null;
  const isAdmin = shell.currentUserType === "admin";

  const currentUser = {
    id: user?.id ? String(user.id) : isAdmin ? "officer_ano" : "cadet_default",
    name:
      user?.name || user?.fullName
        ? String(user?.name || user?.fullName)
        : isAdmin
          ? "Capt. Dr. Animesh Roy (ANO)"
          : "NCC Cadet",
    role: isAdmin ? "ADMIN" : "CADET",
  };

  return (
    <div className="min-h-screen bg-[#070c1b] text-white p-3 sm:p-6 flex flex-col space-y-4">
      {/* Top Breadcrumb Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(isAdmin ? "/admin" : "/cadet")}
          className="flex items-center space-x-2 text-xs font-bold text-zinc-400 hover:text-white glass-pill px-3 py-1.5 rounded-xl transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {isAdmin ? "Command Portal" : "Cadet Portal"}</span>
        </button>

        <div className="flex items-center space-x-2 text-xs font-extrabold text-blue-400">
          <MessageSquare className="w-4 h-4" />
          <span>19 JHR BN Secure Communication Hub</span>
        </div>
      </div>

      {/* Main Hub */}
      <div className="flex-1">
        <CommunicationHub currentUser={currentUser} />
      </div>
    </div>
  );
}
