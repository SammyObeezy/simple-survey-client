import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  API_BASE_URL,
  handleJsonResponse,
  handleXmlResponse,
  processResponseItems,
  provideFallbackResponses,
  getElementTextContent,
  testEmailFilter,
} from "../components/SurveyDataHandlers";
import {
  TableView,
  CardView,
  DetailModal,
  Pagination,
  ViewModeToggle,
  ErrorDisplay,
  FilterForm,
} from "../components/SurveyComponents";

const SurveyResponses = () => {
  // State management
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [emailFilter, setEmailFilter] = useState("");
  const [pageSize] = useState(10);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // Add viewMode state: "table" or "card"

  // Debug responses updates
  useEffect(() => {
    console.log("Responses updated:", responses);
  }, [responses]);

  // Fetch responses when page changes or when explicitly called by filters
  useEffect(() => {
    fetchResponses();
  }, [currentPage]); // Remove emailFilter dependency to prevent auto-fetching

  // Main fetch function with proper URLSearchParams
  const fetchResponses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use URLSearchParams for proper query parameter handling
      const searchParams = new URLSearchParams();
      searchParams.append("page", currentPage.toString());
      searchParams.append("page_size", pageSize.toString());

      // Only add email_address if we have a non-empty filter
      if (emailFilter && emailFilter.trim() !== "") {
        searchParams.append("email_address", emailFilter.trim());
        console.log("Filtering by email:", emailFilter.trim());
      } else {
        console.log("No email filter applied");
      }

      const url = `${API_BASE_URL}/api/questions/responses?${searchParams.toString()}`;
      console.log("Fetching responses from:", url);

      // Make request with specific options to handle XML correctly
      const response = await axios.get(url, {
        headers: {
          Accept: "application/xml, text/xml, */*",
        },
        transformResponse: [(data) => data], // Prevent axios from automatically parsing JSON
      });

      console.log("Raw response status:", response.status);
      console.log("Raw response data type:", typeof response.data);
      console.log(
        "Raw response data sample:",
        response.data.substring
          ? response.data.substring(0, 200)
          : response.data
      );

      // Store debug info for display in case of errors
      setDebugInfo({
        url,
        dataType: typeof response.data,
        data: response.data,
      });

      // Process based on response type
      if (
        typeof response.data === "string" &&
        (response.data.includes("<?xml") ||
          response.data.includes("<question_responses"))
      ) {
        console.log("Response is XML string, parsing...");
        handleXmlResponse(
          response.data,
          setResponses,
          setCurrentPage,
          setTotalPages,
          setError,
          () =>
            provideFallbackResponses(
              setResponses,
              setCurrentPage,
              setTotalPages
            ),
          getElementTextContent
        );
      } else if (typeof response.data === "object") {
        console.log("Response is object, handling as JSON");
        handleJsonResponse(
          response.data,
          setResponses,
          setCurrentPage,
          setTotalPages,
          setError,
          (items) => processResponseItems(items, setResponses, setError),
          () =>
            provideFallbackResponses(
              setResponses,
              setCurrentPage,
              setTotalPages
            )
        );
      } else if (typeof response.data === "string") {
        // Try to parse as JSON
        try {
          console.log("Attempting to parse string response as JSON");
          const jsonData = JSON.parse(response.data);
          handleJsonResponse(
            jsonData,
            setResponses,
            setCurrentPage,
            setTotalPages,
            setError,
            (items) => processResponseItems(items, setResponses, setError),
            () =>
              provideFallbackResponses(
                setResponses,
                setCurrentPage,
                setTotalPages
              )
          );
        } catch (parseErr) {
          console.log("String is not valid JSON, trying to parse as XML");
          handleXmlResponse(
            response.data,
            setResponses,
            setCurrentPage,
            setTotalPages,
            setError,
            () =>
              provideFallbackResponses(
                setResponses,
                setCurrentPage,
                setTotalPages
              ),
            getElementTextContent
          );
        }
      } else {
        console.error("Unknown response format:", typeof response.data);
        setError(`Unknown response format: ${typeof response.data}`);
        provideFallbackResponses(setResponses, setCurrentPage, setTotalPages);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching responses:", err);
      setError(`Failed to fetch responses: ${err.message || "Unknown error"}`);
      setDebugInfo({
        error: err.message,
        stack: err.stack,
        response: err.response?.data,
      });
      setLoading(false);
      provideFallbackResponses(setResponses, setCurrentPage, setTotalPages);
    }
  };

  // Email filter handlers
  const handleEmailFilterChange = (e) => {
    setEmailFilter(e.target.value);
  };

  const handleEmailFilterSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    console.log("Filter button clicked with value:", emailFilter);

    // Reset to first page
    setCurrentPage(1);

    // Skip filter if empty
    if (!emailFilter || emailFilter.trim() === "") {
      console.log("Filter is empty, showing all results");
      fetchResponses();
      return;
    }

    // Client-side filtering for exact email match
    try {
      setLoading(true);

      // First get all responses
      const response = await axios.get(
        `${API_BASE_URL}/api/questions/responses?page=1&page_size=100`,
        {
          headers: {
            Accept: "application/xml, text/xml, */*",
          },
          transformResponse: [(data) => data],
        }
      );

      // Process the response
      if (typeof response.data === "string") {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(response.data, "text/xml");
        const responseNodes = xmlDoc.getElementsByTagName("question_response");

        console.log(
          `Found ${
            responseNodes.length
          } total responses, filtering for exact match on ${emailFilter.trim()}`
        );

        // Filter for exact email match
        const matchingResponses = [];
        for (let i = 0; i < responseNodes.length; i++) {
          const responseNode = responseNodes[i];
          const emailNode =
            responseNode.getElementsByTagName("email_address")[0];
          const email = emailNode ? emailNode.textContent : "";

          // Check for exact match (case-insensitive)
          if (email.toLowerCase() === emailFilter.trim().toLowerCase()) {
            console.log(`Found exact match for email: ${email}`);

            // Process certificates
            const certificates = [];
            const certificatesNode =
              responseNode.getElementsByTagName("certificates")[0];
            if (certificatesNode) {
              const certificateNodes =
                certificatesNode.getElementsByTagName("certificate");
              for (let j = 0; j < certificateNodes.length; j++) {
                const certNode = certificateNodes[j];
                certificates.push({
                  id: certNode.getAttribute("id") || `cert-${i}-${j}`,
                  name: certNode.textContent || `Certificate ${j + 1}`,
                });
              }
            }

            // Create response object with all details
            const responseObj = {
              id:
                getElementTextContent(responseNode, "response_id") ||
                `response-${i}`,
              fullName: getElementTextContent(responseNode, "full_name") || "",
              email: email,
              description:
                getElementTextContent(responseNode, "description") || "",
              gender: getElementTextContent(responseNode, "gender") || "",
              programmingStack:
                getElementTextContent(responseNode, "programming_stack") || "",
              certificates: certificates,
              dateResponded:
                getElementTextContent(responseNode, "date_responded") || "",
            };

            matchingResponses.push(responseObj);
          }
        }

        console.log(`Found ${matchingResponses.length} exact email matches`);

        if (matchingResponses.length > 0) {
          setResponses(matchingResponses);
        } else {
          // No exact matches found
          console.log("No exact matches found, setting empty response array");
          setResponses([]);
          setError(`No responses found for email: ${emailFilter.trim()}`);
        }
      } else {
        console.error("Response is not in expected format");
        setError("Unable to filter: response format not supported");
      }

      setLoading(false);
    } catch (err) {
      console.error("Email filtering error:", err);
      setError(`Failed to filter: ${err.message}`);
      setLoading(false);
    }
  };

  const handleClearFilter = () => {
    console.log("Clearing filter");
    setEmailFilter(""); // Clear the filter input
    setCurrentPage(1); // Reset to first page
    fetchResponses(); // Fetch without filter
  };

  const handleViewDetails = (response) => {
    setSelectedResponse(response);
  };

  const closeDetails = () => {
    setSelectedResponse(null);
  };

  const toggleDebugInfo = () => {
    if (debugInfo) {
      console.log("Debug info:", debugInfo);
      alert("Debug info has been logged to console");
    }
  };

  // Loading state
  if (loading && responses.length === 0) {
    return (
      <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded shadow text-center">
        <p>Loading survey responses...</p>
      </div>
    );
  }

  // Render component
  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded shadow">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Survey Responses</h1>
        <Link to="/" className="text-blue-600 hover:underline">
          Back to Survey
        </Link>
      </div>

      {/* Email Filter and View Toggle */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          {/* Email Filter */}
          <FilterForm
            emailFilter={emailFilter}
            handleEmailFilterChange={handleEmailFilterChange}
            handleEmailFilterSubmit={handleEmailFilterSubmit}
            handleClearFilter={handleClearFilter}
          />

          {/* View Mode Toggle */}
          <div className="flex items-end">
            <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
          </div>
        </div>
      </div>

      {/* Error display */}
      <ErrorDisplay
        error={error}
        fetchResponses={fetchResponses}
        toggleDebugInfo={toggleDebugInfo}
      />

      {/* Results display */}
      {responses.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded">
          <p className="text-gray-600">No responses found.</p>
        </div>
      ) : (
        <>
          {/* Table View */}
          {viewMode === "table" && (
            <TableView
              responses={responses}
              handleViewDetails={handleViewDetails}
            />
          )}

          {/* Card View */}
          {viewMode === "card" && (
            <CardView
              responses={responses}
              handleViewDetails={handleViewDetails}
            />
          )}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </>
      )}

      {/* Detail Modal */}
      <DetailModal
        selectedResponse={selectedResponse}
        closeDetails={closeDetails}
      />
    </div>
  );
};

export default SurveyResponses;
