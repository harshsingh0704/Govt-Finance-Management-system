
import GlobalBackButton from "./GlobalBackButton";
import "./PageHeader.css";

export default function PageHeader({
  icon,
  title,
  description,
  showBack = true,
}) {
  return (
    <div className="page-header">
      <div className="page-header-content">
        {showBack && <GlobalBackButton />}

        {icon && (
          <div className="page-header-icon">
            {icon}
          </div>
        )}

        <div className="page-header-text">
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
      </div>
    </div>
  );
}
