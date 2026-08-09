import { createFileRoute } from "@tanstack/react-router";
import { EnrollmentForm } from "@frontend/features/pages/Enrollment";
import { useAppShell } from "@backend/lib/app-shell";
import { useNavigate } from "@backend/lib/navigation";

export const Route = createFileRoute("/enroll")({
  head: () => ({
    meta: [
      { title: "Cadet Enrollment — SBU NCC Portal" },
      {
        name: "description",
        content:
          "Complete the official SBU NCC Form 1 enrollment application: academic, physical, bank and guardian details.",
      },
      { property: "og:title", content: "Cadet Enrollment — SBU NCC Portal" },
      {
        property: "og:description",
        content: "Complete the official SBU NCC Form 1 cadet enrollment application online.",
      },
    ],
  }),
  component: EnrollRoute,
});

function EnrollRoute() {
  const shell = useAppShell();
  const navigate = useNavigate();

  return (
    <EnrollmentForm
      onSuccess={shell.setPrintableRecord}
      onSuccessSubmitted={shell.setPrintableRecord}
      onOpenPrintableSlip={shell.setPrintableRecord}
      openStatusModalWithQuery={(query: string) => shell.openStatusModal(query)}
      onCancel={() => navigate("/")}
    />
  );
}
