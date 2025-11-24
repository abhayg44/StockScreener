import { BrowserRouter } from "react-router-dom";
import React, { useState, useEffect } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRouter";
import axios from "axios";

function App() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem("token");
    // console.log(process.env.REACT_APP_NODE_TOKEN_VALIDATE_URL);
    const handlerTokenValidation = async () => {
      if (token) {
        try {
          const response = await axios.post(
            process.env.REACT_APP_NODE_TOKEN_VALIDATE_URL,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          // console.log("response is ", response);
          if (response.status != 200) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/register";
          }
        } catch (error) {
          console.error(error);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          window.location.href = "/register";
        }
      }
    };
    handlerTokenValidation();
  }, []);
  return (
    <BrowserRouter>
      <Navbar />
      <AppRoutes setUser={setUser} />
    </BrowserRouter>
  );
}

export default App;
