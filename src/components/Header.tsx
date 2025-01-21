import ThemeSwitcher from "./ThemeSwitcher";

const Header = () => {
  return (
    <header className="flex justify-between items-center py-1 pb-1 mb-4 border-b border-border">
      <div className="flex items-center gap-2">
        <h1 className="text-base font-bold">resumetweaker</h1>
      </div>
      <ThemeSwitcher />
    </header>
  );
};

export default Header;
