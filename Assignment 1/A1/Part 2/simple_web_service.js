
/*
Simple Web Service
Use browser to view http://localhost:3000/index.html.
*/

//Cntl+C to stop server (in Windows CMD console)

var http = require('http');
var col = require('colour'); 

var counter = 1000; //to count invocations of function(req,res)

//replace ? query portion and trailing '/' in url
//with emtpy string using a regular expression pattern


http.createServer(function (request,response){
	var path = request.url.replace(/\/?(?:\?.*)$/,'').toLowerCase();
	var page = '';

	// the following function properly converts ChordPro formatted code into HTML
	function convert(songFileName){
		var fs = require('fs'); 
		var col = require('colour'); 
		fs.readFile("songs/" + songFileName, function(err, data) {		// the songs directory where the songs are located
			if(err) throw err; 

			var lyricsArray = data.toString().split("\n"); 				// the .txt file, creating an array of single-line strings
			var chordArray = lyricsArray.slice(0);

			for (thisLine in lyricsArray){
				var chordLine = "";
				var lyrics = "";
				var line = chordArray[thisLine];
				var outsidebracket = 1;
				for (var c =0; c< line.length ; c++) {
					if (line.charAt(c) == '['){
						outsidebracket = 0;
					}
					else if ((line.charAt(c)) == ']'){
						outsidebracket = 1;
					}
					else if (outsidebracket){
						if (line.charAt(c) != ' ')
							chordLine  += "&nbsp";			// add proper spacing to the newly formed chordLine string if outside the chord brackets
						lyrics += line.charAt(c)			// add everything to the lyrics line that's not in the chord brackets
					}
					else{
						chordLine += line.charAt(c);		// add the proper chords within the chord brackets to the chord line	
					}
				}

				chordArray[thisLine] = chordLine;
				lyricsArray[thisLine] = lyrics;

			}

			// HTML Settings
			response.writeHead(200, {"Content-Type": "text/html; charset=UTF-8;font-family : Courier"}); // Courier is a monospaced font that fits this purpose 
			
			// Page title
			response.write('<title>Lyrics w/ ChordPro</title>');
			response.write('</head><body>');
			response.write('<FONT FACE="courier">');

			// Output the array of single-line strings one by one
			for(i in chordArray) {
				response.write("<br />"+chordArray[i].fontcolor("green")+"<br />");		//write chords in green
				response.write(lyricsArray[i].fontcolor("blue"));						//write lyrics in blue
			} 

			response.write('</FONT>')
			response.write('</body></html>');
			response.end();

		});
}


//write HTTP header
switch(path){
	case '/about.html':
	page = 'ABOUT PAGE';
	response.writeHead(200, {'Content-Type': 'text/plain'});
	response.end('[' + counter++ + ']: ' + page + '\n');
	break;

	case '/index.html':
	page = 'HOMEPAGE';
	response.writeHead(200, {'Content-Type': 'text/html'});
	//Bullet point hypertext-link list of all the songs
	response.write('<title>Songs</title>');
	response.write("<li> <a href='http://localhost:3000/sister_golden_hair.html'>Sister Golden Hair</a></li>")
	response.write("<li> <a href='http://localhost:3000/first_we_take_manhattan.html'>First We Take Manhattan</a></li>")
	response.write("<li> <a href='http://localhost:3000/losing_my_religion.html'>Losing My Religion</a></li>")
	response.write("<li> <a href='http://localhost:3000/everybody_knows.html'>Everybody Knows</a></li>")
	response.end('[' + counter++ + ']: ' + page + '\n');
	break;


	case '/sister_golden_hair.html':
	convert("sister_golden_hair.txt");
	break;

	case '/first_we_take_manhattan.html':
	convert("first_we_take_manhattan.txt");
	break;

	case '/losing_my_religion.html':
	convert("losing_my_religion.txt");
	break;

	case '/everybody_knows.html':
	convert("everybody_knows.txt");
	break;

	default:
	page = 'ERROR 404 PAGE NOT FOUND';

//exercise: change error code to 404 instead of 200
//and see how the browser responds
response.writeHead(200, {'Content-Type': 'text/plain'});
response.end('[' + counter++ + ']: path= ' + path + '\n' + page + '\n');
break;
}
//end HTTP response and provide final data to send
}).listen(3000, "127.0.0.1");
console.log('Server Running at http://127.0.0.1:3000  CNTL-C to quit');