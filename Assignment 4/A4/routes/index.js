/*
index.js
COMP2406 - Assignment 4
Created by:
	- Michael Tran: 100940008
	- John Diyala: 100939721
Looked at Prof's Note as a reference for many things
*/

var MongoClient = require('mongodb').MongoClient;
var Server = require('mongodb').Server;
var mongo = new MongoClient();
var http = require('http');
var https = require('https');
var url = require('url');
var qstring = require('querystring');
var fs = require('fs');
var empty = true;


var cursor;
var songs = [''];
up = "";
var songName = "";
var myDB;
var fstream;

//Connects to the database
mongo.connect("mongodb://localhost:27017/", function(err, db){
   if(err) console.log('FAILED TO CONNECT TO DATABASE');
   else{
   myDB = db.db("iRealSongs");
   console.log('CONNECTED TO DATABASE');
   } //else
   findSongs(null, null);
});

//Finds all the songs with the title the user inputs and only display the first 12
//This function is linked with the jade file "search.jade"
function findSongs(req, res){
    myDB.collection("songs", function(err, collection){
			collection.find({title: {$in: songName}}, {title:1, _id:0}).limit(12).toArray(
                                                function(err, results){
														if((res != null)){
															res.render('search', { title: 'Songs Database Search',
															  songs: results,
															  error: req.query.error });
                                                        }});
     });
}

//This is the first page in the browser that allows the user to search
function index(req, res) {
	res.render('index', { title: 'Songs Database Search', 
				  up: up,
			      error: req.query.error });
	up = '';
}

