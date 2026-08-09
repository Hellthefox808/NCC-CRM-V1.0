import { createFileRoute } from "@tanstack/react-router";
import { NotificationsFeed } from "@frontend/features/NotificationsFeed";

export const Route = createFileRoute("/notices")({
  head: () => ({
    meta: [
      { title: "Notices & Alerts — SBU NCC Portal" },
      {
        name: "description",
        content:
          "Official SBU NCC notices: drill schedules, camp selections, certificate exams and unit announcements.",
      },
      { property: "og:title", content: "Notices & Alerts — SBU NCC Portal" },
      {
        property: "og:description",
        content:
          "Official SBU NCC notices, drill schedules, camp selections and unit announcements.",
      },
    ],
  }),
  component: NoticesRoute,
});

function NoticesRoute() {
  return <NotificationsFeed />;
}
