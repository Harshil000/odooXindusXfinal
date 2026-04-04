const router = require("express").Router();
const ctrl = require("../controllers/floor.controller");

router.post("/", ctrl.createFloor);
router.get("/", ctrl.getFloors);
router.get("/:id", ctrl.getFloorById);
router.put("/:id", ctrl.updateFloor);
router.delete("/:id", ctrl.deleteFloor);

module.exports = router;