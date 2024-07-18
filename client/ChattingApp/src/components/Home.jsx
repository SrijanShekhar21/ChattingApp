import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router";
import Login from "./Login";
import Register from "./Register";
import { useUser } from "../contexts/UserContext";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { Navigate } from "react-router";
import { socket } from "../socket";

function Home() {
  const [wantLogin, setWantLogin] = useState(true);

  const { user, setUser } = useUser();
  const { token, setToken } = useAuth();

  const userEmail = user ? JSON.parse(user).email : null;

  async function verifyUser() {
    try {
      const result = await axios.get(
        `http://localhost:3000/verifyUser?user=${userEmail}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("result is ", result.data);
      setUser(JSON.stringify(result.data));
      socket.connect();
    } catch (err) {
      console.error("Error in verification");
      setToken(null);
      localStorage.removeItem("token");
      socket.disconnect();
    }
  }

  useEffect(() => {
    verifyUser();
  }, []);

  if (token) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="home">
      <div className="homeLeft">
        <div className="ellipse"></div>
        <h1>Welcome to ChatApp</h1>
        <div className="homeLeftMain">
          <div className="homeFeatures">
            <h2>Features we offer...</h2>
            <ul>
              <li>Real-time chat</li>
              <li>Group chat</li>
              <li>All types of File Transfer</li>
              <li>End-to-end encryption</li>
            </ul>
          </div>
          <div className="creator">
            <h3>Created by:</h3>
            <p>Srijan Shekhar | 4th Year UG @ IIT Kanpur</p>
          </div>
        </div>
      </div>
      <div className="authDiv">
        {wantLogin ? <Login /> : <Register />}
        {wantLogin ? (
          <p style={{ color: "#718096" }}>
            Don't have an account?{" "}
            <span
              onClick={() => {
                setWantLogin(false);
              }}
              style={{
                cursor: "pointer",
                color: "#1C4532",
                textDecoration: "underline",
              }}
            >
              Sign Up
            </span>
          </p>
        ) : (
          <p style={{ color: "#718096" }}>
            Already have an account?{" "}
            <span
              onClick={() => {
                setWantLogin(true);
              }}
              style={{
                cursor: "pointer",
                color: "#1C4532",
                textDecoration: "underline",
              }}
            >
              Sign In
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

export default Home;
