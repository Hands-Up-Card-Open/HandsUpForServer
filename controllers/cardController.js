const cardModel = require("../models/cardModel");

//get all cards using category_id and user_id
async function getCard(req,res){
    var post = req.body;
    var sendValue = [post.category_id, post.user_id];
    var result = await cardModel.getCards(sendValue);
    if(!result)
        res.json({"result": "fail"});
    else {
        var cards = JSON.parse(result);
        res.json({"result": "success", "cards": cards});
    }
}

//get all category's cards using user_id
async function getAllCard(req,res){
    var post = req.body;
    var result = await cardModel.getAllCardUsingUserID(post.user_id);
    if(!result)
        res.json({"result": "fail"});
    else {
        var cards = JSON.parse(result);
        res.json({"result": "success", "cards": cards});
    }
}

//get built-in cards using category_id
async function getBuiltInCard(req, res) {
    var post = req.body;
    var result = await cardModel.getBuiltInCards(post.category_id);
    if(!result)
        res.json({"result": "fail"});
    else {
        var cards = JSON.parse(result);
        res.json({"result": "success", "cards": cards});
    }
}

//get custom cards using category_id and user_id
async function getCustomCard(req,res){
    var post = req.body;
    var sendValue = [post.category_id, post.user_id];
    var result = await cardModel.getCustomCardsUsingUserId(sendValue);
    if(!result)
        res.json({"result": "fail"});
    else {
        var cards = JSON.parse(result);
        res.json({"result": "success", "cards": cards});
    }
}

async function getPublicCustomCard(req,res){
    var post = req.body;
    var result = await cardModel.getCustomCards(post.category_id);
    if(!result)
        res.json({"result": "fail"});
    else {
        var cards = JSON.parse(result);
        res.json({"result": "success", "cards": cards});
    }
}

//create custom card
async function addCustomCard(req, res) {
    var post = req.body;
    var img_path = "";
    if(post.is_new){
        // upload image in storage
        const curTime = await cardModel.uploadFile(post.name, post.img_path, post.user_id);
        if(!curTime)
           res.json({"result": "fail"});
        else{
            img_path = "https://storage.googleapis.com/huco-bucket/cardImage/" + post.user_id + "/" + curTime + "_" + post.name +".png"
            addCard(req,res, img_path);            
        }
    }else{
        img_path = post.img_path;
        addCard(req,res, img_path);  
    }
}

async function addCard(req,res, img_path){
    var post = req.body;
    var sendValue = [post.category_id, post.name, img_path, 0]; //send category id, card name, card image path and is custom(0)
    // add in card table
    var card_id = await cardModel.insertCard(sendValue);

    if (!card_id) res.json({ result: "fail" });
    //add in card_custom_info table
    else {
        sendValue = [post.user_id, card_id];
        var card_custom_id = await cardModel.insertCustomCard(sendValue);
        if (!card_custom_id) res.json({ result: "fail" });
        else {
            res.json({
            result: "success",
            card_id: card_id,
            card_name: post.name,
            card_img_path: post.img_path,
        });
    }
    }
}

// edit card - name, image path, category id
async function updateCard(req, res) {
    var post = req.body;
    var isImgNull = false;
    var curTime = '';
    var img_path = '';
    var sendValue = [];

    //if img_path is null, change name and category only
    if(!post.img_path){
        isImgNull = true;
        sendValue = [post.name, post.category_id, post.card_id];
    }
    //is img_path exist, upload image
    else{
        curTime = await cardModel.uploadFile(post.name, post.img_path, post.user_id);
        img_path = "https://storage.googleapis.com/huco-bucket/cardImage/" + post.user_id + "/" + curTime + "_" + post.name +".png";
        sendValue = [post.name, img_path, post.category_id, post.card_id];
    }

    if(!curTime && !isImgNull)
        res.json({"result": "fail"});
    else{
        //update card and card_custom_info table
        var result = await cardModel.updateCard(sendValue, isImgNull);
        if(!result)
            res.json({"result": "fail"});
        else
            res.json({"result": "success", "card_id" : post.card_id});
    }
}

//check card is shared by image path
async function checkCardIsShared(req, res) {
    var post = req.body;
    var sendValue = [post.img_path, post.card_id] 
    var result = await cardModel.checkCardIsShared(sendValue);
    if(result == null)
        res.json({"result": "fail"});
    else {
        if(result[0].cnt == 0)
            deleteImage(req, res);
        else
            deleteCard(req, res);
    }
}

async function deleteImage(req, res) {
    var post = req.body;
    var img_path = post.img_path;
    var path = img_path.split('/huco-bucket/');
    var result = await cardModel.deleteImage(path[1]);
    if(result)
        deleteCard(req, res);
    else
        res.json({"result": "fail"});
}

//delete card
async function deleteCard(req, res) {
    var post = req.body;
    var result = await cardModel.deleteCard(post.card_id);
    if(!result)
        res.json({"result": "fail"});
    else
        res.json({"result": "success"});
}


module.exports = {
    getCard,
    getAllCard,
    getBuiltInCard,
    getCustomCard,
    getPublicCustomCard,
    addCustomCard,
    updateCard,
    checkCardIsShared,
    deleteCard,
    deleteImage
}
