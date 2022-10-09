const UrlModel = require("../models/urlModel");
const shortid = require("shortid");
const redis = require("redis");
const {promisify} = require("util"); //node-modules
const axios = require('axios')

//========================REDIS IMPLEMENTATION===========================>>>

const redisClient = redis.createClient(
  17226, //port
  "redis-17226.c264.ap-south-1-1.ec2.cloud.redislabs.com", //region
  { no_ready_check: true }
);
redisClient.auth("jzCWtKTxipzd6KhMeLwnTkSljdJBaLrB", function (err) { //credentials
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis");
});
const SET_ASYNC = promisify(redisClient.SET).bind(redisClient); //it binds the redis instance to specific interface (hence, IP Address)
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);  

//==================================create-api===========================>>>

const shortUrl = async (req, res) =>{
  try {
    const longUrl = req.body.longUrl;

    if (!longUrl)
      return res.status(400).send({status: false,message: "Long URL should be present in the request body"});
      
//----validation for correct url--->>>
    let urlFound = false;
    let Url = {
      method:"get",
      url:longUrl,
    };

    await axios(Url)
      .then((res) => {
        if (res.status == 201 || res.status == 200) urlFound = true;
      })
      .catch((err) => {console.log(err)});

    if (urlFound == false) {
      return res.status(400).send({ status: false, message: "Invalid URL" });
    }

    let urldata = await GET_ASYNC(`${longUrl}`);
    let data = JSON.parse(urldata);

    if (data)
      return res.status(200).send({status: true,message: `URL is already shortened`,
data: data});

    let urlExist = await UrlModel.findOne({longUrl});
    if (urlExist) {
      await SET_ASYNC(`${longUrl}`, JSON.stringify(urlExist));
      return res.status(401).send({ status: false, message: "URL is already shortened" });
    }

    let urlCode = shortid.generate();
    let shortUrl = `${req.protocol}://${req.headers.host}/`+urlCode;

    let result = {longUrl:longUrl,shortUrl:shortUrl,urlCode:urlCode};

    await UrlModel.create(result);
    return res.status(201).send({ status: true, message: "Created", data: result });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

//==================================get-api==============================>>>

const getUrl = async (req, res) =>{
  try {
    let urlCode = req.params.urlCode;
    let urldata = await GET_ASYNC(`${urlCode}`);

    let data = JSON.parse(urldata);
    if (data) {
     console.log("from redis")
      return res.status(302).redirect(data.longUrl);}

    const getPage = await UrlModel.findOne({ urlCode: urlCode });
    if (getPage) {
      console.log('from mongodb')
      await SET_ASYNC(`${urlCode}`, JSON.stringify(getPage));
      return res.status(302).redirect(getPage.longUrl);
    }

    return res.status(404).send({ status: false, message: "urlCode does not exist" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ status: false, Error: err.message });
  }
};

module.exports = {shortUrl,getUrl};
