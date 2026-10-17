
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft } from "lucide-react";
import { getDashboardDestination } from "../dashboardRouting";
import "./GlobalBackButton.css";

export default function GlobalBackButton() {
  const navigate = useNavigate();
  const { user, role } = useSelector((state) => state.auth);

  const handleBack = () => {
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate(getDashboardDestination(user, role), {
        replace: true,
      });
    }
  };

  return (
    <button
      type="button"
      className="global-back-button"
      onClick={handleBack}
      aria-label="Go back"
      title="Go back"
    >

<ArrowLeft size={20} strokeWidth={2.8} />


    </button>
  );
}