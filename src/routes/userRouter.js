const router = require("express").Router();
const {
  signup,
  login,
  forgetPassword,
  resetPassword,
} = require("../controllers/authController");
const {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} = require("../controllers/userControllers");

router.route("/forgetPassword").post(forgetPassword);
router.route("/resetPassword/:token").patch(resetPassword);

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/").get(getUsers).post(createUser);

router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
