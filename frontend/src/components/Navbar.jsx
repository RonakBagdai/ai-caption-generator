import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import TokenIndicator from "./TokenIndicator";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const linkBase = "text-sm font-medium px-3 py-2 rounded-md transition";
  const activeMobile =
    "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 block";
  const inactiveMobile =
    "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 block";
  const active = "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900";
  const inactive =
    "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800";

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-gray-900/80 bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-700">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            to="/"
            className="text-lg sm:text-xl font-semibold tracking-tight bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent flex-shrink-0"
            onClick={closeMobileMenu}
          >
            AI Caption
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {user && <TokenIndicator />}
            <ThemeToggle />
            {user ? (
              <>
                <Link
                  to="/feed"
                  className={`${linkBase} ${
                    pathname === "/feed" ? active : inactive
                  }`}
                >
                  My Posts
                </Link>
                <Link
                  to="/create"
                  className={`${linkBase} ${
                    pathname === "/create" ? active : inactive
                  }`}
                >
                  Create New
                </Link>
                <Link
                  to="/batch"
                  className={`${linkBase} ${
                    pathname === "/batch" ? active : inactive
                  }`}
                >
                  Batch Upload
                </Link>
                <Link
                  to="/profile"
                  className={`${linkBase} ${
                    pathname === "/profile" ? active : inactive
                  }`}
                >
                  Profile
                </Link>
                <span className="hidden xl:inline text-xs text-gray-500 dark:text-gray-400 ml-2 mr-1">
                  {user.username}
                </span>
                <button
                  onClick={logout}
                  className="text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-3 py-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`${linkBase} ${
                    pathname === "/login" ? active : inactive
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`${linkBase} ${
                    pathname === "/register" ? active : inactive
                  }`}
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Toggle mobile menu"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`lg:hidden transition-all duration-200 ease-in-out ${
            isMobileMenuOpen
              ? "max-h-96 opacity-100 pb-4"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="space-y-1 pt-2">
            {user ? (
              <>
                <div className="px-3 py-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Welcome, {user.username}
                  </span>
                </div>
                <Link
                  to="/feed"
                  className={`${linkBase} ${
                    pathname === "/feed" ? activeMobile : inactiveMobile
                  }`}
                  onClick={closeMobileMenu}
                >
                  📝 My Posts
                </Link>
                <Link
                  to="/create"
                  className={`${linkBase} ${
                    pathname === "/create" ? activeMobile : inactiveMobile
                  }`}
                  onClick={closeMobileMenu}
                >
                  ✨ Create New
                </Link>
                <Link
                  to="/batch"
                  className={`${linkBase} ${
                    pathname === "/batch" ? activeMobile : inactiveMobile
                  }`}
                  onClick={closeMobileMenu}
                >
                  📤 Batch Upload
                </Link>
                <Link
                  to="/profile"
                  className={`${linkBase} ${
                    pathname === "/profile" ? activeMobile : inactiveMobile
                  }`}
                  onClick={closeMobileMenu}
                >
                  👤 Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    closeMobileMenu();
                  }}
                  className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-3 py-2 block w-full text-left"
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`${linkBase} ${
                    pathname === "/login" ? activeMobile : inactiveMobile
                  }`}
                  onClick={closeMobileMenu}
                >
                  🔑 Login
                </Link>
                <Link
                  to="/register"
                  className={`${linkBase} ${
                    pathname === "/register" ? activeMobile : inactiveMobile
                  }`}
                  onClick={closeMobileMenu}
                >
                  📝 Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
