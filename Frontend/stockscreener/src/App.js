import { BrowserRouter } from "react-router-dom";
import { useEffect } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRouter";

function App() {
  useEffect(() => {
    // clears localstorage
    localStorage.clear();
  }, []);

  return (
    <BrowserRouter>
      <Navbar />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
