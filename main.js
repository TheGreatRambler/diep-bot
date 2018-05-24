var robot = require("robotjs");
var Nightmare = require("nightmare")

Nightmare.action("maximize", function(name, options, parent, win, renderer, done) {
    parent.respondTo("maximize", function(done) {
      win.maximize();
    });
    done();
}, function(done) {
    this.child.call("maximize", done)
});

var nightmare = Nightmare({
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
	nightmare.goto("http://diep.io/").maximize().wait("#textInput").type("#textInput", process.argv[2] || "A BOTTY BOT").wait(function() {
		return document.getElementById("textInputContainer").style.display === "none";
	}).then(function() {
		robot.keyTap("enter");
		startPlaying();
	});
};

function startPlaying() {
	console.log("We are in");
};
