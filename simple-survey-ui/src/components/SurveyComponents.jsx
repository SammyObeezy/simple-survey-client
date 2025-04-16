import React from "react";
import { formatDate, handleDownloadCertificate } from "./SurveyDataHandlers";

// Component for displaying responses in a table
export const TableView = ({ responses, handleViewDetails }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 text-left border-b">Name</th>
            <th className="px-4 py-2 text-left border-b">Email</th>
            <th className="px-4 py-2 text-left border-b">Gender</th>
            <th className="px-4 py-2 text-left border-b">Programming Stack</th>
            <th className="px-4 py-2 text-left border-b">Date Responded</th>
            <th className="px-4 py-2 text-left border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {responses.map((response, rowIndex) => (
            <tr
              key={`row-${response.id || rowIndex}`}
              className="hover:bg-gray-50"
            >
              <td className="px-4 py-3 border-b">{response.fullName}</td>
              <td className="px-4 py-3 border-b">{response.email}</td>
              <td className="px-4 py-3 border-b">{response.gender}</td>
              <td className="px-4 py-3 border-b">
                {response.programmingStack?.split(",").map((item, idx) => (
                  <span
                    key={`stack-${response.id || rowIndex}-${idx}`}
                    className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1 mb-1"
                  >
                    {item.trim()}
                  </span>
                )) || "None"}
              </td>
              <td className="px-4 py-3 border-b">
                {formatDate(response.dateResponded)}
              </td>
              <td className="px-4 py-3 border-b">
                <button
                  onClick={() => handleViewDetails(response)}
                  className="text-blue-600 hover:underline text-sm mr-2"
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Component for displaying responses in a card layout
export const CardView = ({ responses, handleViewDetails }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {responses.map((response, index) => (
        <div
          key={`card-${response.id || index}`}
          className="bg-white border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
        >
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-semibold text-lg mb-1 text-blue-700">
              {response.fullName}
            </h3>
            <p className="text-sm text-gray-600">{response.email}</p>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-xs text-gray-500">Gender</p>
                <p className="font-medium">{response.gender}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="font-medium text-sm">
                  {formatDate(response.dateResponded)}
                </p>
              </div>
            </div>

            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Description</p>
              <p className="text-sm line-clamp-2">
                {response.description || "No description provided"}
              </p>
            </div>

            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Programming Stack</p>
              <div className="flex flex-wrap gap-1">
                {response.programmingStack?.split(",").map((item, idx) => (
                  <span
                    key={`card-stack-${response.id || index}-${idx}`}
                    className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                  >
                    {item.trim()}
                  </span>
                )) || (
                  <span className="text-sm text-gray-500">None specified</span>
                )}
              </div>
            </div>

            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Certificates</p>
              {response.certificates && response.certificates.length > 0 ? (
                <p className="text-sm">
                  {response.certificates.length} certificate(s)
                </p>
              ) : (
                <p className="text-sm text-gray-500">No certificates</p>
              )}
            </div>
          </div>

          <div className="px-4 py-3 bg-gray-50 border-t">
            <button
              onClick={() => handleViewDetails(response)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              View Details
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Component for the detail modal
export const DetailModal = ({ selectedResponse, closeDetails }) => {
  if (!selectedResponse) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-blue-700">
              Response Details
            </h2>
            <button
              onClick={closeDetails}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{selectedResponse.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{selectedResponse.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gender</p>
              <p className="font-medium">{selectedResponse.gender}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date Responded</p>
              <p className="font-medium">
                {formatDate(selectedResponse.dateResponded)}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-500">Description</p>
            <p className="bg-gray-50 p-3 rounded mt-1">
              {selectedResponse.description}
            </p>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-1">Programming Stack</p>
            <div className="flex flex-wrap gap-1">
              {selectedResponse.programmingStack
                ?.split(",")
                .map((item, idx) => (
                  <span
                    key={`modal-stack-${selectedResponse.id}-${idx}`}
                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                  >
                    {item.trim()}
                  </span>
                )) || <span className="text-gray-500">None specified</span>}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Certificates</p>
            {selectedResponse.certificates &&
            selectedResponse.certificates.length > 0 ? (
              <ul className="bg-gray-50 p-3 rounded">
                {selectedResponse.certificates.map((cert, certIndex) => (
                  <li
                    key={`cert-${cert.id || certIndex}`}
                    className="mb-1 flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2 text-red-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <button
                      onClick={() =>
                        handleDownloadCertificate(cert.id, cert.name)
                      }
                      className="text-blue-600 hover:underline"
                    >
                      {cert.name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No certificates uploaded</p>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-4 border-t flex justify-end">
          <button
            onClick={closeDetails}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Pagination component
export const Pagination = ({ currentPage, totalPages, setCurrentPage }) => {
  return (
    <div className="flex justify-between items-center mt-6">
      <div className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded ${
            currentPage === 1
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded ${
            currentPage === totalPages
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

// View mode toggle component
export const ViewModeToggle = ({ viewMode, setViewMode }) => {
  return (
    <div className="flex items-center border rounded overflow-hidden">
      <button
        onClick={() => setViewMode("table")}
        className={`px-4 py-2 flex items-center ${
          viewMode === "table"
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-700"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M3 14h18M3 18h18M3 6h18"
          />
        </svg>
        Table
      </button>
      <button
        onClick={() => setViewMode("card")}
        className={`px-4 py-2 flex items-center ${
          viewMode === "card"
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-700"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
        Cards
      </button>
    </div>
  );
};

// Error display component
export const ErrorDisplay = ({ error, fetchResponses, toggleDebugInfo }) => {
  if (!error) return null;

  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
      <p className="font-medium">Error:</p>
      <p>{error}</p>
      <div className="flex justify-between mt-3">
        <button
          onClick={fetchResponses}
          className="text-blue-600 text-sm hover:underline"
        >
          Try Again
        </button>
        <button
          onClick={toggleDebugInfo}
          className="text-gray-600 text-sm hover:underline"
        >
          Debug Info
        </button>
      </div>
    </div>
  );
};

// Filter form component
export const FilterForm = ({
  emailFilter,
  handleEmailFilterChange,
  handleEmailFilterSubmit,
  handleClearFilter,
}) => {
  return (
    <form
      onSubmit={handleEmailFilterSubmit}
      className="flex items-end gap-2 flex-grow"
    >
      <div className="flex-grow">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Filter by Email
        </label>
        <input
          type="email"
          value={emailFilter}
          onChange={handleEmailFilterChange}
          placeholder="Enter email address"
          className="w-full p-2 border rounded"
          aria-label="Email filter"
        />
      </div>
      <button
        type="button"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={handleEmailFilterSubmit}
      >
        Find
      </button>
      {emailFilter && emailFilter.trim() !== "" && (
        <button
          type="button"
          onClick={handleClearFilter}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Show All
        </button>
      )}
    </form>
  );
};
