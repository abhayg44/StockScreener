import { Routes, Route } from "react-router-dom";
import HomePage from "../Pages/HomePage";
import RegisterPage from "../Pages/RegisterPage";
import Watchlist from "../Pages/Watchlist";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/watchlist" element={<Watchlist />} />
    </Routes>
  );
}

export default AppRoutes;
