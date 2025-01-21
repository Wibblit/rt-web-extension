import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";

function ThemeSwitcher() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme as "light" | "dark");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className="flex items-center space-x-2">
      <Sun className="h-4 w-4" />
      <Switch
        checked={theme === "dark"}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label="Toggle theme"
      />
      <Moon className="h-4 w-4" />
    </div>
  );
}

export default ThemeSwitcher;
