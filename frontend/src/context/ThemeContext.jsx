import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("system");
  const [actualTheme, setActualTheme] = useState("light");

  // Initialize theme from localStorage after component mounts
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const applyTheme = () => {
      let newTheme = theme;

      if (theme === "system") {
        newTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }

      console.log("Applying theme:", theme, "-> actual:", newTheme);
      setActualTheme(newTheme);

      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
        console.log("Added dark class");
      } else {
        document.documentElement.classList.remove("dark");
        console.log("Removed dark class");
      }
    };

    applyTheme();

    // Listen for system theme changes when using system preference
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", applyTheme);

      return () => mediaQuery.removeEventListener("change", applyTheme);
    }
  }, [theme]);

  const setThemePreference = (newTheme) => {
    console.log("Setting theme to:", newTheme);
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const toggleTheme = () => {
    const newTheme = actualTheme === "light" ? "dark" : "light";
    setThemePreference(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        actualTheme,
        setTheme: setThemePreference,
        toggleTheme,
        isDark: actualTheme === "dark",
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
