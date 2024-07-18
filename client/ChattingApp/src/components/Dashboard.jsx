import React, { useEffect } from "react";
import ChatComponent from "./ChatComponent";
import UsersComponent from "./UsersComponent";
import UserDPTabComponent from "./UserDPTabComponent";
import { socket } from "../socket";
import { useUser } from "../contexts/UserContext";
import { Navigate } from "react-router";

function Dashboard() {
  const { user, setChattingWith } = useUser();
  const { selContactMobile, setSelContactMobile } = useUser();

  if (!user) {
    return <Navigate to="/" />;
  }

  const userEmail = JSON.parse(user).email;

  useEffect(() => {
    socket.connect();
    socket.on("connect", () => {
      console.log("connected to socket: ", socket.id);
      socket.emit("user-connected", { email: userEmail, id: socket.id });
    });

    return () => {
      console.log(socket.id, "disconnected");
      socket.disconnect();
      setChattingWith(null);
    };
  }, []);

  return (
    <div className="dashboard">
      <div className={`dashLeft ${selContactMobile && "sideMenu"}`}>
        <UserDPTabComponent />
        <UsersComponent />
      </div>
      <div className={`dashRight ${!selContactMobile && "chatBar"}`}>
        <ChatComponent />
      </div>
    </div>
  );
}

export default Dashboard;
