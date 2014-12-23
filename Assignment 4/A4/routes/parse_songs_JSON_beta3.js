


var fs = require('fs');
var mc = require('mongodb').MongoClient; //need to: npm install mongodb
var Set = require('./set.js'); 
var set = new Set();


var inputFilePath = "uploads/upload.txt";
var outputFilePath = "allsongs/output.txt";

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

 

  //write parsed songs to console
  //console.log(songsArray);
  console.log('THE SET');
  console.log(set.toString());

  //write parsed songs to output file.
  //write the array as a stringified JSON object.
  var dataAsObject = {};
  dataAsObject.songs = songsArray;

  fs.writeFile(outputFilePath , JSON.stringify(dataAsObject, null, 2), function(err){
    if(err) console.log(err);
    else console.log('file was saved to: ' + outputFilePath);
  });
  
  mc.connect('mongodb://localhost/iRealSongs', function(err, db) {
    if (err) {
	throw err;
    }
    
       var songsCollection = db.collection('songs');

  
	   if (err) {
	       console.log("No collection to drop.");
	   } else {
	       console.log("songs collection dropped.");
	   }
	   songsCollection.insert(songsArray, function(err, theSongs) {
	       if (err) {
		   throw err;
	       }

	       //theSongs.forEach(function(aSong) {
		   //console.log("Added " + aSong.title);
		   //});
		   db.close();

	       });

    });
});


