const router = require("express").Router();
const {
  signup,
  login,
  forgetPassword,
  resetPassword,
  updateUserPassword,
  protect,
} = require("../controllers/authController");
const {
  createUser,
  deleteMe,
  getUser,
  getUsers,
  updateMe,
} = require("../controllers/userControllers");

router.route("/forgetPassword").post(forgetPassword);
router.route("/resetPassword/:token").patch(resetPassword);
router.route("/updatePassword").patch(protect, updateUserPassword);
router.route("/updateMe").patch(protect, updateMe);
router.route("/deleteMe").patch(protect, deleteMe);

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/").get(getUsers).post(createUser);

// router.route("/:id").get(getUser).delete(deleteUser);

module.exports = router;
