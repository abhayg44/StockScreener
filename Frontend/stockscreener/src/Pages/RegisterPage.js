import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./RegisterPage.css";

function RegisterPage(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [unauthorized, setUnauthorized] = useState(true);
  const navigate = useNavigate();

  const loginURL = process.env.REACT_APP_NODE_LOGIN_URL;
  const signupURL = process.env.REACT_APP_NODE_SIGNUP_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(loginURL, {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      props.setUser(res.data.user);
      setUnauthorized(false);
      navigate("/", { state: { unauthorized: false } });
    } catch (err) {
      console.log(err.response);
      setError(err.response.data.message || err.message);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(signupURL, {
        name: name,
        email: email,
        password: password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      props.setUser(res.data.user);
      setUnauthorized(false);
      navigate("/", { state: { unauthorized: false } });
    } catch (err) {
      setError(err.response.data.message || err.message);
    }
  };

  return (
    <div>
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
    </div>
  );
}

export default RegisterPage;
