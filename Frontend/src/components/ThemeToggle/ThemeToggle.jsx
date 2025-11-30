import React, { useEffect, useState } from "react";
import moon from "../../assets/icon-moon.svg";
import sun from "../../assets/icon-sun.svg";

const ThemeToggle = () => {
  const storedTheme = localStorage.getItem("theme");

  const [darkTheme, setDarkTheme] = useState(
    storedTheme == "dark" ? true : false
  );

  const handleThemeToggle = () => {
    setDarkTheme(!darkTheme);
  };

  useEffect(() => {
    if (darkTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkTheme]);

  return (
    <button onClick={handleThemeToggle}>
      <img src={darkTheme ? sun : moon} />
    </button>
  );
};

export default ThemeToggle;
