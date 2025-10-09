import React, { useEffect, useState } from "react";
import { OrbitProgress } from "react-loading-indicators";
import axios from "axios";
import "./Profile.css";
import { useNavigate } from "react-router-dom";

const Profile = (props) => {
  const [profile, setProfile] = useState(null);
  const [newName, setNewName] = useState("");
  const [nameChange, setNameChange] = useState(false);
  const token = props.token;
  const Nagivate = useNavigate();

  const handleNameChange = async () => {
    const res = await axios.put(
      "http://localhost:5000/profile",
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
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    props.setUser(null);
    Nagivate("/register");
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/profile", {
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
        <button onClick={handleNameChange}>Change Name</button>
      ) : (
        <button
          onClick={() => {
            setNameChange(!nameChange);
          }}
        >
          Click To Change Name
        </button>
      )}
      {nameChange ? (
        <input
          type="name"
          placeholder="Enter new name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
        />
      ) : null}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Profile;
