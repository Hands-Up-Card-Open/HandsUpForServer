require('dotenv').config();
const axios = require('axios');
const gameModel = require("../models/gameModel");

async function getSimilarityResult(translated, req, res){
    var post = req.body;
    let result = await axios({
        method: "post",
        url: process.env.OPEN_API_URL,
        data: {
            'access_key': process.env.ACCESS_KEY,
            'argument': {
                'first_word': post.answer,
                'second_word': translated,
            }
        },
        headers: {
            "Content-Type": "application/json",
            "charset": "UTF-8"
        }

    }).then((response) => {
        simarilty = response.data.return_object["WWN WordRelInfo"].WordRelInfo.Similarity[0].SimScore;
        if(!response.data.result){
            if(simarilty > 0.8)
                res.json({"result": "success", "correct" : true});
            else
            res.json({"result": "success", "correct" : false});
        }else{
            res.json({"result": "fail"});
        }
    }).catch((error) => {
        console.log(error);
    });

    return result;
}

async function getGameResult(req,res){
    var post = req.body;
    gameModel.translateText(post.result,"ko").then(function(result){
        console.log(result[0]);
        getSimilarityResult(result[0],req,res);
    });
}

//OCR
async function getOCRResult(req,res){
  var post = req.body;
  var img = post.base64;
  let buf = Buffer.from(img, 'base64');

  gameModel.ocrText(buf).then(function(result){
      console.log(result);
    });
}

//Label Detection
async function getLabelResult(req,res){
  var post = req.body;
  var img = post.base64;
  let buf = Buffer.from(img, 'base64');

  gameModel.labelDetect(buf).then(function(result){
      console.log(result);
    });
}

module.exports = {getGameResult, getOCRResult, getLabelResult}
