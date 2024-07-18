import React, { useState, useContext, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useUser } from "../contexts/UserContext";
import axios from "axios";
import show from "../assets/show.png";
import hide from "../assets/hide.png";
import { socket } from "../socket";
import { Navigate, useNavigate } from "react-router";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const { setToken } = useAuth();
  const { setUser } = useUser();

  useEffect(() => {
    socket.disconnect();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loginUser = {
      email,
      password,
    };

    try {
      const result = await axios.post("http://localhost:3000/login", loginUser);
      const { user, token } = result.data;

      setToken(token);
      setUser(JSON.stringify(user));
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      socket.connect();
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setToken(null);
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setError(err.response.data);
    }
  };

  return (
    <div className="login">
      <h1>Sign In</h1>
      {error && (
        <p
          style={{
            color: "red",
            marginTop: "1rem",
          }}
        >
          {" "}
          {error}!{" "}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <div className="inputDiv">
          <input
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            value={email}
            type="text"
            id="email"
            name="email"
            required
            placeholder="Email"
          />
        </div>
        <div className="inputDiv">
          <input
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            value={password}
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            required
            placeholder="Password"
          />
          <div className="eye">
            <img
              onClick={() => setShowPassword(!showPassword)}
              src={showPassword ? show : hide}
              alt="show/hide"
            />
          </div>
        </div>

        <button type="submit">Sign In</button>
      </form>
    </div>
  );
}

export default Login;
