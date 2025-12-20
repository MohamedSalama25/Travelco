const express = require("express");
const router = express.Router();
const AdvanceController = require("../controllers/AdvanceController");
const auth = require("../middlewares/auth");

router.use(auth);

router.get("/", AdvanceController.getAdvances);
router.post("/", AdvanceController.addAdvance);
router.put("/:id/status", AdvanceController.updateAdvanceStatus);
router.delete("/:id", AdvanceController.deleteAdvance);

module.exports = router;
