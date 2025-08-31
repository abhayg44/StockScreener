import { Routes, Route } from "react-router-dom";
import HomePage from "../Pages/HomePage";
import RegisterPage from "../Pages/RegisterPage";
import Watchlist from "../Pages/Watchlist";
import Profile from "../Pages/Profile";

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
    </Routes>
  );
}

export default AppRoutes;
