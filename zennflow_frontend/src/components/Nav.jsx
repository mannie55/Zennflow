import Weather from "./Weather";

const Nav = ({ setPage, currentPage }) => {
  return (
    <div className="flex items-center justify-between p-4 w-full">
      <div>
        <header>
          {currentPage === "dashboard" && (
            <button className="font-bold hover:opacity-80" onClick={() => setPage("focus")}>
              Focus Mode
            </button>
          )}
          {currentPage === "focus" && (
            <button className="font-bold hover:opacity-80" onClick={() => setPage("dashboard")}>
              Back Home
            </button>
          )}
        </header>
      </div>

      <Weather />
    </div>
  );
};

export default Nav;
