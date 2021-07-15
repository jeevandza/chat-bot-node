//calling express 
const express = require('express');
const app = express();
const dfff = require('dialogflow-fulfillment');
const { response } = require('express');
const dialogflow = require('dialogflow');
const uuid = require('uuid');

const path = require('path')

const projectId = 'noyalbot-p9ii'

const textToSpeech = require('@google-cloud/text-to-speech');

const fs = require('fs');
const util = require('util');

const client = new textToSpeech.TextToSpeechClient({
    keyFilename: require("path").join('./noyalbot-p9ii-0dc8295201bc.json')
});





//send the request
app.get('/', (req,res) =>{
  res.send('wer are live')
}) ;
app.post('/', express.json(), async (req,res) =>{
    const sessionId = uuid.v4();
    const sessionClient = new dialogflow.SessionsClient({
        keyFilename: require("path").join('./noyalbot-p9ii-0dc8295201bc.json')
    });
    const sessionPath = sessionClient.sessionPath(projectId, sessionId);
    const requestToDialogflow = {
        session: sessionPath,
        queryInput: {
          text: {
            // The query to send to the dialogflow agent
            text: req.body.message,
            // The language used by the client (en-US)
            languageCode: 'en-US',
          },
        },
      };

      

    const responses = await sessionClient.detectIntent(requestToDialogflow);



    const requestTexttoSpeech = {
        input: {text: responses[0].queryResult.fulfillmentText},
        // Select the language and SSML voice gender (optional)
        voice: {languageCode: 'en-US', ssmlGender: 'NEUTRAL'},
        // select the type of audio encoding
        audioConfig: {audioEncoding: 'MP3'},
    };
    const [responseTexttoSpeech] = await client.synthesizeSpeech(requestTexttoSpeech);

    const writeFile = util.promisify(fs.writeFile);
    await writeFile('public/output' + sessionId + '.mp3', responseTexttoSpeech.audioContent, 'binary');

    res.send({
        reply: responses[0].queryResult.fulfillmentText,
        filename: 'output' + sessionId + '.mp3' 
    });

    // var options = {
    //     headers: {
    //         'x-timestamp': Date.now(),
    //         'x-sent': true,
    //         'name': 'MattDionis',
    //         'origin':'stackoverflow' 
    //     }
    //   };
    
    // res.sendFile(path.join(__dirname, '/', 'output.mp3'), options);


});

app.use(express.static (__dirname + "/public"));
//listen in the port 
app.listen(3333, () =>{
    console.log('server is live at port ')
});