const Url = require("../models/urlModel");
const validUrl = require("valid-url");
const shortid = require("shortid");

//==================================create-api===========================>>>

const baseUrl = "http:localhost:5000";
const shortUrl = async (req, res) => {
  const { longUrl } = req.body;

  if (!validUrl.isUri(baseUrl)) {
    return res.status(401).json("Invalid base URL");
  }

  const urlCode = shortid.generate();

  if (validUrl.isUri(longUrl)) {
    try {
      let url = await Url.findOne({ longUrl });

      if (url) {
        res.json(url);
      } else {
        const shortUrl = baseUrl + "/" + urlCode;

        url = new Url({ longUrl, shortUrl, urlCode });
        await url.save();
        res.json(url);
      }
    } catch (err) {
      console.log(err);
      res.status(500).json("Server Error");
    }
  } else {
    res.status(401).json("Invalid longUrl");
  }
};

//==================================get-api==============================>>>

const getUrl = async (req, res) => {
  try {
    let id = req.params.urlCode
    // console.log("id")
    // console.log(id)
    const url = await Url.findOne({ urlCode:id });
    console.log(url);
    if(!url){
       return res.send("Eroor")
    }
   return res.send(url)
  } catch (err) {
    console.error(err);
    res.status(500).json("Server Error");
  }
};

module.exports = { shortUrl, getUrl };
