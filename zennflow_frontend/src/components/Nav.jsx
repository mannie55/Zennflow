import { Link, useLocation } from "react-router-dom";
import Weather from "./Weather";

const Header = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="border border-black text-left">
      <div className="border border-black inline-block w-1/2 ">
        <nav className="">
          {currentPath !== "/pomodorro" && (
            <Link to="/pomodorro">
              <button>focus</button>
            </Link>
          )}
        </nav>
      </div>

      <Weather />
    </div>
  );
};

export default Header;
