var robot = require("robotjs");
var nightmare = require("nightmare")({
	show: true
});

var g_v = {
	centerx: Math.round(robot.getScreenSize().width / 2),
	centery: Math.round(robot.getScreenSize().height / 2),
	spinradius: robot.getScreenSize().height / 6
};

var g_f = {
	getMouseLocForSpin: function(degree) {
		function toRadians(angle) {
  			return angle * (Math.PI / 180);
		}
		var x = g_v.centerx + g_v.spinradius * Math.cos(toRadians(degree));
		var y = g_v.centery + g_v.spinradius * Math.sin(toRadians(degree));
		return [x, y];
	}
};

var start = function() {
	nightmare.goto("http://diep.io/").then(function() {
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
	}).wait("#textInput").type("#textInput", process.argv[2] || "A BOTTY BOT").then(function() {
		robot.keyTap("enter");
		startPlaying();
	});
};

function startPlaying() {
	console.log("We are in");
};
