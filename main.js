var robot = require("robotjs");
var opn = require("opn");

var startPlaying = function() {
	console.log("We are in");
};

var start = function() {
	opn("http://diep.io/").then(function() {
		// maximise window, because if we dont, problems arise
		var ostype = os.type();
		if (ostype === "Linux") {
			robot.keyTap("alt", "f10");
		} else if (ostype === "Darwin") {
			robot.keyTap("f", ["command", "control"]);
		} else if (ostype === "Windows_NT") {
			robot.keyTap("up", "command");
		} else {
			// assume its some really obscure linux distribution
			robot.keyTap("alt", "f10");
		}
		
		var screensize = robot.getScreenSize();
		robot.moveMouse(Math.round(screensize.width), Math.round(screensize.height) - 10);
		robot.mouseClick();
		robot.keyTap("a", "control");
		robot.typeString(process.argv[2] || "A BOTTY BOT");
		robot.keyTap("enter");
		startPlaying();
	});
};
