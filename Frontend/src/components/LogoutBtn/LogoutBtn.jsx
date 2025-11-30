import React from "react";
import { useUserContext } from "../../contexts/UserContext/UserContext";

function LogoutBtn() {
  const { updateUser } = useUserContext();
  const handleLogout = () => {
    updateUser(null);
  };
  return <button onClick={handleLogout}>Logout</button>;
}

export default LogoutBtn;
