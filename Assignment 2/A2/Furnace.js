/*
Furnace.js
COMP2406 - Assignment 2
Created by:
	- Michael Tran: 100940008
	- John Diyala: 100939721
Looked at Prof's Note as a reference for many things
*/

//Require the following for this program
var https = require('https'); //need to https
var fs = require('fs');

//Declare variables
var furnaceOn = 1;    	// 1 for on
var wasOn = furnaceOn;
var desiredTemp = 23;	//Default value for desiredTemp = 23
var roomTemp = 20;		//Default let the room start at 20 C
var hysteresis = 2; 	//thermostat hysteresis

//Options to communicate with the server
var options = {
	hostname: 'localhost',
	port: '3001',
	path: '/',
	method: 'POST',
	key: fs.readFileSync('serverkey.pem'),
	cert: fs.readFileSync('servercert.crt'),
	rejectUnauthorized: false
}

console.log('Furnace: On');

//Talks to to the server every second
setInterval(function(){
    //Gets data and parses it up
	function readJSONResponse(response){
		var responseData = '';
		response.on('data', function(chunk){responseData += chunk});
		
		response.on('end', function(){
			//Parse up data and store it the according variable
            var dataObj = JSON.parse(responseData);
            desiredTemp = Number(dataObj.desiredTemp);
            
            //User hasn't input anything for desiredTemp or Furnace is off
            if(desiredTemp == undefined || isNaN(desiredTemp))
                desiredTemp = 23;		//if user chosen desiredTemp auto set it to regular room temperature
            else
                desiredTemp = Number(dataObj.desiredTemp);
	
        });
	}
    
    
    
    //Turn on / off furnace accordingly
    if(roomTemp >= desiredTemp + hysteresis)
        furnaceOn = 0;
    if(roomTemp <= desiredTemp - hysteresis)
        furnaceOn = 1;

	//If furnace is on room temp increase and vice versa
	if(furnaceOn == 1)
		roomTemp++;
	else if(furnaceOn == 0)
		roomTemp--;
	
	//This is to display whether or not the Furnace is On/Off only once
	if(furnaceOn != wasOn){
		if(furnaceOn == 1)
			console.log('Furnace: On');
		else
			console.log('Furnace: Off');
		wasOn = furnaceOn;
	}

    //Send data to Thermostat (furnaceOn, roomTemp)
	var req = https.request(options, readJSONResponse);
	var data = {
		'furnaceOn' : furnaceOn,
		'roomTemp' : roomTemp
    };
	req.write(JSON.stringify(data));
	req.end();

}, 1000);
