import { createFileRoute } from "@tanstack/react-router";
import { Home } from "@frontend/features/pages/Home";
import { useAppShell } from "@backend/lib/app-shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SBU NCC Portal — Join the National Cadet Corps" },
      {
        name: "description",
        content:
          "Enroll as an SBU NCC cadet, track your application status, explore camps, ranks and the training syllabus.",
      },
      { property: "og:title", content: "SBU NCC Portal — Join the National Cadet Corps" },
      {
        property: "og:description",
        content:
          "Enroll as an SBU NCC cadet, track applications and explore camps, ranks and syllabus.",
      },
    ],
  }),
  component: HomeRoute,
});

function HomeRoute() {
  const shell = useAppShell();
  return (
    <Home openStatusModal={() => shell.openStatusModal()} openAiAssistant={shell.openAiAssistant} />
  );
}
