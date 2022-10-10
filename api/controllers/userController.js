var mongoose = require("mongoose"),
  jwt = require("jsonwebtoken"),
  bcrypt = require("bcrypt"),
  User = mongoose.model("User");
nodemailer = require("nodemailer");
randomstring = require("randomstring");
config = require("../../config/config");

const sendResetPasswordMail = async (name, email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: config.emailUser,
        pass: config.emailPassword,
      },
    });
    const mailOptions = {
      from: config.emailUser,
      to: email,
      subject: "For reset Password",
      html:
        "<p>Hii" +
        name +
        'Please copy the link <a href="http://127.0.0.1:3000/reset-password?token=' +
        token +
        '"> and reset the password</a>',
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Mail has been sent", info.response);
      }
    });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};
//Securing Password
const securePassword = async (req, res, password) => {
  try {
    const passwordHash = await bcrypt.hashSync(password, 10);
    return passwordHash;
  } catch (error) {
    res.status(400).send(error.message);
  }
};
exports.register = function (req, res) {
  var newUser = new User(req.body);
  newUser.hash_password = bcrypt.hashSync(req.body.password, 10);
  newUser.save(function (err, user) {
    if (err) {
      console.log(err);
      return res.status(400).send({
        message: err,
      });
    } else {
      // user.hash_password = undefined;
      return res.json(user);
    }
  });
};

exports.update = async (req, res) => {
  const id = req.params.id;
  console.log(id);
  var newUser = new User(req.body);
  newUser.hash_password = bcrypt.hashSync(req.body.password, 10);
  User.findByIdAndUpdate({ _id: id }, { new: true }, newUser)
    .then(data => {
      console.log(data);
      if (!data) {
        return res.status(404).json({
          message: `Cannot update Employee with id=${id}. Maybe Employee was not found!`,
        });
      } else {
        data.save();
        return res.json({ message: "Employee was updated successfully." });
      }
    })
    .catch(err => {
      console.log(err);
      return res.status(500).send({
        message: "Error updating Tutorial with id=" + id,
      });
    });

  res.status(201).json({
    data:'Sucess'
  })
};
exports.getAll = (req, res) => {
  User.find()
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Employee.",
      });
    });
};
exports.delete = (req, res) => {
  const id = req.params.id;
  User.findByIdAndRemove(id)
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete Employee with id=${id}. Maybe Employee was not found!`,
        });
      } else {
        res.send({
          message: "Employee was deleted successfully!",
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Tutorial with id=" + id,
      });
    });
};

exports.sign_in = function (req, res) {
  User.findOne(
    {
      email: req.body.email,
    },
    function (err, user) {
      if (err) throw err;
      if (!user || !user.comparePassword(req.body.password)) {
        return res.status(401).json({
          message: "Authentication failed. Invalid user or password.",
        });
      }
      let token = jwt.sign(
        { email: user.email, fullName: user.fullName, _id: user._id },
        "RESTFULAPIs"
      );
      return res.json({ token });
    }
  );
};

exports.loginRequired = async function (req, res, next) {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];
  console.log(token);
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, "RESTFULAPIs");
    let user = await User.findOne({ email: decoded.email });
    req.user = user;
  } catch (err) {
    return res.status(401).send(err);
  }
  return next();
};
exports.profile = function (req, res, next) {
  if (req.user) {
    res.send(req.user);
    next();
  } else {
    return res.status(401).json({ message: "Invalid token" });
  }
};
exports.forget_password = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });
    if (userData) {
      const randomString = randomstring.generate();
      const data = await User.updateOne(
        { email: email },
        { $set: { token: randomString } }
      );
      sendResetPasswordMail(userData.username, userData.email, randomString);
      res
        .status(200)
        .send({ success: true, msg: "Please check your mail inbox" });
    } else {
      res.status(200).send({ success: true, msg: "This message does exist" });
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

exports.reset_password = async (req, res) => {
  try {
    const token = req.query.token;
    const tokenData = await User.findOne({ token: token });
    if (tokenData) {
      const password = req.body.password;
      const newPassword = await securePassword(password);
      const userData = await User.findByIdAndUpdate(
        { _id: tokenData._id },
        { $set: { hash_password: newPassword, token: "" } },
        { new: true }
      );
      res.status(200).send({
        success: true,
        msg: "User Password has been reset",
        data: userData,
      });
    } else {
      res
        .status(200)
        .send({ success: true, msg: "This link has been expired" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ success: false, msg: error.message });
  }
};
exports.ascend = async (req, res) => {
  User.find({}, { _id: 0 })
    .sort({ username: 1 })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Employees.",
      });
    });
};
exports.userdata = async (req, res) => {
  try {
    let data = req.body.role;
    console.log(data);
    User.updateMany({}, { $set: { role: data } }).then(() => {
      res.status(200).json({ message: "All user data has been updated" });
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: err.message || "Some error occurred while updating",
    });
  }
};
exports.uploadImg = async (req, res) => {
  try {
    let id = req.params.id;
    console.log(id);
    let img = req.body.profileImage;
    console.log(img);
    User.updateOne({ _id: id }, { $set: { profileImage: img } }).then(() => {
      res.status(200).json({ message: "The profile Image has been updated" });
    });
  } catch (error) {
    res.status(500).send({
      message: err.message || "Some error occurred while updating",
    });
  }
};
