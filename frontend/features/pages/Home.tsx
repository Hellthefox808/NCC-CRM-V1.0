import React from "react";
import { useNavigate } from "@backend/lib/navigation";
import { HeroSection } from "@frontend/features/HeroSection";
import { AboutNCC } from "@frontend/features/AboutNCC";
import { ActivitiesGallery } from "@frontend/features/ActivitiesGallery";
import { RanksSyllabusSection } from "@frontend/features/RanksSyllabusSection";
import { FaqSection } from "@frontend/features/FaqSection";

interface HomeProps {
  openStatusModal: () => void;
  openAiAssistant?: () => void;
}

export const Home: React.FC<HomeProps> = ({ openStatusModal, openAiAssistant }) => {
  const navigate = useNavigate();

  return (
    <>
      <HeroSection
        onStartEnrollment={() => navigate("/enroll")}
        openStatusModal={() => openStatusModal()}
        openStatusModalWithQuery={(q) => openStatusModal(q)}
        onViewNotices={() => navigate("/notices")}
        onOpenOfficerPortal={() => navigate("/admin")}
        openAiAssistant={openAiAssistant}
      />
      <AboutNCC />
      <ActivitiesGallery />
      <RanksSyllabusSection />
      <FaqSection
        onStartEnrollment={() => navigate("/enroll")}
        openStatusModal={openStatusModal}
        openAiAssistant={openAiAssistant}
      />
    </>
  );
};
