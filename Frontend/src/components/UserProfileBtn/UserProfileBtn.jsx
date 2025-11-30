import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../customHooks/useAuth/useAuth.js";

// Default avatar when not logged in
const DefaultAvatar = () => (
  <div className="h-8 w-8 rounded-full  flex items-center justify-center">
    <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
  </div>
);

// Real user initial avatar
const UserAvatar = ({ initial }) => (
  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#7c5dfa] to-[#9277ff] flex items-center justify-center text-white font-bold text-sm shadow-lg">
    {initial.toUpperCase()}
  </div>
);

const UserProfileBtn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userLoggedIn, userId } = useAuth();

  const [firstNameInitial, setFirstNameInitial] = useState(null);

  useEffect(() => {
    const fetchUserName = async () => {
      const currentUserId = userLoggedIn();

      if (!currentUserId) {
        setFirstNameInitial(null);
        return;
      }

      try {
        const res = await fetch(`http://localhost:5173/user/profile/${currentUserId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.firstName) {
            setFirstNameInitial(data.firstName.charAt(0));
          } else {
            setFirstNameInitial("U");
          }
        }
      } catch (err) {
        setFirstNameInitial("U"); // fallback
      }
    };

    fetchUserName();
  }, [userLoggedIn]);

  const handleProfileClick = () => {
    const isLoggedIn = !!userLoggedIn();

    if (isLoggedIn) {
      // Toggle between home/invoices and profile
      if (location.pathname === "/" || location.pathname === "/invoices") {
        navigate("/user/profile");
      } else {
        navigate("/");
      }
    } else {
      // Not logged in → go to profile (shows login/signup)
      navigate("/user/profile");
    }
  };

  const isLoggedIn = !!userLoggedIn();

  return (
    <button
      onClick={handleProfileClick}
      className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
      title={isLoggedIn ? "View Profile" : "Login / Sign Up"}
    >
      {isLoggedIn && firstNameInitial ? (
        <UserAvatar initial={firstNameInitial} />
      ) : (
        <DefaultAvatar />
      )}
    </button>
  );
};

export default UserProfileBtn;