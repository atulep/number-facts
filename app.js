'use strict'

process.env.DEBUG = 'actions-on-google:*';

let Assistant = require('actions-on-google').ApiAiAssistant;
let express = require('express');
let bodyParser = require('body-parser');
let request_lib = require('request'); // for sending the http requests to Numbers API
let app = express();
app.set('port', (process.env.PORT || 8080));
app.use(bodyParser.json({type: 'application/json'}));
// name of the actions -- correspond to the names I defined in the API.AI console
const PROVIDE_FACT = "provide_fact";
const PLAY_AGAIN_YES = "play_again_yes";
const DEFAULT_WELCOME = "input.welcome";
// other useful contstants
const NUMBER_ARGUMENT = "number";
const PREFIX_HAPPY = "Sure. Did you know that "; 

app.post('/', function(request, response) {
    const assistant = new Assistant({request: request, response: response});
    
    /* 
     * Useful to test my call back functions.   
    function testSendRequest() {
        console.log("Test...");
        var url = "http://numbersapi.com/7/math";        
        sendRequest(url, callback);
    } 
    
    function callback(res) {
        console.log("Result from sendRequest is " + res);
    }*/

    function callback(fact) {
        assistant.tell(PREFIX_HAPPY + fact);
    }

    /**
     * An action that provides a fact based on the given number by the user. 
     */
    function provideFact(assistant) {
        var number = assistant.getArgument(NUMBER_ARGUMENT);
        sendRequest("http://numbersapi.com/" + number, callback); // defaults to trivia
    }
    
    /**
     * Helper function to send the GET request to Numbers API
     */
    function sendRequest(url, callback) {
        console.log("Sending GET to " + url);
        request_lib.get(url, function(error, response, body) {
            if (!error && response.statusCode == 200) { 
                console.log("Fact is " + body);
                callback(body);
            } else {
                console.log("Error=" + error);
            }
        });
    }

    /**
     * Action for the welcome. It can be equivalently defined in the API.AI console as well.
     */
    function welcome(assistant) {
        var reply = "Welcome to Number Facts! What number is on your mind?";
        assistant.tell(reply);
    }
    
    //testSendRequest();
    let actionMap = new Map();
    actionMap.set(PROVIDE_FACT, provideFact);
    actionMap.set(DEFAULT_WELCOME, welcome); 
    assistant.handleRequest(actionMap);
});

var server = app.listen(app.get('port'), function() {
    console.log('App listening on port %s', server.address().port);
    console.log('Press Ctrl+C to quit.');
});
