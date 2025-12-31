const express = require("express");
const router = express.Router();
const AdvanceController = require("../controllers/AdvanceController");
const auth = require("../middlewares/auth");
const authRole = require("../middlewares/authRole");

router.use(auth);

router.get("/", authRole("admin"), AdvanceController.getAdvances);
router.get("/stats", authRole("admin"), AdvanceController.getAdvanceStats);
router.post("/", AdvanceController.addAdvance);
router.put("/:id/status", authRole("admin"), AdvanceController.updateAdvanceStatus);
router.put("/:id/repay", authRole("admin"), AdvanceController.repayAdvance);
router.delete("/:id", authRole("admin"), AdvanceController.deleteAdvance);

module.exports = router;
