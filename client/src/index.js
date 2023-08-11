import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sentiment from './Sentiment';
import Depression from './Depression';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/sentiment" element={<Sentiment />} />
        <Route path="/depression" element={<Depression />} /> {/* Adjust the path and component */}

      </Routes>
    </Router>
  </React.StrictMode>,
);

