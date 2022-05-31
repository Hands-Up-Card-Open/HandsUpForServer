var express = require('express');
var router = express.Router();
var cardController = require('../controllers/cardController');

//get all cards
router.post('/', cardController.getCard);

//get built-in cards
router.post('/built-in', cardController.getBuiltInCard);

//get custom cards
router.post('/custom', cardController.getCustomCard);

// get public custom cards
router.post('/custom/public',cardController.getPublicCustomCard);

//create custom card
router.post('/create', cardController.addCustomCard);

//edit card
router.post('/update', cardController.updateCard);

//delete card
router.delete('/delete', cardController.deleteCard);

module.exports = router;