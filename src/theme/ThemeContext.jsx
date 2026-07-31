import { createContext, useContext, useEffect, useState } from "react";
import { FONT_SIZES } from "./typography";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {

  const [fontSize, setFontSize] = useState(
    localStorage.getItem("fontSize") || "normal"
  );

  useEffect(() => {
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  const value = {
    fontSize,
    setFontSize,
    fonts: FONT_SIZES[fontSize],
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}