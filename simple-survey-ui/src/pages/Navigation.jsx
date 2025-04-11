import React from "react";
import { Link } from "react-router-dom";

const Navigation = () => {
  return (
    <nav className="bg-blue-500 p-4 text-white">
      <div className="max-w-screen-lg mx-auto flex justify-between">
        <Link to="/" className="text-xl font-semibold">
          Survey Form
        </Link>
        <Link to="/responses" className="text-xl font-semibold">
          Survey Responses
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;
