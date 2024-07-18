import React, { useEffect, useState, useRef } from "react";
import { useUser } from "../contexts/UserContext";
import chatUserDP from "../../chatUserDP.jpg";
import { socket } from "../socket";
import { useChats } from "../contexts/chatsContext";
import axios from "axios";
import send from "../assets/send.png";
import backArrow from "../assets/left-arrow.png";
import attachFile from "../assets/attach-file.png";
import gallery from "../assets/gallery.png";
import headphones from "../assets/headphones.png";
import documents from "../assets/google-docs.png";
import PreviewDiv from "./PreviewDiv";
import FileMsgDiv from "./FileMsgDiv";

function ChatComponent() {
  const { user, chattingWith } = useUser();
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const { messages, setMessages } = useChats();
  const bottomRef = useRef(null);
  const { activeUsers } = useUser();
  const { typingUsers } = useUser();
  const { contacts } = useUser();
  const { selContactMobile, setSelContactMobile } = useUser();
  const [uploading, setUploading] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [selFile, setSelFile] = useState(false);
  const [controller, setController] = useState(null);
  const { minimize, setMinimize } = useChats();

  const chattingWithName = chattingWith ? JSON.parse(chattingWith).name : null;
  const chattingWithEmail = chattingWith
    ? JSON.parse(chattingWith).email
    : null;
  const userEmail = JSON.parse(user).email;

  // fetch the chats with the new user from the server and display it in the chat component
  async function getChats() {
    try {
      const response = await axios.get(
        `http://localhost:3000/get-chats?user1=${userEmail}&user2=${chattingWithEmail}`
      );
      //set this array of messages to the messages state
      //sort reponse.data based on id
      response.data.sort((a, b) => a.id - b.id);
      console.log("Messages fetched: ", response.data);
      setMessages(response.data);
    } catch (error) {
      console.log("Error fetching chats from the server: ", error);
    }
  }
  useEffect(() => {
    getChats();
  }, [chattingWith]);

  //socket useEffect
  useEffect(() => {
    socket.on("received-private-msg", async (msg) => {
      console.log("received private message: ", msg);
      //add this msg to the messages state
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("received-msg");
    };
  }, [socket]);

  const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;

  const handleClick = async (e) => {
    e.preventDefault();
    //send message to the server
    const currMsg = {
      message: message,
      from_user: userEmail,
      to_user: chattingWithEmail,
      //time only hours and minutes with am pm
      time: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }),
      filetype: null,
      filename: null,
    };
    console.log("File: ", file);
    message != "" && socket.emit("send-private-message", currMsg);
    message != "" && console.log("Sending message: ", message);
    setMessage("");

    if (file && !uploading) {
      const formData = new FormData();
      formData.append("file", file.file);
      formData.append("upload_preset", UPLOAD_PRESET);

      const newController = new AbortController();
      setController(newController);

      try {
        const res = await axios.post(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            signal: newController.signal,
            onUploadProgress: (progressEvent) => {
              const uploadPercentage = Math.round(
                (progressEvent.loaded / progressEvent.total) * 100
              );
              setUploading(true);
              setPercentage(uploadPercentage);
            },
          }
        );
        console.log("res.data: ", res.data);
        const currMsg = {
          message: res.data.secure_url,
          from_user: userEmail,
          to_user: chattingWithEmail,
          time: new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          }),
          filetype: file.type,
          filename: file.filename,
        };
        console.log("Sending file: ", currMsg);
        socket.emit("send-private-message", currMsg);
        setFile(null);
        setShowPreview(false);
        setUploading(false);
        setPercentage(0);
        setMinimize(false);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log("upload cancel", error.message);
        } else {
          console.log("Upload failed", error);
        }
      }
    }
  };

  //scroll to bottom useEffect
  useEffect(() => {
    bottomRef.current !== null &&
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  //handle to show typing...
  const handleTyping = (e) => {
    socket.emit("typing", {
      email: userEmail,
      chattingWithEmail,
    });
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      socket.emit("not-typing", {
        email: userEmail,
      });
    }, 500);
    return () => clearTimeout(timeout);
  }, [message]);

  const handleCancelUpload = () => {
    setFile(null);
    setShowPreview(false);
    setUploading(false);
    setPercentage(0);

    if (controller) {
      controller.abort();
      setController(null);
      console.log("Upload cancelled");
    }
  };

  return (
    <div className="ChatComponent">
      {chattingWithName ? (
        <>
          <div className="chatComponentTopDiv">
            <div className="chatComponentTop">
              <div className="imgDp">
                <img
                  onClick={() => {
                    setSelContactMobile(true);
                  }}
                  className="backArrow"
                  src={backArrow}
                  alt=""
                />
                <img className="chatUserDP" src={chatUserDP} alt="" />
                <div
                  className={`activeDot ${
                    activeUsers.find((user) => user.email === chattingWithEmail)
                      ? "active"
                      : "notActive"
                  }`}
                ></div>
              </div>
              <div className="chattinWithNameDiv">
                <h3>{chattingWithName}</h3>
                {typingUsers.find(
                  (user) => user.email === chattingWithEmail
                ) ? (
                  <p className="isTyping">typing...</p>
                ) : activeUsers.find(
                    (user) => user.email === chattingWithEmail
                  ) ? (
                  <p className="online">Online</p>
                ) : (
                  <p className="offline">
                    Last seen{" "}
                    {contacts.find(
                      (contact) => contact.email === chattingWithEmail
                    ).lastseen || "N/A"}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="chatComponentMidDiv">
            <div className="chatComponentMid">
              {messages.map((msg, index) => {
                console.log("msg: ", msg);
                return (
                  ((msg.from_user == userEmail &&
                    msg.to_user == chattingWithEmail) ||
                    (msg.from_user == chattingWithEmail &&
                      msg.to_user == userEmail)) &&
                  msg.message && (
                    <div
                      key={index}
                      className={`message ${
                        msg.from_user === userEmail
                          ? "sentMessage"
                          : "receivedMessage"
                      }
                  `}
                    >
                      <div className="inMessage">
                        {msg.filetype !== null ? (
                          <div className="sentFile">
                            <FileMsgDiv file={msg} />
                          </div>
                        ) : (
                          <p className="messageContent">{msg.message}</p>
                        )}
                        <p className="messageTime">{msg.time} </p>
                      </div>
                    </div>
                  )
                );
              })}
              <div ref={bottomRef} className="scrollToEnd"></div>
            </div>
            {selFile && (
              <div className="filesToolTip">
                <form encType="multipart/form-data">
                  <label htmlFor="selDocs" className="fileSelDiv">
                    <div className="selFileImg docsImg">
                      <img src={documents} alt="documents" />
                    </div>
                    <p>Documents</p>
                  </label>
                  <input
                    type="file"
                    accept=".pdf, .doc, .docx, .ppt, .pptx, .xls, .xlsx"
                    id="selDocs"
                    style={{
                      display: "none",
                    }}
                    onChange={(e) => {
                      const fileName = e.target.files[0].name;
                      console.log(fileName);
                      const fileType = e.target.files[0].type
                        .split("/")
                        .pop()
                        .split(".")
                        .pop();
                      console.log(fileType);
                      const url = URL.createObjectURL(e.target.files[0]);
                      console.log(url);
                      setFile({
                        file: e.target.files[0],
                        type: fileType,
                        filename: fileName,
                        url: url,
                      });
                      setSelFile(false);
                      setShowPreview(true);
                    }}
                  />

                  <label
                    htmlFor="selGallery"
                    className="fileSelDiv midFilesDiv"
                  >
                    <div className="selFileImg galleryImg">
                      <img src={gallery} alt="gallery" />
                    </div>
                    <p>Photos & Videos</p>
                  </label>
                  <input
                    type="file"
                    accept="image/*, video/*"
                    id="selGallery"
                    style={{
                      display: "none",
                    }}
                    onChange={(e) => {
                      const fileName = e.target.files[0].name;
                      console.log(fileName);
                      const fileType = e.target.files[0].type.split("/")[0];
                      console.log(fileType);
                      //get the url of this image
                      const url = URL.createObjectURL(e.target.files[0]);
                      console.log(url);
                      setFile({
                        file: e.target.files[0],
                        type: fileType,
                        filename: fileName,
                        url: url,
                      });
                      setSelFile(false);
                      setShowPreview(true);
                    }}
                  />

                  <label htmlFor="selAudio" className="fileSelDiv">
                    <div className="selFileImg audioImg">
                      <img src={headphones} alt="headphones" />
                    </div>
                    <p>Audio</p>
                  </label>
                  <input
                    type="file"
                    accept="audio/*"
                    id="selAudio"
                    style={{
                      display: "none",
                    }}
                    onChange={(e) => {
                      //log the file name
                      const fileName = e.target.files[0].name;
                      console.log(fileName);
                      const fileType = e.target.files[0].type.split("/")[0];
                      console.log(fileType);
                      const url = URL.createObjectURL(e.target.files[0]);
                      console.log(url);
                      setFile({
                        file: e.target.files[0],
                        type: fileType,
                        filename: fileName,
                        url: url,
                      });
                      setSelFile(false);
                      setShowPreview(true);
                    }}
                  />
                </form>
              </div>
            )}
          </div>

          <div className="chatComponentBottomDiv">
            {showPreview && (
              <div
                className={`selectedFile ${minimize && "minimizeSelectedFile"}`}
              >
                <p
                  onClick={() => {
                    handleCancelUpload();
                  }}
                  className="closePreview"
                >
                  X
                </p>
                <PreviewDiv
                  file={file}
                  percentage={percentage}
                  uploading={uploading}
                />
              </div>
            )}
            <div className="chatComponentBottom">
              <form onSubmit={handleClick} encType="multipart/form-data">
                <div className="inputMsg">
                  <div
                    onClick={() => {
                      setPercentage(0);
                      setSelFile(!selFile);
                    }}
                    className="attachFile"
                  >
                    <img src={attachFile} alt="Attach File" />
                  </div>
                  <input
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                    }}
                    type="text"
                    placeholder="Type a message..."
                    onKeyDown={handleTyping}
                  />
                  <button type="submit">
                    <img src={send} alt="Send" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      ) : (
        <div className="dashRight">
          <h1>Select a user to chat</h1>
        </div>
      )}
    </div>
  );
}

export default ChatComponent;
