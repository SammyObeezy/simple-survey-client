import React, { useEffect, useState } from "react";
import axios from "axios";

const SurveyResponses = () => {
  const [responses, setResponses] = useState([]);
  const [emailFilter, setEmailFilter] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetchResponses = async (pageNumber = 1, email = "") => {
    try {
      const res = await axios.get("/api/questions/responses", {
        params: {
          page: pageNumber,
          email_address: email,
        },
      });

      const data = res.data.responses || res.data.question_responses || [];
      setResponses(data);
      setPage(res.data.current_page || 1);
      setLastPage(res.data.last_page || 1);
    } catch (error) {
      console.error("Error fetching responses:", error);
    }
  };

  useEffect(() => {
    fetchResponses(page, emailFilter);
  }, [page, emailFilter]);

  const handleDownload = async (certificateIdOrName) => {
    try {
      const res = await axios.get(
        `/api/questions/responses/certificates/${certificateIdOrName}`,
        {
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", certificateIdOrName);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-8">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">
        Survey Responses
      </h2>

      <div className="mb-4 flex items-center space-x-2">
        <input
          type="email"
          placeholder="Filter by email address"
          className="border border-gray-300 rounded-md px-4 py-2 w-full"
          value={emailFilter}
          onChange={(e) => setEmailFilter(e.target.value)}
        />
        <button
          onClick={() => fetchResponses(1, emailFilter)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Filter
        </button>
      </div>

      {responses.length === 0 ? (
        <p className="text-gray-500">No responses found.</p>
      ) : (
        responses.map((resp, idx) => (
          <div key={idx} className="p-4 border-b border-gray-200">
            <p>
              <strong>Full Name:</strong> {resp.full_name}
            </p>
            <p>
              <strong>Email:</strong> {resp.email_address}
            </p>
            <p>
              <strong>Gender:</strong> {resp.gender}
            </p>
            <p>
              <strong>Description:</strong> {resp.description}
            </p>
            <p>
              <strong>Programming Stack:</strong>{" "}
              {typeof resp.programming_stack === "string"
                ? resp.programming_stack
                : Array.isArray(resp.programming_stack)
                ? resp.programming_stack.join(", ")
                : ""}
            </p>

            <div className="mt-2">
              <strong>Certificates:</strong>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {(resp.certificates || []).map((cert, i) => {
                  const idOrName = typeof cert === "string" ? cert : cert.id;
                  const displayName =
                    typeof cert === "string" ? cert : cert.name;

                  return (
                    <li key={i}>
                      {displayName}
                      <button
                        className="ml-2 text-blue-600 underline"
                        onClick={() => handleDownload(idOrName)}
                      >
                        Download
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <p className="text-sm text-gray-500 mt-2">
              Responded on:{" "}
              {resp.date_responded
                ? new Date(resp.date_responded).toLocaleString()
                : "N/A"}
            </p>
          </div>
        ))
      )}

      <div className="flex justify-between mt-6">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {page} of {lastPage}
        </span>
        <button
          disabled={page >= lastPage}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SurveyResponses;
