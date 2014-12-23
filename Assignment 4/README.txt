The Assignment itself has been handed in in Michael Tran's cuLearn.

COMP2406 - Assignment 4

Created by:
	- Michael Tran: 100940008
	- John Diyala: 100939721
Looked at Prof's Note as a reference for many things

DISCLAIMER:
	- For testing purposes we figured it would be easier to test with an empty database:
		--> You can upload the default "1200iRealBookJazz_rev2.txt" provided by the prof by clicking "Submit" without selecting a file:
			You will get the message: No File Chosen: Default 1200iRealBookJazz_rev2.txt has been successfully added to the songs database.

Files included:
	- Assignment 4 COMP2406
		- bin
			- www
		- public
			- images 		(folder with other things inside)
			- libs			(folder with other things inside)
			- stylesheets	(folder with other things inside)
		- routes
			- uploads
				- 1200iRealBookJazz_rev2.txt
				- upload.txt
			- index.js
			- parse_songs_JSON_beta3.js
			- set.js
		- views
			- display.jade
			- index.jade
			- layout.jade
			- search.jade
		- app.js
		- package.JSON
	- README.txt
	
OS used:
	- Windows 7/8
	
Operating Instructions:
	1.
		a) Open 2 cmd
	2.
		a) On the first one go into the mongodb directory: C:\...\mongodb\bin\
		b) Run the database using by typing in the following: "mongod -dbpath C:\*whereever mongodb is located*\data\db"
	3.
		a) On the second one go into the directory of "Assignment 4 COMP2406"
		b) Type in the following before you start: "npm install"
		c) To run the program type in "npm start"
	4. 
		a) Open in the browser: "https://localhost:3000"