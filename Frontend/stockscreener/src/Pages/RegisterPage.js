import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./RegisterPage.css";

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("http://localhost:5000/users/login", {
        email,
        password,
      });
      console.log(res.data);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      console.log(localStorage.getItem("user"));
      navigate("/");
    } catch (err) {
      console.log(err.response);
      setError(err.response.data.message || err.message);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("http://localhost:5000/users/signup", {
        name: name,
        email: email,
        password: password,
      });
      console.log(res.data);
      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (err) {
      setError(err.response.data.message || err.message);
    }
  };

  return (
    <div className="login-container">
      <div>
        <h2>{isSignup ? "Sign Up" : "Login"}</h2>
        <form onSubmit={isSignup ? handleSignup : handleLogin}>
          {isSignup ? (
            <input
              type="name"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          ) : null}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">{isSignup ? "Sign Up" : "Login"}</button>
        </form>
        {error && <p>{error}</p>}
        <div style={{ marginTop: "18px", fontSize: "0.97rem" }}>
          {isSignup ? (
            <>
              Already have an account?{" "}
              <span
                style={{
                  color: "#1976d2",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                onClick={() => setIsSignup(false)}
              >
                Login
              </span>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <span
                style={{
                  color: "#1976d2",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                onClick={() => setIsSignup(true)}
              >
                Sign Up
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
