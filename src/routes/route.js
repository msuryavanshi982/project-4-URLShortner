const express = require("express");
const router = express.Router();
const urlController = require("../controllers/urlController");

//============================post api for shorten url===================>>>
router.post("/url/shorten", urlController.shortUrl);

//============================get api for redirect url===================>>>
router.get("/:urlCode", urlController.getUrl);

//=====This API is used for handling any invalid Endpoints=====>>>>>
router.all("/*", async function (req, res) {
  res.status(404).send({ status: false, msg: "Page Not Found!!!" });
});

module.exports = router;
