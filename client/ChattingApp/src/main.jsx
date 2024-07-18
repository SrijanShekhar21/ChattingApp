import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import AuthContextProvider from "./contexts/AuthContext.jsx";
import UserContextProvider from "./contexts/UserContext.jsx";
import ChatsContextProvider from "./contexts/chatsContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <AuthContextProvider>
      <UserContextProvider>
        <ChatsContextProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ChatsContextProvider>
      </UserContextProvider>
    </AuthContextProvider>
  </>
);
