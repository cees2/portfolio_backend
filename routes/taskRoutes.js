const express = require("express");

const { protect, restrictTo } = require("./../controllers/authController");

const {
  getUserTasks,
  createTask,
  getTask,
  deleteTask,
} = require("./../controllers/taskController");

const router = express.Router({ mergeParams: true });

router.use(protect);

router.route("/").get(restrictTo("admin"), getUserTasks).post(createTask);
router.route("/:taskId").get(restrictTo("admin"), getTask).delete(deleteTask);

module.exports = router;
