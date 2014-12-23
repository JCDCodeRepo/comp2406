var loggedInUsers = {};
var LoggedIn = 'TheUserIsLoggedIn';
//var req.session.user= 0;

var cells = [
                [[],[],[],[]],
                [[],[],[],[]],
                [[],[],[],[]],
                [[],[],[],[]]
            ];

for (var i = 0; i < 4; i++) {               //assignment
    for (var j = 0; j < 4; j++) {           //ta
        for (var k = 0; k < 4; k++) {       //column
            if (i == 0 && k == 0) cells[i][j][k] = "2014-10-03";
            if (i == 1 && k == 0) cells[i][j][k] = "2014-10-23";
            if (i == 2 && k == 0) cells[i][j][k] = "2014-11-13";
            if (i == 0 && k == 1) cells[i][j][k] = "2014-10-15";
            if (i == 1 && k == 1) cells[i][j][k] = "2014-11-05";
            if (i == 2 && k == 1) cells[i][j][k] = "2014-11-26";
        }
    }
}
check();

function index(req, res) {
    if (req.session.username == "Student" && req.session.password == "tneduts") req.session.user= 1;
    else  if (req.session.username == "Prof" && req.session.password == "forp") req.session.user= 2;
    else  if (req.session.username == "TA1" && req.session.password == "1at") req.session.user= 3;
    else  if (req.session.username == "TA2" && req.session.password == "2at") req.session.user= 4;
    else  if (req.session.username == "TA3" && req.session.password == "3at") req.session.user= 5;
    else  if (req.session.username == "TA4" && req.session.password == "4at") req.session.user= 6;
    else {
	res.render('index', { title: 'COMP 2406 Fall Assignment Grading', 
			      error: req.query.error });
    }
    if (req.session.user> 0 && req.session.user< 7) res.redirect("users");
    console.log("----------------------------------------------------"+req.session.username + req.session.password);
}

function users(req, res) {
    if (req.session.user==1){
	res.render("stuAccount.jade", {username:req.session.username,
                    cells: cells,
				    title:"Student Account",
				    loggedInUsers: loggedInUsers});
    } 
    else  if (req.session.user==2){
    res.render("profAccount.jade", {username:req.session.username,
                    cells: cells,
                    title:"Professor Account",
                    loggedInUsers: loggedInUsers});
    } 
    else  if (req.session.user){
    res.render("taAccount.jade", {username:req.session.username,
                    cells: cells,
                    title:"TA"+(req.session.user-2)+" Account",
                    loggedInUsers: loggedInUsers});
    } 
    else {
	res.redirect("/?error=Not Logged In - Check Your Credentials");
    }
};

function login(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    req.session.username = username;
    req.session.password = password;
    loggedInUsers[username] = LoggedIn;
    check();
    res.redirect("/users")
}

function update(req, res) {
    if (req.session.user-2 > 0 && req.session.user-2 < 5){
        if (req.body.a1 != "")
            cells[0][req.session.user-3][2] = req.body.a1;
        if (req.body.a2 != "")
            cells[1][req.session.user-3][2] = req.body.a2;
        if (req.body.a3 != "")
            cells[2][req.session.user-3][2] = req.body.a3;
        if (req.body.a4 != "")
            cells[3][req.session.user-3][2] = req.body.a4;
    }
    else {
        for (var i = 0 ; i < 4 ; i++){
            if (req.body.sa1 != "")
                cells[0][i][0] = req.body.sa1;
            if (req.body.sa2 != "")
                cells[1][i][0] = req.body.sa2;
            if (req.body.sa3 != "")
                cells[2][i][0] = req.body.sa3;
            if (req.body.sa4 != "")
                cells[3][i][0] = req.body.sa4;
            if (req.body.ea1 != "")
                cells[0][i][1] = req.body.ea1;
            if (req.body.ea2 != "")
                cells[1][i][1] = req.body.ea2;
            if (req.body.ea3 != "")
                cells[2][i][1] = req.body.ea3;
            if (req.body.ea4 != "")
                cells[3][i][1] = req.body.ea4;
            }
    }
    check();
    res.redirect("/users")
}

function logout(req, res) {
    delete loggedInUsers[req.session.username];
    req.session.user= 0;
    /* OLD CODE FROM express-session module
    req.session.destroy(function(err){
        if(err){
            console.log("Error: %s", err);
        }
    });
    */
    req.session = null; //NEW CODE for cookie-session module
    res.redirect("/");
}

function check(){
    for (var i = 0 ; i < 4 ; i++){
        for (var j = 0 ; j < 4 ; j++){
            var currentTime  = new Date();
            if (cells[i][j][2] != "" && Date.parse(cells[i][j][2]) < Date.parse(cells[i][j][1])) 
                cells[i][j][3] = 1;
            else if (Date.parse(currentTime) < Date.parse(cells[i][j][1]))
                cells[i][j][3] = 2;
            else if (Date.parse(currentTime) > Date.parse(cells[i][j][0]))
                cells[i][j][3] = 3;
        }
    }    
}

exports.index = index;
exports.users = users;
exports.login = login;
exports.update = update;
exports.logout = logout;
