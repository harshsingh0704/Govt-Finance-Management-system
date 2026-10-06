import React from "react";
import { useNavigate } from "react-router-dom";
import TAAdvanceModal from "./TAAdvanceModal";

export default function TAAdvancePage() {
  const navigate = useNavigate();

  return (
    <TAAdvanceModal
      isOpen={true}
      onClose={() => navigate("/admin")}
    />
  );
}
