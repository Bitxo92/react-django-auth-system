import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="w-full bg-white shadow-sm px-6 py-4 flex items-center justify-between">
      <img
        src="./cv_builder_logo.png"
        alt="Logo"
        className="size-10 object-contain ml-5"
      />
    </header>
  );
};

export default Header;
