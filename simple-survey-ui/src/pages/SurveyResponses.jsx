import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

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

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  // Debug responses updates
  useEffect(() => {
    console.log("Responses updated:", responses);
  }, [responses]);

  // Fetch responses when page changes or when explicitly called by filters
  useEffect(() => {
    fetchResponses();
  }, [currentPage]); // Remove emailFilter dependency to prevent auto-fetching

  // Main fetch function
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
        handleXmlResponse(response.data);
      } else if (typeof response.data === "object") {
        console.log("Response is object, handling as JSON");
        handleJsonResponse(response.data);
      } else if (typeof response.data === "string") {
        // Try to parse as JSON
        try {
          console.log("Attempting to parse string response as JSON");
          const jsonData = JSON.parse(response.data);
          handleJsonResponse(jsonData);
        } catch (parseErr) {
          console.log("String is not valid JSON, trying to parse as XML");
          handleXmlResponse(response.data);
        }
      } else {
        console.error("Unknown response format:", typeof response.data);
        setError(`Unknown response format: ${typeof response.data}`);
        provideFallbackResponses();
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
      provideFallbackResponses();
    }
  };

  // Handle JSON responses
  const handleJsonResponse = (jsonData) => {
    try {
      console.log("Processing JSON response:", jsonData);

      // Check for the question_responses property and handle accordingly
      if (jsonData.question_responses) {
        console.log("Found question_responses in JSON response");

        // Extract the array of responses
        const responseItems = Array.isArray(jsonData.question_responses)
          ? jsonData.question_responses
          : [];

        // Process the items into the format needed for display
        processResponseItems(responseItems);

        // Set pagination info from the response
        setCurrentPage(parseInt(jsonData.current_page) || 1);
        setTotalPages(parseInt(jsonData.last_page) || 1);
      } else {
        console.error(
          "JSON response missing question_responses array:",
          jsonData
        );
        setError("Invalid response format: missing question_responses array");
        provideFallbackResponses();
      }
    } catch (err) {
      console.error("Error processing JSON response:", err);
      setError(`Error processing JSON response: ${err.message}`);
      provideFallbackResponses();
    }
  };

  // Handle XML responses
  const handleXmlResponse = (xmlData) => {
    try {
      console.log("XML data length:", xmlData.length);
      console.log("XML data sample:", xmlData.substring(0, 200));

      // Parse XML response
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlData, "text/xml");

      // Check for parsing errors
      const parseError = xmlDoc.getElementsByTagName("parsererror");
      if (parseError.length > 0) {
        console.error("XML parsing error:", parseError[0].textContent);
        setError(`XML parsing error: ${parseError[0].textContent}`);
        provideFallbackResponses();
        return;
      }

      // Get root element
      console.log("XML document root:", xmlDoc.documentElement.nodeName);

      // Find the question_responses element
      const responsesElement =
        xmlDoc.getElementsByTagName("question_responses")[0];

      if (!responsesElement) {
        console.error("No question_responses element found in XML");
        console.log(
          "Available root elements:",
          xmlDoc.documentElement.childNodes
        );
        setError("Missing 'question_responses' element in response");
        provideFallbackResponses();
        return;
      }

      // Extract pagination attributes
      const currentPageAttr = responsesElement.getAttribute("current_page");
      const lastPageAttr = responsesElement.getAttribute("last_page");
      const pageSizeAttr = responsesElement.getAttribute("page_size");
      const totalCountAttr = responsesElement.getAttribute("total_count");

      console.log("Pagination info:", {
        currentPage: currentPageAttr,
        lastPage: lastPageAttr,
        pageSize: pageSizeAttr,
        totalCount: totalCountAttr,
      });

      setCurrentPage(parseInt(currentPageAttr) || 1);
      setTotalPages(parseInt(lastPageAttr) || 1);

      // Find all question_response elements
      const responseNodes =
        responsesElement.getElementsByTagName("question_response");
      console.log("Response nodes found:", responseNodes.length);

      if (responseNodes.length === 0) {
        console.log("No responses found in XML");
        setResponses([]);
        return;
      }

      // Process each response node
      const parsedResponses = [];

      for (let i = 0; i < responseNodes.length; i++) {
        const responseNode = responseNodes[i];

        // Extract response_id
        const responseId = getElementTextContent(responseNode, "response_id");

        // Extract full_name
        const fullName = getElementTextContent(responseNode, "full_name");

        // Extract email_address
        const email = getElementTextContent(responseNode, "email_address");

        // Extract description
        const description = getElementTextContent(responseNode, "description");

        // Extract gender
        const gender = getElementTextContent(responseNode, "gender");

        // Extract programming_stack
        const programmingStack = getElementTextContent(
          responseNode,
          "programming_stack"
        );

        // Extract certificates
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

        // Extract date_responded
        const dateResponded = getElementTextContent(
          responseNode,
          "date_responded"
        );

        // Debug output for the first few responses
        if (i < 3) {
          console.log(`Response #${i} data:`, {
            responseId,
            fullName,
            email,
            description,
            gender,
            programmingStack,
            certificates,
            dateResponded,
          });
        }

        // Create response object
        const responseObj = {
          id: responseId || `response-${i}`,
          fullName: fullName || "",
          email: email || "",
          description: description || "",
          gender: gender || "",
          programmingStack: programmingStack || "",
          certificates: certificates,
          dateResponded: dateResponded || "",
        };

        parsedResponses.push(responseObj);
      }

      console.log("Parsed responses from XML:", parsedResponses);
      setResponses(parsedResponses);
    } catch (err) {
      console.error("Error processing XML response:", err);
      setError(`Error processing XML response: ${err.message}`);
      provideFallbackResponses();
    }
  };

  // Process response items into consistent format
  const processResponseItems = (items) => {
    try {
      console.log("Processing response items:", items);

      if (!items || items.length === 0) {
        console.log("No items to process");
        setResponses([]);
        return;
      }

      // Process each item into a consistent format
      const mappedResponses = items.map((item, index) => {
        // Process certificates
        let certificates = [];

        if (item.certificates) {
          if (Array.isArray(item.certificates)) {
            certificates = item.certificates.map((cert, certIndex) => {
              if (typeof cert === "object" && cert !== null) {
                return {
                  id: cert.id || `cert-${index}-${certIndex}`,
                  name: cert.name || `Certificate ${certIndex + 1}`,
                };
              } else {
                return {
                  id: `cert-${index}-${certIndex}`,
                  name: String(cert),
                };
              }
            });
          } else if (typeof item.certificates === "object") {
            const certArray = Array.isArray(item.certificates.certificate)
              ? item.certificates.certificate
              : item.certificates.certificate
              ? [item.certificates.certificate]
              : [];

            certificates = certArray.map((cert, certIndex) => ({
              id: cert.id || `cert-${index}-${certIndex}`,
              name: cert.name || cert.toString(),
            }));
          }
        }

        // Create response object with consistent structure
        return {
          id: item.response_id || item.id || `response-${index}`,
          fullName: item.full_name || "",
          email: item.email_address || "",
          description: item.description || "",
          gender: item.gender || "",
          programmingStack: item.programming_stack || "",
          certificates: certificates,
          dateResponded: item.date_responded || "",
        };
      });

      console.log("Processed items result:", mappedResponses);
      setResponses(mappedResponses);
    } catch (err) {
      console.error("Error processing response items:", err);
      setError(`Error processing items: ${err.message}`);
      setResponses([]);
    }
  };

  // Helper function to safely get text content with debugging
  const getElementTextContent = (parentNode, tagName) => {
    const element = parentNode.getElementsByTagName(tagName)[0];
    if (!element) {
      console.log(`Element '${tagName}' not found`);
      return "";
    }
    const content = element.textContent || "";
    return content;
  };

  // Provide fallback data for testing or when API fails
  const provideFallbackResponses = () => {
    console.log("Using fallback response data");
    const fallbackResponses = [
      {
        id: "1",
        fullName: "Jan Doe",
        email: "janedoe@gmail.com",
        description: "I'm a frontend engineer",
        gender: "FEMALE",
        programmingStack: "REACT,VUE",
        certificates: [],
        dateResponded: "2025-04-08 07:16:51",
      },
      {
        id: "6",
        fullName: "Sammy Obonyo",
        email: "samexample@gmail.com",
        description: "I'm a Software engineer",
        gender: "FEMALE",
        programmingStack: "REACT,VUE,MYSQL",
        certificates: [
          { id: "6", name: "1744179367028-Degree.pdf" },
          { id: "5", name: "1744179366732-Degree.pdf" },
        ],
        dateResponded: "2025-04-09 06:16:09",
      },
      {
        id: "21",
        fullName: "Alex Indimuli",
        email: "indmuli@gmail.com",
        description: "Fullstack web developer",
        gender: "MALE",
        programmingStack: "REACT,ANGULAR,VUE,SQL,POSTGRES",
        certificates: [
          { id: "22", name: "1744540156315-15-DynamicProgramming.pdf" },
        ],
        dateResponded: "2025-04-13 10:29:17",
      },
    ];

    setResponses(fallbackResponses);
    setCurrentPage(1);
    setTotalPages(3);
  };

  // Certificate download handler
  const handleDownloadCertificate = async (certId, certName) => {
    try {
      console.log(`Downloading certificate: ${certId} - ${certName}`);

      const downloadUrl = `${API_BASE_URL}/api/questions/responses/certificates/${certId}`;
      console.log("Download URL:", downloadUrl);

      try {
        const response = await axios.get(downloadUrl, {
          responseType: "blob",
          headers: { Accept: "application/pdf" },
        });

        // Create blob URL and trigger download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", certName);
        document.body.appendChild(link);
        link.click();

        // Clean up
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (downloadErr) {
        console.error("Download failed:", downloadErr);
        alert(`Failed to download certificate. ${downloadErr.message}`);
      }
    } catch (err) {
      console.error("Error downloading certificate:", err);
      alert(
        `Failed to download certificate: ${certName}. Please try again later.`
      );
    }
  };

  // Try direct API call to test filter functionality
  const testEmailFilter = async (email) => {
    try {
      console.log(`Testing direct API filter for email: ${email}`);

      // Create test URL with direct email search
      const testUrl = `${API_BASE_URL}/api/questions/responses?email_address=${encodeURIComponent(
        email
      )}`;

      // Make API call with specific Accept header
      const response = await axios.get(testUrl, {
        headers: { Accept: "application/xml, text/xml, */*" },
      });

      console.log("Test filter response status:", response.status);
      console.log("Test filter response data type:", typeof response.data);

      // Check if the response contains filtered results
      if (typeof response.data === "string") {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(response.data, "text/xml");
        const responseNodes = xmlDoc.getElementsByTagName("question_response");

        console.log(`Test filter found ${responseNodes.length} results`);

        // Check the first response for matching email
        if (responseNodes.length > 0) {
          const firstEmailNode =
            responseNodes[0].getElementsByTagName("email_address")[0];
          if (firstEmailNode) {
            console.log(`First result email: ${firstEmailNode.textContent}`);
          }
        }
      }

      return true;
    } catch (err) {
      console.error("Test filter error:", err);
      return false;
    }
  };

  // Event handlers with improved filter testing
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

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString;
    }
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

      {/* Email Filter - with simplified label */}
      <div className="mb-6">
        <form
          onSubmit={handleEmailFilterSubmit}
          className="flex items-end gap-2"
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
      </div>

      {/* Error display */}
      {error && (
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
      )}

      {/* Results display */}
      {responses.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded">
          <p className="text-gray-600">No responses found.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left border-b">Name</th>
                  <th className="px-4 py-2 text-left border-b">Email</th>
                  <th className="px-4 py-2 text-left border-b">Gender</th>
                  <th className="px-4 py-2 text-left border-b">
                    Programming Stack
                  </th>
                  <th className="px-4 py-2 text-left border-b">
                    Date Responded
                  </th>
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
                      {response.programmingStack
                        ?.split(",")
                        .map((item, idx) => (
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

          {/* Pagination */}
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
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
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
        </>
      )}

      {/* Detail Modal */}
      {selectedResponse && (
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
      )}
    </div>
  );
};

export default SurveyResponses;