//This function adds in songs to the database and parse the songs up
//For testing purposes we left it so all the TA's have to do is click "Upload" on the browser
//And that will add the original 1200 songs to the database
function addSongs(req,res,empty){
    setTimeout(function() {

		var fs = require('fs');
		var mc = require('mongodb').MongoClient; //need to: npm install mongodb
		var Set = require('./set.js'); 
		var set = new Set();
		var inputFilePath = "";

		if (empty) inputFilePath = (__dirname + '/uploads/1200iRealBookJazz_rev2.txt');
		else inputFilePath = (__dirname + '/uploads/upload.txt');
		empty = false;
		//parsing modes
		//input mode changes when an '=' is found in data file
		var MODES = {
		UNKNOWN : 0,
		TITLE: 1,   //parsing title of song
		COMPOSER: 2, //parsing composer of song
		STYLE: 3,  //parsing style of song
		KEY: 4,  //parsing musical key of song
		N: 5,     //place holder, no parsing
		SONGDATA: 6 //parsing song chord data
		};

		//NOTE: location and name of song data file is hard-coded.
		fs.readFile(inputFilePath , function(err, data) {
		  if(err) {
		      console.log('ERROR OPENING FILE: ' + inputFilePath);
		      throw err; 
		  } 

		  console.log('PARSING FILE: ' + inputFilePath);

		  var fileDataString = data.toString(); //all data from file
		 
		  var mode = MODES.UNKNOWN;  //current parsing mode
		  var parseDataString = ""; //parse data for current mode
		  var rawSongDataString = ""; //raw data for song kept for debugging for now
		  var currentSong = {}; //current songs being constructed
		  var currentBar = null; //current bar being constructed

		  var songsArray = []; //array of parsed songs

		  function isEmptyObject(anObject){
		     //answer whether anObject is empty
		     for(var item in anObject)
		        if(anObject.hasOwnProperty(item)) return false;
		     return true;
		  }
		  


		  function setMode(newMode){
		      

		      //now leaving mode
		      if(mode === MODES.TITLE){ 
		           currentSong.title = parseDataString;
		      }
		      else if(mode === MODES.COMPOSER) {
		           currentSong.composer = parseDataString;
		      }
		      else if(mode === MODES.STYLE) {
		           currentSong.style = parseDataString;
		      }
		      else if(mode === MODES.KEY) {
		           currentSong.key = parseDataString;
		      }
		      else if(mode === MODES.SONGDATA) {
		           currentSong.songData = parseDataString;
				   currentSong.rawSongData = rawSongDataString;
		       }

		      //now entering mode
		      if(newMode === MODES.SONGDATA) {
		            currentSong.bars = []; //make bars array
		       
		      }
		      else if(newMode === MODES.TITLE) {
		            if(!isEmptyObject(currentSong))
		                songsArray.push(currentSong);
		            currentSong = {}; //make new empty song;
		       
		      }

		     
		      mode = newMode;
		      parseDataString = ""; 
			  rawSongDataString = "";
		  }
		  
		  function isBarLine(x){ 
		     if(x === "|") return true; //bar line
		    if(x === "[") return true; //left double bar line
		    if(x === "]") return true; //right double bar line
		    if(x === "{") return true; //left repeat bar line
		    if(x === "}") return true; //right repeat bar line
		    if(x === "Z") return true; //final bar line
			 return false;
		  }

		  //parse the file data into song objects with bars.
		  //each bar contains crude chord data including chords, time signatures
		  //rehearsal letters etc.
		  for(var i=0; i<fileDataString.length; i++){
		     if(fileDataString.charAt(i) == "="){
		       //change parsing mode
		       if(mode === MODES.UNKNOWN) setMode(MODES.TITLE);
		       else if(mode === MODES.TITLE) setMode(MODES.COMPOSER);
		       else if(mode === MODES.COMPOSER) setMode(MODES.STYLE);
		       else if(mode === MODES.STYLE) setMode(MODES.KEY);
		       else if(mode === MODES.KEY) setMode(MODES.N);
		       else if(mode === MODES.N) setMode(MODES.SONGDATA);
		       else if(mode === MODES.SONGDATA) setMode(MODES.TITLE);
		     }
		     else if((mode === MODES.SONGDATA) && isBarLine(fileDataString.charAt(i))){
			    if(currentBar === null) {
				    currentBar = {}; 
				   if(fileDataString.charAt(i) === "[") currentBar.leftDoubleBarLine = "leftDoubleBarLine";
				   if(fileDataString.charAt(i) === "{") currentBar.leftRepeat = "leftRepeat";
				}
				else{
			    currentBar.chords = parseDataString;
				currentSong.bars.push(currentBar);
				if(fileDataString.charAt(i) === "]") currentBar.rightDoubleBarLine = "rightDoubleBarLine";
				if(fileDataString.charAt(i) === "}") currentBar.rightRepeat = "rightRepeat";
				if(fileDataString.charAt(i) === "Z") currentBar.finalBarLine = "finalBarLine";
				
				if(fileDataString.charAt(i) === "]") currentBar = null;
				else if(fileDataString.charAt(i) === "}") currentBar = null;
				else currentBar = {};
				parseDataString = "";
				
				}
				
			    rawSongDataString = rawSongDataString + fileDataString.charAt(i);

			 }
		     else{
		       //add data character to content for mode
		       parseDataString = parseDataString + fileDataString.charAt(i);
		       rawSongDataString = rawSongDataString + fileDataString.charAt(i);
		     }
		       
		  } //end parse data file
		  
		  //account for last song which will not go back to TITLE mode
		  if(!isEmptyObject(currentSong)) {
		     currentSong.rawSongData = rawSongDataString;
		     currentSong.songData = parseDataString;	 
		     songsArray.push(currentSong);
			 }
		  currentSong = {}; //make new empty song;
		  currentBar = null; //clear current bar;

		 

		  var dataAsObject = {};
		  dataAsObject.songs = songsArray;
		  
		  mc.connect('mongodb://localhost/iRealSongs', function(err, db) {
		    if (err) {
			throw err;
		    }
		    
		       var songsCollection = db.collection('songs');

			   songsCollection.insert(songsArray, function(err, theSongs) {
			       if (err) {
				   throw err;
			       }
				   db.close();

			       });

		    });
		});
	    res.redirect('/');
	}, 500);
}


//Uploads a textfile
//Need to: npm install connect-busboy
function fileupload(req, res) {
    var fstream;
    var name = '';
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename); 
        fstream = fs.createWriteStream(__dirname + '/uploads/upload.txt');
        name = filename;
        file.pipe(fstream);
        if (name == '')
        	up = "No File Chosen: Default 1200iRealBookJazz_rev2.txt has been successfully added to the songs database.";
        else
        	up = '"' + filename +'" has been successfully added to the songs database.';
        });

    addSongs(req,res,empty);
}

//Splits what the user wanted to search into an array and then
//calls the function findSongs which finds all the songs
//corresponding to those key words and then display them
function search(req, res) {
    songName = req.body.songName;
	songName = songName.split(" ");
	for(var i = 0; i < songName.length; i++){
		songName[i] = new RegExp(songName[i], "i");
	}
    findSongs(req, res);
}

//This will display that one song that the user clicks
//Once the user clicks the one song this function calls: findOneSong
function display(req, res){
	var songTitle = req.param('song');
	findOneSong(req, res, songTitle);
}

