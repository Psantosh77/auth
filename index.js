const express = require("express");
const app = express();
const PORT = process.env.PORT || 7070;
const mongoose = require("mongoose");
const User = require("./User");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const CorsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

// database connection
const url = `mongodb+srv://material_library:ML123@cluster0.jh0wv.mongodb.net/material_library?retryWrites=true&w=majority`;
const connectionParams = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
};

mongoose
  .connect(url, connectionParams)
  .then(() => {
    console.log("Connected to database ");
  })
  .catch((err) => {
    console.error(`Error connecting to the database. \n${err}`);
  });
//database connection

app.use(express.json());

app.use(cors(CorsOptions.AllowAll));

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ message: "User doesn't exist" });
  } else {
    if (password !== user.password) {
      return res.json({ message: "Password Incorrect" });
    }
    const payload = {
      email,
      name: user.name,
    };
    jwt.sign(payload, "secret", (err, token) => {
      if (err) console.log(err);
      else return res.json({ token: token });
    });
  }
});

app.post("/auth/register", async (req, res) => {
  const { email, password, name, username, cpassword } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.json({ message: "User already exists" });
  } else if (password !== cpassword) {
    return res.json({ message: "password s didn't match" });
  } else {
    const newUser = new User({
      email,
      name,
      password,
      username,
    });
    newUser.save();
    return res.json(newUser);
  }
});


if(process.env.NODE_ENV == "production")
app.use(express.static("MLDEV/build"))


app.listen(PORT, () => {
  console.log(`Auth-Service at ${PORT}`);
});
