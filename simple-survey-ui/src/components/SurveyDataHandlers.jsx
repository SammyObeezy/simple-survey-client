import axios from "axios";

// API base URL
export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

// Handle JSON responses
export const handleJsonResponse = (
  jsonData,
  setResponses,
  setCurrentPage,
  setTotalPages,
  setError,
  processResponseItems,
  provideFallbackResponses
) => {
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
export const handleXmlResponse = (
  xmlData,
  setResponses,
  setCurrentPage,
  setTotalPages,
  setError,
  provideFallbackResponses,
  getElementTextContent
) => {
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
export const processResponseItems = (items, setResponses, setError) => {
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
export const getElementTextContent = (parentNode, tagName) => {
  const element = parentNode.getElementsByTagName(tagName)[0];
  if (!element) {
    console.log(`Element '${tagName}' not found`);
    return "";
  }
  const content = element.textContent || "";
  return content;
};

// Provide fallback data for testing or when API fails
export const provideFallbackResponses = (
  setResponses,
  setCurrentPage,
  setTotalPages
) => {
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
export const handleDownloadCertificate = async (certId, certName) => {
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
export const testEmailFilter = async (email) => {
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

// Format date for display
export const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString();
  } catch (e) {
    return dateString;
  }
};
