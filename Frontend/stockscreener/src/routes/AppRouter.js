import { Routes, Route } from "react-router-dom";
import HomePage from "../Pages/HomePage";
import RegisterPage from "../Pages/RegisterPage";
import Watchlist from "../Pages/Watchlist";
import Profile from "../Pages/Profile";
import StockPage from "../Pages/StockPage";
import StockDiary from "../Pages/StockDiary";
import StockDiaryPage from "../Pages/StockDiaryPage";

function AppRoutes(props) {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/register"
        element={<RegisterPage setUser={props.setUser} />}
      />
      <Route path="/watchlist" element={<Watchlist />} />
      <Route
        path="/profile"
        element={
          <Profile
            user={localStorage.getItem("user")}
            token={localStorage.getItem("token")}
            setUser={props.setUser}
          />
        }
      />
      <Route
        path="/stock/:ticker"
        setUser={props.setUser}
        element={<StockPage />}
      />
      <Route path="/stockdiary" element={<StockDiary />} />
      <Route path="/stockdiary/:id" element={<StockDiaryPage />} />
    </Routes>
  );
}

export default AppRoutes;
