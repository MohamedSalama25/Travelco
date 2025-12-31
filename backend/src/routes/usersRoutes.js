const express = require("express");
const router = express.Router();
const UsersControllers = require("../controllers/usersController");
const authRole = require("../middlewares/authRole");

router.get("/", authRole("admin"), UsersControllers.getUsers);
router.get("/:id", UsersControllers.getUserById);
router.post("/", authRole("admin"), UsersControllers.addUser);
router.put("/:id", authRole("admin"), UsersControllers.updateUser);
router.delete("/:id", authRole("admin"), UsersControllers.deleteUser);

module.exports = router;
