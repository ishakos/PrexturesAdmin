//npm install react-router-dom
//npm install axios
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import PannelAd from "./components/PannelAd";
import LoginAd from "./components/LoginAd";

function App() {
  return (
    <>
      <Router basename={process.env.PUBLIC_URL}>
        <Routes>
          <Route path="" exact element={<LoginAd />} />
          <Route path="/admin" exact element={<PannelAd />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
