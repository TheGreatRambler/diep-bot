var robot = require("robotjs");
var puppeteer = require("puppeteer");

var g_v = {
	size: robot.getScreenSize(),
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

function start() {
	puppeteer.launch({
		headless: false
	}).then(function(browser) {
		browser.newPage().then(function(page) {
			page.setViewport({
				width: g_v.size.width,
				height: g_v.size.height
			}).then(function() {
				page.goto("http://diep.io/").then(function() {
					page.waitForNavigation({
						waitUntil: "networkidle0"
					}).then(function() {
						page.waitForSelector("#textInput").then(function() {
							page.type("#textInput", process.argv[2] || "A BOTTY BOT").then(function() {
								robot.keyTap("enter");
								page.waitForFunction(function() {
									return document.getElementById("textInputContainer").style.display === "none";
								}).then(function() {
									startPlaying();
								});
							});
						});
					});
				});
			});
		});
	});
}

function startPlaying() {
	console.log("We are in");
};
