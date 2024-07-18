import React, { useState } from "react";
import axios from "axios";
import show from "../assets/show.png";
import hide from "../assets/hide.png";

function Register() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();

    const newUser = {
      email,
      name,
      password,
    };

    try {
      const result = await axios.post(
        "http://localhost:3000/register",
        newUser
      );
      console.log("User registered:", result.data);
      if (result.status === 200) {
        setSuccess("User Registered Successfully!");
      }
      setEmail("");
      setName("");
      setPassword("");
    } catch (error) {
      console.error("Error during registration:", error);
      setError(error.response.data);
    }
  }

  return (
    <div className="register">
      <h1>Sign Up</h1>
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

      {success && (
        <p
          style={{
            color: "green",
            marginTop: "1rem",
          }}
        >
          {" "}
          {success}{" "}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div className="inputDiv">
          <input
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            type="email"
            id="email"
            placeholder="Email"
          />
        </div>
        <div className="inputDiv">
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            type="text"
            id="name"
            placeholder="Name"
          />
        </div>
        <div className="inputDiv">
          <input
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            type={showPassword ? "text" : "password"}
            id="password"
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
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default Register;
