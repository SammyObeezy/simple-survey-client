import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6 sm:mt-10">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-blue-700 mb-2">
          Sky World Survey
        </h1>
        <p className="text-gray-600 text-base sm:text-lg">
          Welcome to our comprehensive survey application
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="bg-blue-600 p-3 sm:p-4">
            <h2 className="text-lg sm:text-xl font-semibold text-white">
              Take the Survey
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            <p className="text-gray-600 text-sm sm:text-base mb-4">
              Fill out our step-by-step survey to share your information,
              skills, and certifications.
            </p>
            <ul className="text-gray-700 mb-6 space-y-2 text-sm sm:text-base">
              <li className="flex items-start sm:items-center">
                <svg
                  className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5 sm:mt-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span>Easy step-by-step process</span>
              </li>
              <li className="flex items-start sm:items-center">
                <svg
                  className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5 sm:mt-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span>Upload certificates</span>
              </li>
              <li className="flex items-start sm:items-center">
                <svg
                  className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5 sm:mt-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span>Progress tracking</span>
              </li>
            </ul>
            <Link
              to="/survey"
              className="block w-full text-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-300 text-sm sm:text-base"
            >
              Start Survey
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="bg-green-600 p-3 sm:p-4">
            <h2 className="text-lg sm:text-xl font-semibold text-white">
              View Responses
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            <p className="text-gray-600 text-sm sm:text-base mb-4">
              Browse through all submitted survey responses with our intuitive
              interface.
            </p>
            <ul className="text-gray-700 mb-6 space-y-2 text-sm sm:text-base">
              <li className="flex items-start sm:items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5 sm:mt-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span>Search by email</span>
              </li>
              <li className="flex items-start sm:items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5 sm:mt-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span>View detailed responses</span>
              </li>
              <li className="flex items-start sm:items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5 sm:mt-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span>Download certificates</span>
              </li>
            </ul>
            <Link
              to="/responses"
              className="block w-full text-center py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded transition-colors duration-300 text-sm sm:text-base"
            >
              View Responses
            </Link>
          </div>
        </div>
      </div>

      <footer className="mt-10 sm:mt-16 pb-8 text-center text-gray-500 text-xs sm:text-sm">
        <p>
          © {new Date().getFullYear()} Sky World Survey Application. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
};

export default Home;
