import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const SurveyForm = () => {
  const [step, setStep] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState({});
  const [uploadFiles, setUploadFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  // Group questions by page
  const getStepQuestions = (stepIndex) => {
    // For this implementation, we'll use a simple division:
    // Step 0: Basic info (name, email, gender)
    // Step 1: Details (description, programming stack, certificates)
    // Step 2: Preview (all details)
    const basicInfoQuestions = ["full_name", "email_address", "gender"];
    const detailsQuestions = [
      "description",
      "programming_stack",
      "certificates",
    ];

    return questions.filter(
      (q) =>
        (stepIndex === 0 && basicInfoQuestions.includes(q.name)) ||
        (stepIndex === 1 && detailsQuestions.includes(q.name))
    );
  };

  // Fetch questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        console.log(
          "Fetching questions from:",
          `${API_BASE_URL}/api/questions`
        );
        const response = await axios.get(`${API_BASE_URL}/api/questions`);
        console.log("Response received:", response.data);

        // Parse XML response
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(response.data, "text/xml");
        console.log("Parsed XML:", xmlDoc);

        const questionNodes = xmlDoc.getElementsByTagName("question");
        console.log("Question nodes found:", questionNodes.length);

        const questionsArray = [];
        const initialForm = {};

        for (let i = 0; i < questionNodes.length; i++) {
          const question = questionNodes[i];
          const name = question.getAttribute("name");
          const type = question.getAttribute("type");
          const required = question.getAttribute("required") === "yes";

          const text =
            question.getElementsByTagName("text")[0]?.textContent || "";
          const description =
            question.getElementsByTagName("description")[0]?.textContent || "";

          let options = [];
          const optionsNode = question.getElementsByTagName("options")[0];
          if (optionsNode) {
            const multiple = optionsNode.getAttribute("multiple") === "yes";
            const optionNodes = optionsNode.getElementsByTagName("option");

            for (let j = 0; j < optionNodes.length; j++) {
              options.push({
                value: optionNodes[j].getAttribute("value"),
                text: optionNodes[j].textContent,
              });
            }

            questionsArray.push({
              name,
              type,
              required,
              text,
              description,
              options,
              multiple,
            });

            // Initialize form state
            initialForm[name] = multiple ? [] : "";
          } else {
            // File properties for file type questions
            let fileProps = {};
            const filePropsNode =
              question.getElementsByTagName("file_properties")[0];
            if (filePropsNode) {
              fileProps = {
                format: filePropsNode.getAttribute("format"),
                maxFileSize: filePropsNode.getAttribute("max_file_size"),
                maxFileSizeUnit:
                  filePropsNode.getAttribute("max_file_size_unit"),
                multiple: filePropsNode.getAttribute("multiple") === "yes",
              };
            }

            questionsArray.push({
              name,
              type,
              required,
              text,
              description,
              fileProps,
            });

            // Initialize form state
            initialForm[name] = type === "file" ? [] : "";
          }
        }

        console.log("Processed questions:", questionsArray);
        console.log("Initial form state:", initialForm);

        // Fallback for testing if no questions were found
        if (questionsArray.length === 0) {
          console.log("No questions found, using fallback questions");
          const fallbackQuestions = [
            {
              name: "full_name",
              type: "short_text",
              required: true,
              text: "What is your full name?",
              description: "[Surname] [First Name] [Other Names]",
            },
            {
              name: "email_address",
              type: "email",
              required: true,
              text: "What is your email address?",
              description: "",
            },
            {
              name: "gender",
              type: "choice",
              required: true,
              text: "What is your gender?",
              description: "",
              options: [
                { value: "MALE", text: "MALE" },
                { value: "FEMALE", text: "FEMALE" },
                { value: "OTHER", text: "OTHER" },
              ],
              multiple: false,
            },
            {
              name: "description",
              type: "long_text",
              required: true,
              text: "Tell us a bit more about yourself",
              description: "",
            },
            {
              name: "programming_stack",
              type: "choice",
              required: true,
              text: "What programming stack are you familiar with?",
              description: "You can select multiple",
              options: [
                { value: "REACT", text: "REACT" },
                { value: "ANGULAR", text: "ANGULAR" },
                { value: "VUE", text: "VUE" },
                { value: "SQL", text: "SQL" },
                { value: "POSTGRES", text: "POSTGRES" },
                { value: "MYSQL", text: "MYSQL" },
                { value: "MSSQL", text: "MSSQL" },
                { value: "Java", text: "Java" },
                { value: "PHP", text: "PHP" },
                { value: "GO", text: "GO" },
                { value: "RUST", text: "RUST" },
              ],
              multiple: true,
            },
            {
              name: "certificates",
              type: "file",
              required: true,
              text: "Upload any of your certificates?",
              description: "You can upload multiple (.pdf)",
              fileProps: {
                format: ".pdf",
                maxFileSize: "1",
                maxFileSizeUnit: "mb",
                multiple: true,
              },
            },
          ];

          // Use fallback questions and initialize form
          questionsArray.push(...fallbackQuestions);
          initialForm.full_name = "";
          initialForm.email_address = "";
          initialForm.description = "";
          initialForm.gender = "";
          initialForm.programming_stack = [];
          initialForm.certificates = [];
        }

        setQuestions(questionsArray);
        setForm(initialForm);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching questions:", err);
        setError("Failed to load form questions. Please try again later.");
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [API_BASE_URL]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleMultiSelect = (e) => {
    const { value, checked } = e.target;
    const questionName = e.target.name || e.target.getAttribute("data-name");

    setForm((prev) => {
      const updated = checked
        ? [...(prev[questionName] || []), value]
        : (prev[questionName] || []).filter((item) => item !== value);
      return { ...prev, [questionName]: updated };
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setUploadFiles(files);
    setForm({ ...form, certificates: files.map((f) => f.name) });
  };

  const validateStep = () => {
    const stepQuestions = getStepQuestions(step);

    for (const question of stepQuestions) {
      if (question.required) {
        const value = form[question.name];

        if (!value || (Array.isArray(value) && value.length === 0)) {
          alert(`${question.text} is required.`);
          return false;
        }
      }
    }

    return true;
  };

  const nextStep = () => {
    if (validateStep()) setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async () => {
    setSubmitting(true);

    const formData = new FormData();

    // Add all form fields to FormData
    for (const [key, value] of Object.entries(form)) {
      if (key === "certificates") continue; // Skip certificates as we handle files separately

      if (Array.isArray(value)) {
        formData.append(key, value.join(","));
      } else {
        formData.append(key, value);
      }
    }

    // Add files
    uploadFiles.forEach((file) => {
      formData.append("certificates", file);
    });

    try {
      console.log(
        "Submitting form to:",
        `${API_BASE_URL}/api/questions/responses`
      );
      console.log("Form data entries:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      await axios.put(`${API_BASE_URL}/api/questions/responses`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Form submitted successfully");
      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting form:", err);

      // More detailed error handling
      if (err.response) {
        console.error("Response status:", err.response.status);
        console.error("Response data:", err.response.data);
      }

      alert("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question) => {
    switch (question.type) {
      case "short_text":
        return (
          <div className="mb-4">
            <label className="block mb-1 font-medium">{question.text}</label>
            {question.description && (
              <p className="text-sm text-gray-600 mb-2">
                {question.description}
              </p>
            )}
            <input
              type="text"
              name={question.name}
              value={form[question.name] || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required={question.required}
            />
            {question.required && (
              <p className="text-xs text-red-500 mt-1">* Required</p>
            )}
          </div>
        );

      case "email":
        return (
          <div className="mb-4">
            <label className="block mb-1 font-medium">{question.text}</label>
            {question.description && (
              <p className="text-sm text-gray-600 mb-2">
                {question.description}
              </p>
            )}
            <input
              type="email"
              name={question.name}
              value={form[question.name] || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required={question.required}
            />
            {question.required && (
              <p className="text-xs text-red-500 mt-1">* Required</p>
            )}
          </div>
        );

      case "long_text":
        return (
          <div className="mb-4">
            <label className="block mb-1 font-medium">{question.text}</label>
            {question.description && (
              <p className="text-sm text-gray-600 mb-2">
                {question.description}
              </p>
            )}
            <textarea
              name={question.name}
              value={form[question.name] || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              rows={4}
              required={question.required}
            />
            {question.required && (
              <p className="text-xs text-red-500 mt-1">* Required</p>
            )}
          </div>
        );

      case "choice":
        if (question.multiple) {
          return (
            <div className="mb-4">
              <label className="block mb-1 font-medium">{question.text}</label>
              {question.description && (
                <p className="text-sm text-gray-600 mb-2">
                  {question.description}
                </p>
              )}
              {question.options.map((option) => (
                <label key={option.value} className="block text-sm my-1">
                  <input
                    type="checkbox"
                    value={option.value}
                    data-name={question.name}
                    checked={(form[question.name] || []).includes(option.value)}
                    onChange={handleMultiSelect}
                    className="mr-2"
                  />
                  {option.text}
                </label>
              ))}
              {question.required && (
                <p className="text-xs text-red-500 mt-1">* Required</p>
              )}
            </div>
          );
        } else {
          return (
            <div className="mb-4">
              <label className="block mb-1 font-medium">{question.text}</label>
              {question.description && (
                <p className="text-sm text-gray-600 mb-2">
                  {question.description}
                </p>
              )}
              {question.options.map((option) => (
                <label key={option.value} className="block text-sm my-1">
                  <input
                    type="radio"
                    name={question.name}
                    value={option.value}
                    checked={form[question.name] === option.value}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  {option.text}
                </label>
              ))}
              {question.required && (
                <p className="text-xs text-red-500 mt-1">* Required</p>
              )}
            </div>
          );
        }

      case "file":
        return (
          <div className="mb-4">
            <label className="block font-medium mb-1">{question.text}</label>
            {question.description && (
              <p className="text-sm text-gray-600 mb-2">
                {question.description}
              </p>
            )}
            <input
              type="file"
              accept={question.fileProps?.format || ".pdf"}
              multiple={question.fileProps?.multiple || false}
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
            />
            {question.fileProps?.maxFileSize && (
              <p className="text-xs text-gray-500 mt-1">
                Max file size: {question.fileProps.maxFileSize}
                {question.fileProps.maxFileSizeUnit}
              </p>
            )}
            {question.required && (
              <p className="text-xs text-red-500 mt-1">* Required</p>
            )}
          </div>
        );

      default:
        return <div>Unsupported question type: {question.type}</div>;
    }
  };

  const getStatusBar = () => {
    const steps = ["Basic Information", "Survey Details", "Preview"];
    return (
      <div className="w-full mb-6 bg-blue-600 text-white rounded-t-xl">
        <div className="flex justify-between">
          {steps.map((stepLabel, index) => (
            <div
              key={index}
              className={`w-1/3 text-center py-4 ${
                index <= step ? "bg-blue-700 font-bold" : "bg-blue-600"
              } rounded-t-xl`}
            >
              <span className="font-semibold">{index + 1}</span>
              <div className="text-xs">{stepLabel}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow text-center">
        <p>Loading survey questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow text-center text-red-600">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-green-100 rounded text-center text-green-800">
        <h2 className="text-xl font-bold mb-2">Thank you!</h2>
        <p>Your response has been successfully submitted.</p>
        <div className="mt-4">
          <Link to="/responses" className="text-blue-600 hover:underline">
            View All Responses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Survey Form</h1>
        <Link to="/responses" className="text-blue-600 hover:underline">
          View Responses
        </Link>
      </div>

      {getStatusBar()}

      <h2 className="text-xl font-semibold mb-6 text-blue-700">
        {step === 0
          ? "Basic Information"
          : step === 1
          ? "Survey Details"
          : "Preview"}
      </h2>

      {step < 2 ? (
        <div className="mb-6">
          {getStepQuestions(step).map((question) => (
            <div
              key={question.name}
              className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              {renderQuestion(question)}
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">
            Please review your responses before submitting.
          </p>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <ul className="text-sm text-gray-800 space-y-3">
              {questions.map((question) => (
                <li
                  key={question.name}
                  className="border-b border-gray-200 pb-2"
                >
                  <div className="font-medium">{question.text}</div>
                  <div className="mt-1">
                    {question.type === "file"
                      ? uploadFiles.length > 0
                        ? uploadFiles.map((file) => file.name).join(", ")
                        : "No files uploaded"
                      : Array.isArray(form[question.name])
                      ? form[question.name].length > 0
                        ? form[question.name].join(", ")
                        : "None selected"
                      : form[question.name] || "Not provided"}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        {step > 0 && (
          <button
            onClick={prevStep}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Back
          </button>
        )}
        {step < 2 ? (
          <button
            onClick={nextStep}
            className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
              step === 0 ? "ml-auto" : ""
            }`}
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        )}
      </div>
    </div>
  );
};

export default SurveyForm;
