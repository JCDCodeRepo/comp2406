COMP2406 - Assignment 2
Created by:
	- Michael Tran: 100940008
	- John Diyala: 100939721
Looked at Prof's Note as a reference for many things

Files included:
	- Thermostat.js
	- Furnace.js
	- servercert.crt
	- serverkey.pem
	
OS used:
	- Windows 8
	
To run the program:
	1) Open 2 cmd
	2) On the first one run Thermostat.js : "node Thermostat.js"
	3) On the second one run Furnace.js : "node Furnace.js"
	4) Open in the browser: "https://localhost:3000"
	
Notes:
	- The Furnace communicates with the Thermostat every second
	- The Browser refreshes itself every 10 seconds
	- If you accidentally put in a wrong country/city that the API does not have the program will crash
	- If user does not put in any temperature then the programs default desired temperature is 23C
	- The default city is Ottawa unless otherwise stated
	- Furnace and Thermostat talks on localhost:3001
	- Thermostat hosts at localhost:3000 for the browser