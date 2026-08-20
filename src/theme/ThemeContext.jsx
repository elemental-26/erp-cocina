import { useEffect, useState } from "react";
import { FONT_SIZES } from "./typography";
import ThemeContext from "./themeContextValue";

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
