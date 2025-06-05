const express = require('express');
const router = express.Router();

const isAuth = require("../middleware/authMiddleware");
const {createRoom, getRooms, getRoomByCode, joinRoom, leaveRoom} = require("../controllers/room");


router.post("/",isAuth ,createRoom);
router.get("/",isAuth ,getRooms);
router.get("/:roomCode",isAuth ,getRoomByCode);
router.patch("/:roomCode/join",isAuth ,joinRoom);
router.patch("/:roomCode/leave",isAuth ,leaveRoom);



module.exports = router;