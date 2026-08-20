import { useContext } from "react";

import ThemeContext from "./themeContextValue";

export default function useTheme() {
  return useContext(ThemeContext);
}
