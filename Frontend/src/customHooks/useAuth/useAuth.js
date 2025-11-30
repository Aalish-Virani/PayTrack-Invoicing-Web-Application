import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../contexts/UserContext/UserContext.jsx";

const useAuth = () => {
  const { userId, updateUser } = useUserContext();

  const userLoggedIn = () => {
    return userId;
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (userId === null && !window.location.pathname.includes("/user")) {
      navigate("/user/profile");
    }
  }, [userId, navigate]);

  const login = (id) => {
    updateUser(id);
    console.log(id, userId, userLoggedIn());
    navigate("/");
  };

  const logout = () => {
    updateUser(null);
  };

  return { userId, userLoggedIn, login, logout };
};

export default useAuth;
