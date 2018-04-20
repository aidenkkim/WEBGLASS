// Imports the Google Cloud client library
const vision = require('@google-cloud/vision');

// Creates a client
const client = new vision.ImageAnnotatorClient({
    keyFilename : './visionAPI_KEY.json'
});



// Performs label detection on the image file
client.textDetection('http://gdimg.gmarket.co.kr/907079439/still/80').then(results => {
    console.log(results[0].fullTextAnnotation.text);
}).catch(err => {
    console.error(err);
});



/*

.documentTextDetection('./template_code/test.jpg')
    .then(results => {
        const labels = results[0].labelAnnotations;

        console.log('Labels:');
        labels.forEach(label => console.log(label.description));
    })
    .catch(err => {
        console.error('ERROR:', err);
    });*/
