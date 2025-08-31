import { Routes, Route } from "react-router-dom";
import HomePage from "../Pages/HomePage";
import RegisterPage from "../Pages/RegisterPage";
import Watchlist from "../Pages/Watchlist";
import Profile from "../Pages/Profile";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/watchlist" element={<Watchlist />} />
      <Route
        path="/profile"
        element={
          <Profile user={JSON.parse(localStorage.getItem("user")).name} />
        }
      />
    </Routes>
  );
}

export default AppRoutes;
