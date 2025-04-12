import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SurveyForm from "./pages/SurveyForm";
import SurveyResponses from "./pages/SurveyResponses";
import Home from "./pages/Home";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/survey" element={<SurveyForm />} />
            <Route path="/responses" element={<SurveyResponses />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
