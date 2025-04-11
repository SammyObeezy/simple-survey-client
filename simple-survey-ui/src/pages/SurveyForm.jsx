import React, { useState } from "react";
import axios from "axios";

const SurveyForm = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    other_names: "",
    email_address: "",
    gender: "",
    description: "",
    programming_stack: [],
    certificates: [],
  });

  const [uploadFiles, setUploadFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMultiSelect = (e) => {
    const { value, checked } = e.target;
    setForm((prev) => {
      const updated = checked
        ? [...prev.programming_stack, value]
        : prev.programming_stack.filter((item) => item !== value);
      return { ...prev, programming_stack: updated };
    });
  };

  const handleFileChange = (e) => {
    setUploadFiles(Array.from(e.target.files));
  };

  const validateStep = () => {
    if (step === 0) {
      if (
        !form.first_name ||
        !form.last_name ||
        !form.email_address ||
        !form.gender
      ) {
        alert("Please fill all required fields on this page.");
        return false;
      }
    }
    if (step === 1) {
      if (!form.description) {
        alert("Description is required.");
        return false;
      }
      if (uploadFiles.length === 0) {
        alert("Please upload at least one certificate.");
        return false;
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

    const fullName =
      `${form.last_name} ${form.first_name} ${form.other_names}`.trim();

    const formData = new FormData();
    formData.append("full_name", fullName);
    formData.append("email_address", form.email_address);
    formData.append("description", form.description);
    formData.append("gender", form.gender);
    formData.append("programming_stack", form.programming_stack.join(","));

    uploadFiles.forEach((file) => formData.append("certificates", file));

    try {
      await axios.put("/api/questions/responses", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("Submission failed.");
    } finally {
      setSubmitting(false);
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

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-green-100 rounded text-center text-green-800">
        <h2 className="text-xl font-bold mb-2">Thank you!</h2>
        <p>Your response has been successfully submitted.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      {getStatusBar()}

      <h2 className="text-xl font-semibold mb-6 text-blue-700">
        {step === 0
          ? "Basic Information"
          : step === 1
          ? "Survey Details"
          : "Preview"}
      </h2>

      {step === 0 && (
        <>
          <input
            type="text"
            name="first_name"
            placeholder="First Name"
            value={form.first_name}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-4"
            required
          />
          <input
            type="text"
            name="last_name"
            placeholder="Last Name"
            value={form.last_name}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-4"
            required
          />
          <input
            type="text"
            name="other_names"
            placeholder="Other Names"
            value={form.other_names}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-4"
          />
          <input
            type="email"
            name="email_address"
            placeholder="Email"
            value={form.email_address}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-4"
            required
          />
          <div className="mb-4">
            <label className="block mb-1 font-medium">Gender</label>
            {["MALE", "FEMALE", "OTHER"].map((option) => (
              <label key={option} className="block text-sm">
                <input
                  type="radio"
                  name="gender"
                  value={option}
                  checked={form.gender === option}
                  onChange={handleChange}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <textarea
            name="description"
            placeholder="Describe yourself"
            value={form.description}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-4"
            rows={4}
            required
          />
          <div className="mb-4">
            <label className="block mb-1 font-medium">Programming Stack</label>
            {[
              "REACT",
              "VUE",
              "ANGULAR",
              "SQL",
              "POSTGRES",
              "MYSQL",
              "MSSQL",
              "Java",
              "PHP",
              "GO",
              "RUST",
            ].map((tech) => (
              <label key={tech} className="block text-sm">
                <input
                  type="checkbox"
                  value={tech}
                  checked={form.programming_stack.includes(tech)}
                  onChange={handleMultiSelect}
                  className="mr-2"
                />
                {tech}
              </label>
            ))}
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-1">Certificates (PDF)</label>
            <input
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </>
      )}

      {step === 2 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-2">Preview</h3>
          <ul className="text-sm text-gray-800 space-y-1">
            <li>
              <strong>Name:</strong>{" "}
              {`${form.last_name} ${form.first_name} ${form.other_names}`.trim()}
            </li>
            <li>
              <strong>Email:</strong> {form.email_address}
            </li>
            <li>
              <strong>Gender:</strong> {form.gender}
            </li>
            <li>
              <strong>Description:</strong> {form.description}
            </li>
            <li>
              <strong>Stack:</strong> {form.programming_stack.join(", ")}
            </li>
            <li>
              <strong>Certificates:</strong>{" "}
              {uploadFiles.map((file) => file.name).join(", ")}
            </li>
          </ul>
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
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
