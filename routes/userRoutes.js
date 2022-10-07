const express = require("express");
const taskRouter = require("./taskRoutes");

const {
  login,
  signup,
  protect,
  restrictTo,
} = require("../controllers/authController");

const {
  getUser,
  getAllUsers,
  updateUser,
  deleteUser,
  getMyTasks,
  deleteMe,
  changeMyPassword,
  changeMyEmail,
} = require("../controllers/userController");

const router = express.Router();

router.use("/:userId/tasks", taskRouter);

router.route("/login").post(login);
router.route("/signup").post(signup);

router.use(protect);

router.get("/getMyTasks", getMyTasks);
router.delete("/deleteMe", deleteMe);
router.patch("/changeMyEmail", changeMyEmail);
router.patch("/changeMyPassword", changeMyPassword);

router.use(restrictTo("admin"));

router.route("/:userId").get(getUser).post(updateUser).delete(deleteUser);
router.route("/").get(getAllUsers);

module.exports = router;
