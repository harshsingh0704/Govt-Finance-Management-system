import React from "react";
import { useNavigate } from "react-router-dom";
import LTCAdvanceModal from "./LTCAdvanceModal";

export default function LTCAdvancePage() {
  const navigate = useNavigate();

  return (
    <LTCAdvanceModal
      isOpen={true}
      onClose={() => navigate("/admin")}
    />
  );
}
