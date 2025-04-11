import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SurveyForm from "./pages/SurveyForm";
import SurveyResponses from "./pages/SurveyResponses";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SurveyForm />} />
        <Route path="/responses" element={<SurveyResponses />} />
      </Routes>
    </Router>
  );
}

export default App;