//This function finds that one song that the user would like to view
//Calls the function parseBars and gets a new updated parsed bars
//Then send it to the client side
//Linked with "display.jade"
function findOneSong(req, res, title){
	myDB.collection("songs", function(err, collection){
            collection.find({title: {$regex: new RegExp(title), $options: "si"}}).toArray(
                                                function(err, results){
															var newBars = parseBars(results[0].bars);
															res.render('display', { songTitle: results[0].title,
																					songComposer: results[0].composer, 
																					songStyle: results[0].style,
																					songKey: results[0].key,
																					songBars: newBars,
																					error: req.query.error });
														});
     });

}

//This function just checks whether or not we need to assume the time signature
//Goes through each corde to search for the character "T"
//If there is T anywhere in the any chords we do not assume 4/4 time
function checkTimeSignature(bars){
	var searchT;
	var assumeTimeSig = 1;
	for(var i = 0; i < bars.length; i++){
		searchT = bars[i].chords.search("T");
		if(searchT != -1){
			return 0;
		}
	}
	return assumeTimeSig;
}

//This function parses up bars into 4 portions:
//stars --> The line above the chords --> searchs for "*", "Q", "N"
//begLine --> The line before each code whether it's just a single or a double bar line or a left repeat
//chords --> All the chords
//endLine --> The line at the end whether it's jsut a single/double/final/repeat bar line
function parseBars(bars){
	var array = [];
	var index = 0;
	var assumeTimeSig = checkTimeSignature(bars);

	for(var i = 0; i < bars.length; i++){
		var searchStar = 0;
		var searchT = 0;
		var searchN = 0;
		var string = '';
		var bar = {};
		
		bar.star = ' ';
		bar.begLine = '';
		bar.endLine = '';
		bar.timeSig = '';
		
		//If there is a "Q" it belongs above the chord and gets rid of the "Q" in the existing chord
		if(bars[i].chords.search("Q") != -1){
			bar.star = "@";
			bars[i].chords = bars[i].chords.replace("Q", "");
		}
		
		//Update the chord by replacing all spaces with '/'
		bars[i].chords = bars[i].chords.trim().replace(" ", "/");
		
		//Update the chord by replacing all "x" with '%'
		bars[i].chords = bars[i].chords.replace("x", "%");

		//Search for "*" within the chords
		searchStar = bars[i].chords.search(/[*]/g);
		if(searchStar != -1){
			bar.star = '[ ' + bars[i].chords.charAt(searchStar + 1) + ' ]';
			searchStar = searchStar + 2;
		}
		else{
			searchStar = 0;
		}

		//Search for 'N' within the chords
		searchN = bars[i].chords.search("N");
		if(searchN != -1){
			bar.star = '(' + bars[i].chords.charAt(searchN + 1) + ".";
			searchN = searchN + 2;
		}
		else{
			searchN = 0;
		}
		
		//Replacing 'n' with NC
		if(bars[i].chords == "n")
			bars[i].chords = bars[i].chords.replace("n", "NC");
		
			
		//Search for 't' --> time signature
		searchT = bars[i].chords.search("T");
		if(searchT != -1){
			string += bars[i].chords.charAt(searchT + 1);
			string += "/";
			string += bars[i].chords.charAt(searchT + 2);
			searchT = searchT + 3;  //Do this so later when we take the substr we take the correct string index
		}
		else{
			//Assume 4/4 time
			if(assumeTimeSig == 1)
				string += "4/4";
			searchT = searchStar + searchN;
		}

		bar.timeSig = string;
		string = '';

		//Search for left bar line
		if(bars[i].leftDoubleBarLine){
			string += "||";
		}
		else if(bars[i].leftRepeat)
			string += "|:";
		else
			string += "|";
			
		bar.begLine = string;
		string = '';

		strLength = bars[i].chords.length;
		//Add chords to string
		string += bars[i].chords.substr(searchT, strLength).trim();

		//Search for right bar line
		if(bars[i].rightDoubleBarLine || bars[i].finalBarLine){
			bar.endLine = "||";
		}
		else{
			if((index+1) % 4 == 0)
				bar.endLine = "|";
		}
		if(bars[i].rightRepeat)
			bar.endLine = ":|";

		bar.chords = string;

		if((bars[i].chords != "") && (bars[i].chords.search("Y") == -1)){
			array[index] = bar;
			index++;
		}
	}

	return array;
}

exports.index = index;
exports.search = search;
exports.display = display;
exports.fileupload = fileupload;

