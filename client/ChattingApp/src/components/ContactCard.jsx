import React, { useState } from "react";
import { useUser } from "../contexts/UserContext";
import chatUserDP from "../../chatUserDP.jpg";

function ContactCard({ contact }) {
  const { user, chattingWith, setChattingWith } = useUser();
  const { selContactMobile, setSelContactMobile } = useUser();
  const [activeUsers] = useState([]);

  const userEmail = JSON.parse(user).email;
  const chattingWithEmail = chattingWith
    ? JSON.parse(chattingWith).email
    : null;

  async function handleClick(clickedContact) {
    console.log("Clicked on ", clickedContact);
    //get id of the clicked contact

    const contactUserActive = activeUsers.find(
      (user) => user.email === clickedContact.email
    );
    const contactId = contactUserActive ? contactUserActive.id : null;
    console.log("Contact id: ", contactId);
    setChattingWith(JSON.stringify({ id: contactId, ...clickedContact }));
    setSelContactMobile(false);
  }

  return (
    <div
      style={{
        cursor: "pointer",
        //bg color yellow if selected
        backgroundColor: chattingWithEmail === contact.email && "#e6e6e6",
      }}
      onClick={() => {
        handleClick(contact);
      }}
      //class contact to all and active to only active users
      className="contact"
    >
      <div className="imgDp">
        <img src={chatUserDP} alt="" />
        <div
          className={`activeDot ${contact.active ? "active" : "notActive"}`}
        ></div>
      </div>

      <h3>
        {contact.name}
        {contact.typing && <span className="typing">Typing...</span>}
      </h3>
      <div className="underline"></div>
    </div>
  );
}

export default ContactCard;
