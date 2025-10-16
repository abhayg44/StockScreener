import React, { useEffect, useState } from "react";
import { OrbitProgress } from "react-loading-indicators";
import axios from "axios";
import "./Profile.css";
import { useNavigate } from "react-router-dom";

const Profile = (props) => {
  const [errorMsg, setErrorMsg] = useState("");
  const [profile, setProfile] = useState(null);
  const [newName, setNewName] = useState("");
  const [nameChange, setNameChange] = useState(false);
  const token = props.token;
  const Navigate = useNavigate();

  const handleNameChange = async () => {
    if (newName === profile.name) {
      setErrorMsg("Please enter a new name");
      return;
    }
    try {
      const res = await axios.put(
        process.env.REACT_APP_NODE_PROFILE_URL,
        {
          name: newName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProfile(res.data.user);
      setNameChange(false);
      setErrorMsg("");
    } catch (err) {
      setErrorMsg(err.response.data.message || err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    props.setUser(null);
    Navigate("/register");
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(process.env.REACT_APP_NODE_PROFILE_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfile(res.data.user);
        console.log("profile data is ", res.data);
      } catch (err) {
        console.log(err);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  if (!profile)
    return <OrbitProgress color="#32cd32" size="medium" text="" textColor="" />;

  return (
    <div className="profile-container">
      <h3>Welcome {profile.name}</h3>
      <p>Email: {profile.email}</p>
      {nameChange ? (
        <>
          <input
            type="text"
            placeholder="Enter new name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <button onClick={handleNameChange}>Change Name</button>
          {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
        </>
      ) : (
        <button onClick={() => setNameChange(true)}>
          Click To Change Name
        </button>
      )}
      {nameChange ? null : <button onClick={handleLogout}>Logout</button>}
    </div>
  );
};

export default Profile;
