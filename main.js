var robot = require("robotjs");
var puppeteer = require("puppeteer");
var tracking = require("jstracking");
var PNG = require("png-js");

var b;
var p;

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
	// callback hell much?
	puppeteer.launch({
		headless: false,
		//args: ["--start-fullscreen"]
	}).then(function(browser) {
		b = browser;
		browser.newPage().then(function(page) {
			p = page;
			page.setViewport({
				width: g_v.size.width,
				height: g_v.size.height
			}).then(function() {
				page.goto("http://diep.io/").then(function() {
					page.waitForNavigation({
						waitUntil: "networkidle0"
					}).then(function() {
						switch (process.argv[2]) {
							case "FFA":
								break;
							case "Survival":
								break;
							case "2 Teams":
								break;
							case "4 Teams":
								break;
							case "Domination":
								break;
							case "Tag":
								break;
							case "Maze":
								break;
							case "Sandbox":
								break;
							default:
								// 4 Teams
						}
						page.waitForSelector("#textInput").then(function() {
							page.type("#textInput", process.argv[3] || "A BOTTY BOT").then(function() {
								page.keyboard.press("Enter").then(function() {
									waitUntilDiepReady().then(function() {
										startPlaying();
									});
								});
							});
						});
					});
				});
			});
		});
	});
}

function waitUntilDiepReady() {
	return new Promise(function(resolve, reject) {
		page.waitForFunction(function() {
			return document.getElementById("textInputContainer").style.display === "none";
		}).then(function() {
			resolve();
		});
	});
}

function startPlaying() {
	console.log("We are in");
	p.waitForFunction(function() {
		return document.getElementById("a").style.display === "block";
	}).then(function() {
		// you died!
		page.keyboard.press("Enter").then(function() {
			page.keyboard.press("Enter").then(function() {
				waitUntilDiepReady().then(function() {
					startPlaying();
				});
			});
		});
	});
	
	var datatracker = new tracking.ColorTracker([]); // TODO
	
	datatracker.on('track', function(event) {
  		if (event.data.length !== 0) {
    		event.data.forEach(function(data) {
      			// Plots the detected targets here. 
    		});
  		}
	});
	
	setInterval(function() {
		p.screenshot({
			fullPage: true,
			type: "png"
		}).then(function(imagebuffer) {
			PNG.decode(new PNG(imagebuffer), function(pixels) {
				tracking.track(pixels, datatracker);
			});
		});
	}, 1000);
};
