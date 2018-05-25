var robot = require("robotjs");
var puppeteer = require("puppeteer");
var tracking = require("jstracking");
var PNG = require("png-js");

var b;
var p;

var gameColors = {
	"0,176,225": "Blue Tank",
	"240,79,84": "Red Tank",
	"0,224,108": "Green Tank",
	"190,127,245": "Purple Tank",
	"255,228,107": "Square & Arena Closer",
	"252,118,118": "Triangle",
	"118,140,252": "Pentagon",
	"138,255,105": "Square, Green",
	"241,119,221": "Guardian",
	"192,192,192": "Fallen Bosses",
	"255,234,94": "Summoner"
};

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
	// of course requires a up-to-date node.js for 'await'
	var browser = await puppeteer.launch({
		headless: false,
		//args: ["--start-fullscreen"]
	});
	b = browser;
	var page = await browser.newPage();
	p = page;
	await page.setViewport({
		width: g_v.size.width,
		height: g_v.size.height
	});
	await page.goto("http://diep.io/");
	await page.waitForNavigation({
		waitUntil: "networkidle0"
	});
	await page.waitForSelector("#canvas");
	var buttonx;
	var buttony;
	var canvaswidth = await page.evaluate(function() {
		return document.getElementById("canvas").getBoundingClientRect().width;
	});
	var canvasheight = await page.evaluate(function() {
		return document.getElementById("canvas").getBoundingClientRect().height;
	});
	var FFAxfraction = 0.40555555; // used to find the upper left hand corner for the buttons
	switch (process.argv[2]) {
		// tricky code to get the location of the button to
		// change the game mode because it isn't a dom element.
		// relies heavily on the fact that the page layout
		// hopefully wont change.
		case "FFA":
			buttonx = Math.round(FFAxfraction * canvaswidth);
			buttony = 31;
			break;
		case "Survival":
			buttonx = Math.round(FFAxfraction * canvaswidth) + 60;
			buttony = 31;
			break;
		case "2 Teams":
			buttonx = Math.round(FFAxfraction * canvaswidth) + 120;
			buttony = 31;
			break;
		case "4 Teams":
			buttonx = Math.round(FFAxfraction * canvaswidth) + 180;
			buttony = 31;
			break;
		case "Domination":
			buttonx = Math.round(FFAxfraction * canvaswidth);
			buttony = 53;
			break;
		case "Tag":
			buttonx = Math.round(FFAxfraction * canvaswidth) + 60;
			buttony = 53;
			break;
		case "Maze":
			buttonx = Math.round(FFAxfraction * canvaswidth) + 120;
			buttony = 53;
			break;
		case "Sandbox":
			buttonx = Math.round(FFAxfraction * canvaswidth) + 180;
			buttony = 53;
			break;
		default:
			// 4 Teams
			buttonx = Math.round(FFAxfraction * canvaswidth) + 180;
			buttony = 31;
			break;
	}
	await page.mouse.click(buttonx, buttony, {
		button: "left"
	});
	await page.waitForNavigation({
		waitUntil: "networkidle0"
	});
	await page.waitForSelector("#textInput");
	var nametouse;
	if (!process.argv[3] || process.argv[3].length > 15) {
		nametouse = "TheGreatRambler";
	} else {
		nametouse = process.argv[3];
	}
	await page.type("#textInput", nametouse);
	await page.keyboard.press("Enter")
	await waitUntilDiepReady();
	startPlaying();
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
	// http://diepio.wikia.com/wiki/User_blog:Nobellion/Diep.io_Color_Key
	// best places to get colors

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
