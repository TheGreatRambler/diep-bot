var robot = require("robotjs");
var opn = require("opn");

var startPlaying = function() {
	console.log("We are in");
};

var start = function() {
	opn("http://diep.io/").then(function() {
		// maximise window, because if we dont, problems arise
		switch(os.type()) {
			case "Linux":
				robot.keyTap("alt", "f10");
				break;
			case "Darwin":
				robot.keyTap("f", ["command", ""control"]);
				break:
			case "Windows_NT":
				robot.keyTap("up", "command");
				break;
			default:
				// assume linux
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
