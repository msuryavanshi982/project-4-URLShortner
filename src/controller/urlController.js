const shortId = require("shortid");
const validUrl = require("is-valid-http-url");
const urlModel = require("../model/urlModel");
const redis = require("redis");
const { promisify } = require("util");

const isValid = (value) => {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};

//---Redis connection & functions ------------>>>

const redisClient = redis.createClient(
  18517, // port number
  "redis-18517.c264.ap-south-1-1.ec2.cloud.redislabs.com", //ip address
  { no_ready_check: true }
);

redisClient.auth("9JKnY6jY9JA0jCD3K3VJHzi4hAEtiRoA", (err) => {
  // password -- Authentication
  if (err) throw err;
});

redisClient.on("connect", () => {
  console.log("connected to Redis..");
});

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

//--------create shorten url------->>>

const createShortUrl = async (req, res) => {
  try {
    const data = req.body;

    if (Object.keys(data).length === 0) {
      return res.status(400).send({ status: false, message: "required data" });
    }
    if (!Object.keys(data).includes("longUrl")) {
      return res
        .status(400)
        .send({ status: false, message: "required longUrl" });
    }
    if (!isValid(data.longUrl)) {
      return res
        .status(400)
        .send({ status: false, message: "long url must be in string" });
    }
    if (!validUrl(data.longUrl)) {
      return res
        .status(400)
        .send({ status: false, message: "invalid long url" });
    }
    let cachedUrlData = await GET_ASYNC(data.longUrl); //cache call

    if (cachedUrlData) {
      let object = JSON.parse(cachedUrlData);

      return res
        .status(200)
        .send({ status: true, message: "already exist", data: object });
    } else {
      let urlData = await urlModel
        .findOne({ longUrl: data.longUrl })
        .select({ longUrl: 1, shortUrl: 1, urlCode: 1, _id: 0 });
      if (urlData) {
        await SET_ASYNC(`${data.longUrl}`, JSON.stringify(urlData));

        return res
          .status(200)
          .send({ staus: true, message: "already exist", data: urlData });
      }
    }

    let port = req.get("host");
    console.log(port);

    let baseUrl = `http://${port}/`;

    data.urlCode = shortId.generate().toLocaleLowerCase();
    data.shortUrl = baseUrl + data.urlCode;

    await urlModel.create(data);

    let urlData = await urlModel
      .findOne({ longUrl: data.longUrl })
      .select({ _id: 0, longUrl: 1, shortUrl: 1, urlCode: 1 });

    return res.status(200).send({ status: true, data: urlData });
  } catch (err) {
    return res.status(500).send({ status: true, message: err });
  }
};

//--------Redirect to the original URL------->>>

const fetchUrl = async function (req, res) {
  try {
    const urlCode = req.params.urlCode;

    //checking is it valid short url or not
    if (!shortId.isValid(urlCode)) {
      return res
        .status(400)
        .send({ status: false, message: "short url is in valid" });
    }

    let cacheUrlData = await GET_ASYNC(urlCode); // catch call

    if (cacheUrlData) {
      let object = JSON.parse(cacheUrlData); // converts string to obj

      return res.status(302).redirect(object.longUrl);
    } else {
      let urlData = await urlModel.findOne({ urlCode: urlCode });

      if (!urlData) {
        return res.status(404).send({ status: false, message: "No URL Found" });
      }
      await SET_ASYNC(`${urlCode}`, JSON.stringify(urlData));

      return res.status(302).redirect(urlData.longUrl);
    }
  } catch (err) {
    res.status(500).send({ msg: err.message });
  }
};


module.exports = { createShortUrl, fetchUrl };
