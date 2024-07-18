import React, { useEffect, useState } from "react";
import dp from "../../DP.jpg";
import { useUser } from "../contexts/UserContext";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router";

function UserDPTabComponent() {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const { setToken } = useAuth();

  const userName = JSON.parse(user).name;
  const userEmail = JSON.parse(user).email;

  const { editProfile, setEditProfile } = useUser();

  function handleClick() {
    setEditProfile(!editProfile);
  }

  return (
    <div className="UserDPTabComponentDiv">
      <div className="UserDPTabComponent">
        <img
          style={{
            cursor: "pointer",
          }}
          onClick={handleClick}
          src={dp}
          alt="dp"
        />
        <div className="name">
          <p>Welcome</p>
          <h2>{userName}</h2>
        </div>
      </div>
    </div>
  );
}

export default UserDPTabComponent;
