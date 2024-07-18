import express from "express";
import pg from "pg";
import bcrypt from "bcrypt";
import env from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { createServer } from "http";

env.config();

const app = express();
const port = 3000;
const saltRounds = 10;
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

const pool = new pg.Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

let users = [];
let typingUsers = [];

io.on("connection", (socket) => {
  console.log("Socket on server connected: ", socket.id);

  socket.on("send-private-message", async (msg) => {
    //add this msg to db
    console.log("msg to be added", msg);
    const { message, from_user, to_user, time, filetype, filename } = msg;
    try {
      await pool.query(
        "INSERT INTO chats (message, from_user, to_user, time, filetype, filename) VALUES ($1, $2, $3, $4, $5, $6)",
        [message, from_user, to_user, time, filetype, filename]
      );
    } catch (error) {
      console.log("error saving in db");
    }

    io.to(from_user).to(to_user).emit("received-private-msg", msg);
  });

  socket.on("typing", (data) => {
    console.log(data.email, "is typing");
    typingUsers.push(data);

    //get socket id of msg.to_user from users array if online
    const toUser = users.find((user) => user.email === data.chattingWithEmail);
    const toUserID = toUser ? toUser.id : null;
    io.to(toUserID).emit("typing", typingUsers);
  });

  socket.on("not-typing", (data) => {
    console.log(data.email, "is not typing");
    typingUsers = typingUsers.filter((user) => user.email !== data.email);
    io.emit("typing", typingUsers);
  });

  socket.on("user-connected", (user) => {
    socket.join(user.email);
    users.push(user);
    console.log("active users: ", users);
    io.emit("active-users", users);
  });

  socket.on("disconnect", () => {
    console.log("disconnected with id:", socket.id);

    //get the email of the disconnected user
    const disconnectedUser = users.find((user) => user.id === socket.id);
    console.log("disconnected user: ", disconnectedUser);

    //get current time
    const time = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

    console.log("disconnected at: ", time);

    //add this time to lastSeen column in users table
    pool.query(
      "UPDATE users SET lastseen = $1 WHERE email = $2",
      [time, disconnectedUser?.email || null],
      (err, res) => {
        if (err) {
          console.error("Error updating lastseen: ", err);
        }
      }
    );

    users = users.filter((user) => user.id !== socket.id);
    console.log("active users: ", users);
    io.emit("active-users", users);
  });
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/get-contacts", async (req, res) => {
  try {
    const { email } = req.query;
    const response = await pool.query(
      "SELECT email, name, lastSeen FROM users WHERE email != $1",
      [email]
    );
    res.send(response.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/verifyUser", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const { user } = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log("JWTUser: ", user);
    const response = await pool.query("SELECT * FROM users WHERE id = $1", [
      user,
    ]);
    res.send(response.rows[0]);
  } catch (err) {
    // console.error("Error aa gya: ", err.JsonWebTokenError);
    return res.status(500).send("Internal Server Error");
  }
});

app.get("/get-chats", async (req, res) => {
  try {
    const { user1, user2 } = req.query;
    const response = await pool.query(
      "SELECT * FROM chats WHERE (from_user = $1 AND to_user = $2) OR (from_user = $2 AND to_user = $1)",
      [user1, user2]
    );
    res.send(response.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  console.log(name, email, password);

  try {
    //check if all required fields are filled
    if (!name || !email || !password) {
      return res.status(400).send("Name, email and password are required");
    }

    //check if user exists
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length > 0) {
      return res.status(400).send("User already exists");
    }

    //hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const response = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
      [name, email, hashedPassword]
    );
    res.send(response.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    //check if all required fields are filled
    if (!email || !password) {
      return res.status(400).send("Email and password are required");
    }

    //check if user exists
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length === 0) {
      return res.status(400).send("User does not exist");
    }

    //check if password is correct
    const match = await bcrypt.compare(password, user.rows[0].password);
    if (!match) {
      return res.status(400).send("Password is incorrect");
    }

    //generate token
    const token = jwt.sign(
      { user: user.rows[0].id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    res.send({ user: user.rows[0], token });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/editProfile", async (req, res) => {
  const { userEmail, newName } = req.query;

  try {
    const response = await pool.query(
      "UPDATE users SET name = $1 WHERE email = $2 RETURNING *",
      [newName, userEmail]
    );
    res.send(response.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
