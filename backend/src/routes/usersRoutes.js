const express = require("express");
const router = express.Router();
const UsersControllers = require("../controllers/usersController");

router.get("/", UsersControllers.getUsers);
router.get("/:id", UsersControllers.getUserById);
router.post("/", UsersControllers.addUser);
router.put("/:id", UsersControllers.updateUser);
router.delete("/:id", UsersControllers.deleteUser);

module.exports = router;
