const express = require("express");
const router = express.Router();
const controller = require("../controller/main");

router.get("/hello", controller.greetVisitor);

module.exports = router;
