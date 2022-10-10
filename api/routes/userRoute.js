module.exports = function (app) {
  var userHandlers = require("../controllers/userController.js");
  // todoList Routes
  //Login using authenticated token
  app.route("/me").post(userHandlers.loginRequired, userHandlers.profile);
  // Getting all users
  app.route("/auth/getall").get(userHandlers.getAll);
  //Regsitering the employee
  app.route("/auth/register").post(userHandlers.register);
  //Sign in using authentication
  app.route("/auth/sign_in").post(userHandlers.sign_in);
  // Delete the employee
  app.route("/delete/:id").delete(userHandlers.delete);
  // Update a particular employee
  app.route("/update/:id").put(userHandlers.update);
  // Forgetting the password
  app.route("/forget-password").post(userHandlers.forget_password);
  // Restting the password
  app.route("/reset-password").get(userHandlers.reset_password);
  // Displaying the users in alplabetic order username
  app.route("/ascend-order").get(userHandlers.ascend);
  //Updating the role of all users
  app.route("/user-data").patch(userHandlers.userdata);
  // Uplaoding the image of a particular employee.
  app.route("/image-upload/:id").patch(userHandlers.uploadImg);
};
