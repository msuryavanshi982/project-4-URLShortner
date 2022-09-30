const Url = require("../models/urlModel");
const validUrl = require("valid-url");
const shortid = require("shortid");
const { isEmpty } = require("../validators/validators");
const baseUrl = "http:localhost:3000";

//==================================create-api===========================>>>

const shortUrl = async (req, res) => {
  try {
    const { longUrl } = req.body;

    if (!validUrl.isUri(baseUrl))
      return res
        .status(401)
        .send({ status: false, message: "Invalid base URL" });

    if (!longUrl)
      return res.status(401).send({
        status: false,
        message: "Long URL should be present in the request body",
      });

    if (!validUrl.isUri(longUrl))
      return res
        .status(401)
        .send({ status: false, message: "Invalid base URL" });

    let urlExist = await Url.findOne({ longUrl });
    if (urlExist)
      return res
        .status(401)
        .send({ status: false, message: "URL is already shortened" });

    const urlCode = shortid.generate();
    const shortUrl = baseUrl + "/" + urlCode;

    urlExist = new Url({ longUrl, shortUrl, urlCode });
    await urlExist.save();
    res.json(urlExist);

  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

//==================================get-api==============================>>>

const getUrl = async (req, res) => {
  try {
    let id = req.params.urlCode;

    const url = await Url.findOne({ urlCode: id });

    if (!url) {
      return res.send("Eroor");
    }
    return res.status(302).redirect(url.longUrl);
  } catch (err) {
    console.error(err);
    res.status(500).json("Server Error");
  }
};

module.exports = { shortUrl, getUrl };
