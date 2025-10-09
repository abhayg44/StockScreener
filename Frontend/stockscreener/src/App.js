import { BrowserRouter } from "react-router-dom";
import React, { useState, useEffect } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRouter";

function App() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log(process.env.REACT_APP_NODE_TOKEN_VALIDATE_URL);
    if (token) {
      fetch(process.env.REACT_APP_NODE_TOKEN_VALIDATE_URL, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (res.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        });
    }
  }, []);
  return (
    <BrowserRouter>
      <Navbar />
      <AppRoutes setUser={setUser} />
    </BrowserRouter>
  );
}

export default App;
