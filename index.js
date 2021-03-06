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
const { diffieHellman } = require('crypto');

const client = new textToSpeech.TextToSpeechClient({
    keyFilename: require("path").join('./noyalbot-p9ii-0dc8295201bc.json')
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});



// send the request
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
    

    console.log('responses', responses[0].queryResult.webhookPayload);



    const requestTexttoSpeech = {
        input: {text: responses[0].queryResult.fulfillmentText},
        // Select the language and SSML voice gender (optional)
        voice: {languageCode: 'en-UK', ssmlGender: 'MALE'},
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


app.post('/news', express.json(), (req, res)=>{
  const agent = new dfff.WebhookClient({
      request:req,
      response:res
  });
  function demo(agent){
      agent.add('sending response from webhook server');
  }
  function News (agent){
      var payloadData = {
          
              type: 'news',
              
              
            }

           agent.add(new dfff.Payload(agent.UNSPECIFIED, payloadData, {sendAsMessage :true, rawPayload: true }))
          
      }

     
  

  var intentMap = new Map();


  intentMap.set('webHookDemo', demo) 
  intentMap.set('News', News)

  agent.handleRequest(intentMap);
});


app.use(express.static (__dirname + "/public"));
//listen in the port 
app.listen(3333, () =>{
    console.log('server is live at port ')
});