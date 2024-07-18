import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";

const UserContext = createContext();

const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(localStorage.getItem("user"));
  const [chattingWith, setChattingWith] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [editProfile, setEditProfile] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selContactMobile, setSelContactMobile] = useState(true);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", user);
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const UserContextValue = useMemo(
    () => ({
      user,
      setUser,
      chattingWith,
      setChattingWith,
      typingUsers,
      setTypingUsers,
      editProfile,
      setEditProfile,
      activeUsers,
      setActiveUsers,
      contacts,
      setContacts,
      selContactMobile,
      setSelContactMobile,
    }),
    [
      user,
      setUser,
      chattingWith,
      setChattingWith,
      typingUsers,
      setTypingUsers,
      editProfile,
      setEditProfile,
      activeUsers,
      setActiveUsers,
      contacts,
      setContacts,
      selContactMobile,
      setSelContactMobile,
    ]
  );

  return (
    <UserContext.Provider value={UserContextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};

export default UserContextProvider;
