import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Study from './pages/Study';
import PDFSummary from './pages/PDFSummary';
import Quiz from './pages/Quiz';
import ViewPDF from './pages/ViewPDF';
import ShortAnswerPractice from './pages/ShortAnswerPractice';
import LongAnswerPractice from './pages/LongAnswerPractice';
import AskQuestion from './pages/AskQuestion';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/study/:deckId" element={<Study />} />
            <Route path="/view/:deckId" element={<ViewPDF />} />
            <Route path="/summary/:deckId" element={<PDFSummary />} />
            <Route path="/quiz/:deckId" element={<Quiz />} />
            <Route path="/short-answer/:deckId" element={<ShortAnswerPractice />} />
            <Route path="/long-answer/:deckId" element={<LongAnswerPractice />} />
            <Route path="/ask/:deckId" element={<AskQuestion />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
