const router = require("express").Router();
const ctrl = require("../controllers/session.controller");

router.post("/", ctrl.createSession);
router.get("/active/:restaurant_id", ctrl.getActiveSession);
router.put("/:id", ctrl.updateSession);
router.get("/:restaurant_id", ctrl.getAllSessions);

module.exports = router;