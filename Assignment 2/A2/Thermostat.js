/*
Thermostat.js
COMP2406 - Assignment 2
Created by:
	- Michael Tran: 100940008
	- John Diyala: 100939721
Looked at Prof's Note as a reference for many things
*/

//Require the following for this program
var http = require('http');
var https = require('https');
var url = require('url');
var qstring = require('querystring');
var fs = require('fs');

//Options that reads the key/certificate for https
var options = {
	key: fs.readFileSync('serverkey.pem'),
	cert: fs.readFileSync('servercert.crt')
};

//variables for the city's weather
var city = 'Ottawa';        //Set default city Ottawa
var cityTemp;
var cityHigh;
var cityLow;

var roomTemp;           //current room temp
var desiredTemperature; //desired room temperature

//Writes out the HTML Page **THE HTML PAGE REFRESHES EVERY 10 SECONDS**
function openPage(roomTemp, city, response){
	var page = '<html><head><meta http-equiv="refresh" content = "10">' +
				'<title>Thermostat Controller</title></head>' +
				'<h1>Room temperature is: ' + roomTemp + 
				'C</h1><body><form method="post">' +
				'<fieldset><legend>Thermostat Options</legend>' +
					'<p><label Thermostat: </label>';
		page += '<p><label>Temperature: </label>' +
				'<input type = "number" name = "desiredTemperature" min="10" max="35" required>' +
                '<p>Get Weather any City: <input name = "city" required></p>' +
				'<p><input type = "submit" value = "Send Info" onclick = "alert(\'Info has been sent\')">' +
				'<input type = "button" onClick = "history.go(0)" value = "Refresh"></p></fieldset>';

        //Weather fieldset for current, high, low temperature in a given city
        page += '<fieldset><legend>' + city + '\'s Weather Info</legend>' + 
                '<p>Current Weather: ' + cityTemp + 'C</p>' +
                '<p>Today High : ' + cityHigh + 'C</p>' +
                '<p>Today Low : ' + cityLow + 'C</p>' +
                '</form></body></html>';
	response.end(page);
}


//Parse weather info and set variables to them
function parseWeather(weatherResponse, response){
    var weatherData = '';
    weatherResponse.on('data', function (chunk) {
        weatherData += chunk;
    });
    
    weatherResponse.on('end', function(){
        //Parse the weather data and store them in the according variables
        var weatherObj = JSON.parse(weatherData);
        cityTemp = JSON.stringify(weatherObj.main.temp) - 273.15;
        cityLow = JSON.stringify(weatherObj.main.temp_min) - 273.15;
        cityHigh = JSON.stringify(weatherObj.main.temp_max) - 273.15;
    });

}

//Get a given city weather info through api.openweathermap.org
function getWeather(city, response){
    var options = {
        host: 'api.openweathermap.org',
        path: '/data/2.5/weather?q=' + city
    };
    
    http.request(options, function(weatherResponse){
        parseWeather(weatherResponse, response);
    }).end();
    
}

//Create a server to talk to Furnace
https.createServer(options, function(request, response){
    if(request.method == "POST"){
        //Gets the data and add it all into a string
		var reqData = '';
		request.on('data', function(chunk) {
			reqData += chunk;
		});
        
        request.on('end', function(){	
            //Parse JSON object(s)
            var reqObj = JSON.parse(reqData);

            //Put it in the variable and display room temps
            roomTemp = Number(reqObj.roomTemp);
            console.log('Current room temperature: ' + roomTemp);
        
            //Send back desiredTemps
            var resObj = {
                'desiredTemp' : desiredTemperature
            };
            response.writeHead(200);
            response.end(JSON.stringify(resObj));
		});
    }
}).listen(3001);

//Create a server that talks to the Browser
https.createServer(options, function (request, response){
	if(request.method == "POST"){
        //Gets the data and add it all into a string
		var reqData = '';
		request.on('data', function(chunk) {
			reqData += chunk;
		});
		
		request.on('end', function() {	
			//Parse up the string
            var parseParams = qstring.parse(reqData);
            
			//Store the variables
            city = parseParams.city;
            desiredTemperature = parseParams.desiredTemperature;
			
			//Get the weather
            getWeather(city, response);
            response.end(openPage(roomTemp, city, response));
		});
	}
	else{
		openPage(roomTemp, city, response);
        getWeather(city, response);
	}
}).listen(3000);

console.log('Server Running at http://127.0.0.1:3000  CNTL-C to quit');