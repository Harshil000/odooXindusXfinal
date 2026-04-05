import { useContext } from "react";
import { toast } from "react-toastify";
import { AuthContext } from "../../auth/auth.context";
import "./Profile.scss";

const Profile = () => {
  const { user } = useContext(AuthContext);

  const copyText = async (label, value) => {
    if (!value) {
      toast.error(`${label} not available`);
      return;
    }

    try {
      await navigator.clipboard.writeText(String(value));
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Could not copy ${label.toLowerCase()}`);
    }
  };

  return (
    <section className="profile-page">
      <header className="profile-header">
        <h1>Profile</h1>
        <p>Manage your account details and quick-copy restaurant identifiers.</p>
      </header>

      <article className="profile-card">
        <div className="profile-avatar">{user?.name?.[0]?.toUpperCase() || "U"}</div>
        <div className="profile-main">
          <h2>{user?.name || "User"}</h2>
          <p>{user?.email || "-"}</p>
          <span className="profile-role">{user?.role || "staff"}</span>
        </div>
      </article>

      <article className="profile-card profile-meta">
        <h3>Restaurant Info</h3>
        <button type="button" onClick={() => copyText("Restaurant Name", user?.restaurant_name)}>
          <span>Restaurant Name</span>
          <strong>{user?.restaurant_name || "-"}</strong>
          <small>Click to copy</small>
        </button>
        <button type="button" onClick={() => copyText("Restaurant ID", user?.restaurant_id)}>
          <span>Restaurant ID</span>
          <strong>{user?.restaurant_id || "-"}</strong>
          <small>Click to copy</small>
        </button>
      </article>
    </section>
  );
};

export default Profile;
