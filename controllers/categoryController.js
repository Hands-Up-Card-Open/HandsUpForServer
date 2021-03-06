const categoryModel = require("../models/categoryModel");
const cardModel = require("../models/cardModel");

async function getAllCategory(req, res){
    var post = req.body;
    var builtinResult = await categoryModel.getBuiltInCategory();
    var customResult = await categoryModel.getCustomCategoryInfo(post.user_id);
    if (!builtinResult || !customResult)
        res.json({"result": "fail"});
    else {
        var categories = JSON.parse(builtinResult);
        var customCategories = JSON.parse(customResult);
        for(cate of customCategories){
            categories.push(cate);
        }
        res.json({"result": "success", "categories": categories});
    }
}

//get built-in categories in JSON format
async function getBuiltInCategory(req, res) {
    var result = await categoryModel.getBuiltInCategory();
    if(!result)
        res.json({"result": "fail"});
    else {
        var categories = JSON.parse(result);
        res.json({"result": "success", "categories": categories});
    }
}

//get all custom category using user_id
async function getCustomCategory(req,res){
    var post = req.body;
    var customResult = await categoryModel.getCustomCategoryInfo(post.user_id);
    if(!customResult)
        res.json({"result": "fail"});
    else {
        var categories = JSON.parse(customResult);
        res.json({"result": "success", "categories": categories});
    }
}

//get public access category
async function getPublicCategory(req,res){
    var post = req.body;
    var result = await categoryModel.getAllPublicCategory(post.user_id);
    if(!result)
        res.json({"result": "fail"});
    else {
        var categories = JSON.parse(result);
        res.json({"result": "success", "categories": categories});
    }
}

//create custom category
async function addCustomCategory(req, res) {
    var post = req.body;
    var sendValue = [post.name, 0]; //send category name and is custom(0)

    //add in category tabel
    var category_id = await categoryModel.insertCategory(sendValue);
    if(!category_id)
        res.json({"result": "fail"});
    else {//add in category_custom_info table
        sendValue = [post.user_id, category_id, post.access];
        var category_custom_id = await categoryModel.insertCustomCategory(sendValue);
        if(!category_custom_id)
            res.json({"result": "fail"});
        else {
            if(post.is_shared){
                var sharedValue = [post.category_custom_id, post.user_id];
                categoryModel.insertSharedCategory(sharedValue);
            }
            res.json({"result": "success", "category_id" : category_id, "category_custom_id": category_custom_id, "category_name" : post.name,
            "category_access" : post.access });
        }
    }
}

// edit category- name, access
async function updateCategory(req, res) {
    var post = req.body;
    var sendValue = [post.name, post.access, post.category_id];
    //update category and category_custom_info table
    var result = await categoryModel.updateCategory(sendValue);
    if(!result)
        res.json({"result": "fail"});
    else
        res.json({"result": "success", "category_id" : post.category_id});
}

// delete category
async function deleteCategory(req, res) {
    var post = req.body;
    //get list of card image path
    var cardImgList = await cardModel.getCardImgList(post.category_id);

    for(sendValue of cardImgList) {
        //check card is shared
        var result = await cardModel.checkCardIsShared(sendValue);
        if(result == null)
            res.json({"result": "fail"});
        else {
            //delete card image
            if(result[0].cnt == 0){
                var path = sendValue[0].split('/huco-bucket/');
                cardModel.deleteImage(path[1]);
            }
        }
    }

    //delete category
    var result = await categoryModel.deleteCategory(post.category_id);
    if(!result)
        res.json({"result": "fail"});
    else
        res.json({"result": "success"});
}

module.exports = {
    getAllCategory,
    getBuiltInCategory,
    getCustomCategory,
    getPublicCategory,
    addCustomCategory,
    updateCategory,
    deleteCategory
}