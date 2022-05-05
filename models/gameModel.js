require('dotenv').config();
// Imports the Google Cloud client library
const {Translate} = require('@google-cloud/translate').v2;

// Creates a client
const translate = new Translate();

async function translateText(text, target) {
  let [translations] = await translate.translate(text, target);
  translations = Array.isArray(translations) ? translations : [translations];
//   translations.forEach((translation, i) => {
//     console.log(`${text} => (${target}) ${translation}`);
//   });
  return translations;

}

//API Key
const vision = new google.ImageAnnotatorClient({
  keyFilename: "./copper-sol-279910-540b407001cb.json",
});

//OCR
async function ocrText(request) {
  vision
    .textDetection(request)
    .then((results) => {
      const texts = results[0].textAnnotations;

      console.log("Text : ");
      texts.forEach((text) => console.log(text.description));
      })
      .catch((err) => {
        console.error("Error:", err);
      });
}

//Label Detction
async function labelDetect(request) {
  const [result] = await vision.labelDetection(request);
  const labels = result.labelAnnotations;
  console.log('Labels:');
  labels.forEach(label => console.log(label.description));
}

module.exports = {translateText, ocrText, labelDetect}
