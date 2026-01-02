const express = require("express");
const app = express();
const { UserModel, TodoModel } = require("./db");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");
const JWt_SECRET = "mysecretkey";
mongoose.connect(
);

app.use(express.json());
app.post("/signup", async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  await UserModel.create({
    name: name,
    email: email,
    password: password,
  });
  // Signup logic here
  res.send("User signed up");
});
app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);

  const user = await UserModel.findOne({
    email,
    password,
  });
  console.log(user);
  if (user) {
    const token = jwt.sign(
      {
        id: user._id.toString(),
      },
      JWt_SECRET
    );
    // Signin logic here
    res.send({
      token: token,
    });
  } else {
    return res.status(403).send("Invalid credentials");
  }
});
const auth = (req, res, next) => {
  const token = req.headers.token;
  const response = jwt.verify(token, JWt_SECRET);
  if (response) {
    req.userId = response._id;
    next();
  } else {
    res.status(403).send("Unauthorized access");
  }
};
app.post("/todo", auth, (req, res) => {
  // Add Todos logic here
  const { userId, title, completed } = req.body;
  TodoModel.create({
    _Id: userId,
    title: title,
    completed: completed,
  });
  res.send("todos added");
});
app.get("/todos", auth, async (req, res) => {
  // Todo
  const userId = req._Id;
  try {
    const todos = await TodoModel.find({
      _Id: userId,
    });
    res.json(todos);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
