const Url = require("../models/urlModel");
const validUrl = require("valid-url");
const shortid = require("shortid");

//-------------------url Validation--------------------------->>
const isEmpty = function (url) {
  if (typeof url === "undefined" || url === null) return false;
  if (typeof url === "string" && url.trim().length === 0) return false;
  return true;
};

//==================================create-api===========================>>>

const baseUrl = "http:localhost:3000";

const shortUrl = async (req, res) => {
  try{
  const { longUrl } = req.body;

  if (Object.keys(longUrl).length == 0) {
    return res.status(400).send({ status: false, message: "Please provide long url in request body" });
}

  if (!validUrl.isUri(baseUrl)) {
    return res.status(401).send({status:false, message:"Invalid base URL"});
  }

  if (!isEmpty(longUrl)) {
    return res.status(400).send({ status: false, message: "Please provide long url" });
}
const urlCode = shortid.generate();

  if (validUrl.isUri(longUrl)) {
    
      let url = await Url.findOne({ longUrl });

      if (url) {
        res.send(url);
      } else {
        const shortUrl = baseUrl + "/" + urlCode;

        url = new Url({ longUrl, shortUrl, urlCode });
        await url.save();
        res.json(url);
      }
    
  } else {
    res.status(401).send({status:false, message: "Invalid longUrl"});
  }
}catch (err) {
  res.status(500).send({status:false, message: err.message});
}
};

//==================================get-api==============================>>>

const getUrl = async (req, res) => {
  try {
    let id = req.params.urlCode

    const url = await Url.findOne({ urlCode:id });

    if(!url){
       return res.send("Eroor")
    }
   return res.status(302).redirect(url.longUrl)
  } catch (err) {
    console.error(err);
    res.status(500).json("Server Error");
  }
};

module.exports = { shortUrl, getUrl };
