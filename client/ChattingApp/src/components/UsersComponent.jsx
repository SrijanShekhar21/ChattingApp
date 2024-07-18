import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useUser } from "../contexts/UserContext";
import chatUserDP from "../../chatUserDP.jpg";
import axios from "axios";
import { socket } from "../socket";
import { useChats } from "../contexts/chatsContext";
import ContactCard from "./ContactCard";
import { useNavigate } from "react-router";
import DP from "../../DP.jpg";
import pencil from "../assets/pencil.png";
import pencil2 from "../assets/pencil-solid.svg";

//plan
//on click of a new contact, send the chats with the current user to the server and store it in a db
//then fetch the chats with the new user from the server and display it in the chat component

function UsersComponent() {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const { activeUsers, setActiveUsers } = useUser();
  const { contacts, setContacts } = useUser();
  const { typingUsers, setTypingUsers } = useUser();
  const { setToken } = useAuth();

  const userName = JSON.parse(user).name;

  const [editName, setEditName] = useState(userName);
  const { editProfile, setEditProfile } = useUser();

  const userEmail = JSON.parse(user).email;

  //GET all contacts of this user from the server
  useEffect(() => {
    async function getUserContacts() {
      try {
        const response = await axios.get(
          `http://localhost:3000/get-contacts?email=${userEmail}`
        );
        console.log("Contacts: ", response.data);
        setContacts(response.data);
      } catch (error) {
        console.error("Error fetching contacts: ", error);
      }
    }
    getUserContacts();
  }, []);

  //GET all active users from the server
  useEffect(() => {
    socket.on("active-users", (users) => {
      console.log("active users: ", users);
      //set active users except me
      setActiveUsers(users.filter((user) => user.email !== userEmail));
    });

    socket.on("typing", (data) => {
      setTypingUsers(data);
    });

    return () => {
      socket.off("active-users");
    };
  }, [socket]);

  //update contacts with active field
  useEffect(() => {
    //update messages with active field
    console.log("Active users: ", activeUsers);
    setContacts((prev) => {
      return prev.map((contact) => {
        let active = false;
        activeUsers.forEach((user) => {
          if (user.email === contact.email) {
            active = true;
          }
        });
        return { ...contact, active };
      });
    });
  }, [activeUsers]);

  //update contacts with typing field
  useEffect(() => {
    //update messages with typing field
    console.log("Typing users: ", typingUsers);
    setContacts((prev) => {
      return prev.map((contact) => {
        let typing = false;
        typingUsers.forEach((user) => {
          if (user.email === contact.email) {
            typing = true;
          }
        });
        return { ...contact, typing };
      });
    });
  }, [typingUsers]);

  async function handleSave() {
    try {
      const result = await axios.post(
        `http://localhost:3000/editProfile?userEmail=${userEmail}&newName=${editName}`
      );
      console.log("Profile edited:", result.data);
      setUser(JSON.stringify(result.data));
      setEditProfile(false);
    } catch (error) {
      console.error("Error during saving:", error);
    }
  }

  return (
    <div className="UsersComponentDiv">
      {editProfile && (
        <div className="editProfile">
          <h3>Edit Profile</h3>
          <img src={DP} alt="" />
          <label htmlFor="EditName" className="editNameLabel">
            Your name{"  "}
            <span
              style={{
                cursor: "pointer",
                color: "grey",
                filter: "grayscale(85%)",
              }}
            >
              ✏️
            </span>
          </label>
          <div className="inputEditDiv">
            <input
              autoFocus
              onChange={(e) => {
                setEditName(e.target.value);
              }}
              value={editName}
              type="text"
              placeholder="Edit Name..."
              id="EditName"
            />
          </div>

          <div className="editButtonsDiv">
            <button onClick={handleSave}>Save</button>
            <button
              onClick={() => {
                setEditProfile(false);
                setToken(null);
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                console.log("logged out");
                navigate("/");
              }}
              className="logout"
            >
              Logout
            </button>
          </div>
        </div>
      )}{" "}
      {
        <div className="UsersComponent">
          {contacts.length > 0 ? (
            contacts.map((contact) => {
              // console.log("Contact: ", contact);
              return <ContactCard key={contact.email} contact={contact} />;
            })
          ) : (
            <div className="contact">No active users</div>
          )}
        </div>
      }
    </div>
  );
}

export default UsersComponent;
