import React, { createContext, useContext, useState } from "react";

const UserContext = createContext();

export const useUserContext = () => {
  return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(
    sessionStorage.getItem("userId") > 0
      ? sessionStorage.getItem("userId")
      : null
  );

  const updateUser = (id) => {
    setUserId(id);
    sessionStorage.setItem("userId", id);
  };

  const getUserId = () => {
    return userId;
  };
  return (
    <UserContext.Provider value={{ userId, updateUser, getUserId }}>
      {children}
    </UserContext.Provider>
  );
};
