const PORT = process.env.PORT ?? 8000;
const express = require("express");
const app = express();
const pool = require("./db");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

app.use(cors());
app.use(express.json());

// get todos
app.get("/todos/:user_email", async (req, res) => {
  const { user_email } = req.params;
  try {
    const todos = await pool.query(
      "SELECT * FROM todos WHERE user_email = $1",
      [user_email]
    );
    res.json(todos.rows);
  } catch (error) {
    console.log(error);
  }
});

// create a new todo
app.post("/todos", async (req, res) => {
  const { user_email, title, progress, date } = req.body;
  console.log(user_email, title, progress, date);
  const id = uuidv4();
  try {
    const newTodo = await pool.query(
      `INSERT INTO todos(id, user_email, title, progress, date) VALUES($1, $2, $3, $4, $5)`,
      [id, user_email, title, progress, date]
    );

    res.json(newTodo);
  } catch (error) {
    console.error(error);
  }
});

// edit a todo
app.put("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { user_email, title, progress, date } = req.body;
  try {
    const editTodo = await pool.query(
      "UPDATE todos SET user_email = $1, title = $2, progress = $3, date = $4 WHERE id = $5",
      [user_email, title, progress, date, id]
    );

    res.json(editTodo);
  } catch (error) {
    console.error(error);
  }
});

// delete a todo
app.delete("/todos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deleteTodo = await pool.query("DELETE FROM todos WHERE id = $1", [
      id,
    ]);
    res.json(deleteTodo);
  } catch (error) {
    console.error(error);
  }
});

// clear all todos
app.delete("/todos", async (req, res) => {
  try {
    const deleteAllTodo = await pool.query("TRUNCATE todos");
    res.json(deleteAllTodo);
  } catch (error) {
    console.error(error);
  }
});

// signup
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);
  try {
    await pool.query(
      `INSERT INTO users (email, hashed_password) VALUES ($1, $2)`,
      [email, hashedPassword]
    );

    const token = jwt.sign({ email }, "secret", { expiresIn: "1hr" });

    res.json({ email, token });
  } catch (error) {
    console.error(error);
    if (error) {
      res.json({ detail: error.detail });
    }
  }
});

// login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const users = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (!users.rows.length) return res.json({ detail: "User does not exist." });

    const matches = await bcrypt.compare(
      password,
      users.rows[0].hashed_password
    );

    const token = jwt.sign({ email }, "secret", { expiresIn: "1hr" });

    if (matches) {
      res.json({ email: users.rows[0].email, token });
    } else {
      res.json({ detail: "Login failed" });
    }
  } catch (error) {
    console.error(error);
  }
});
app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
