import React from "react";
import { useNavigate } from "react-router-dom";
import { HeroSection } from "../components/HeroSection";
import { AboutNCC } from "../components/AboutNCC";
import { ActivitiesGallery } from "../components/ActivitiesGallery";
import { RanksSyllabusSection } from "../components/RanksSyllabusSection";
import { FaqSection } from "../components/FaqSection";

interface HomeProps {
  openStatusModal: () => void;
}

export const Home: React.FC<HomeProps> = ({ openStatusModal }) => {
  const navigate = useNavigate();

  return (
    <>
      <HeroSection
        onStartEnrollment={() => navigate("/enroll")}
        openStatusModal={openStatusModal}
        onViewNotices={() => navigate("/notices")}
        onOpenOfficerPortal={() => navigate("/admin")}
      />
      <AboutNCC />
      <ActivitiesGallery />
      <RanksSyllabusSection />
      <FaqSection
        onStartEnrollment={() => navigate("/enroll")}
        openStatusModal={openStatusModal}
      />
    </>
  );
};
