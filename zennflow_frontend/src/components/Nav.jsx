import Weather from "./Weather";

const Header = ({ setPage, currentPage }) => {
  return (
    <div className="border border-black text-left">
      <div className="border border-black inline-block w-1/2 ">
        <header>
          {currentPage === "dashboard" && (
            <button onClick={() => setPage("focus")}>Focus Mode</button>
          )}
          {currentPage === "focus" && (
            <button onClick={() => setPage("dashboard")}>Back Home</button>
          )}
        </header>
      </div>

      <Weather />
    </div>
  );
};

export default Header;
