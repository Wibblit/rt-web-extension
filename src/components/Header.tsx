import ThemeSwitcher from "./ThemeSwitcher";

const Header = () => {
  return (
    <header className="flex justify-between items-center py-1 pb-1 mb-4 border-b border-border">
      <div className="flex items-center gap-2">
        <span className="block text-base text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors duration-200 mb-2">
          <span className="text-zinc-500 dark:text-zinc-400">resume</span>
          <span className="font-bold">tweaker</span>
        </span>
      </div>
      <ThemeSwitcher />
    </header>
  );
};

export default Header;
