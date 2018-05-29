var robot = require("robotjs");
var Ngocr = require("ng-ocr");
var puppeteer = require("puppeteer");
var tracker = require("./colortracker");
var PNG = require("pngjs").PNG;

var b;
var p;

var gameColors = {
    "0,178,225": "Blue Tank",
    "241,78,84": "Red Tank",
    "0,225,110": "Green Tank",
    "191,127,245": "Purple Tank",
    "255,232,105": "Square & Arena Closer",
    "252,118,119": "Triangle",
    "118,141,252": "Pentagon",
    "137,255,104": "Square, Green",
    "249,115,224": "Guardian",
    "192,192,192": "Fallen Bosses",
    "255,232,106": "Summoner"
};

var g_v = {
    size: robot.getScreenSize(),
    centerx: Math.round(robot.getScreenSize().width / 2),
    centery: Math.round(robot.getScreenSize().height / 2),
    spinradius: robot.getScreenSize().height / 6
};

var g_f = {
    getMouseLocForSpin: function (degree) {
        function toRadians(angle) {
            return angle * (Math.PI / 180);
        }
        var x = g_v.centerx + g_v.spinradius * Math.cos(toRadians(degree));
        var y = g_v.centery + g_v.spinradius * Math.sin(toRadians(degree));
        return [x, y];
    }
};

function start() {
    console.log("Args provided: ", process.argv.join("          "));
    // of course requires a up-to-date node.js for 'await'
    puppeteer.launch({
        headless: false,
        args: ["--start-maximized", "--disable-infobars"],
        appMode: true,
        timeout: 0
    }).then(function (browser) {
        console.log("Chrome opened.");
        b = browser;
        browser.newPage().then(function (page) {
            p = page;
            page.on("console", function (msg) {
                for (let i = 0; i < msg.args().length; ++i) {
                    console.log("Page console: " + i + " : " + msg.args()[i]);
                }
            });
            page.goto("http://diep.io/").then(function () {
                console.log("Diep.io loaded.");
                page.waitForSelector("#canvas").then(async function () {
                    console.log("Canvas ready");
                    var buttonx;
                    var buttony;
                    var canvaswidth = await page.evaluate(function () {
                        return document.getElementById("canvas").getBoundingClientRect().width;
                    });
                    var canvasheight = await page.evaluate(function () {
                        return document.getElementById("canvas").getBoundingClientRect().height;
                    });
                    var centerX = Math.round(canvaswidth / 2);
                    var baseY = 38;
                    var xIncrement = 66;
                    var secondRowYIncrease = 23;
                    switch (process.argv[2]) {
                        // tricky code to get the location of the button to
                        // change the game mode because it isn't a dom element.
                        // relies heavily on the fact that the page layout
                        // hopefully wont change.
                        case "FFA":
                            buttonx = centerX - Math.round(1.5 * xIncrement);
                            buttony = baseY;
                            break;
                        case "Survival":
                            buttonx = centerX - Math.round(0.5 * xIncrement);
                            buttony = baseY;
                            break;
                        case "2 Teams":
                            buttonx = centerX + Math.round(0.5 * xIncrement);
                            buttony = baseY;
                            break;
                        case "4 Teams":
                            buttonx = centerX + Math.round(1.5 * xIncrement);
                            buttony = baseY;
                            break;
                        case "Domination":
                            buttonx = centerX - Math.round(1.5 * xIncrement);
                            buttony = baseY + secondRowYIncrease;
                            break;
                        case "Tag":
                            buttonx = centerX - Math.round(0.5 * xIncrement);
                            buttony = baseY + secondRowYIncrease;
                            break;
                        case "Maze":
                            buttonx = centerX + Math.round(0.5 * xIncrement);
                            buttony = baseY + secondRowYIncrease;
                            break;
                        case "Sandbox":
                            buttonx = centerX + Math.round(1.5 * xIncrement);
                            buttony = baseY + secondRowYIncrease;
                            break;
                        default:
                            // 4 Teams
                            buttonx = centerX + Math.round(1.5 * xIncrement);
                            buttony = baseY;
                            break;
                    }
                    // console.log("Button location: " + buttonx + "x, " + buttony + "y.");
                    await page.mouse.click(buttonx, buttony, {
                        button: "left"
                    });

                    await page.waitForSelector("#textInput");
                    var nametouse;
                    if (!process.argv[3] || process.argv[3].length > 15) {
                        nametouse = "TheGreatRambler";
                    } else {
                        nametouse = process.argv[3];
                    }
                    await page.waitFor(3000);
                    await page.type("#textInput", nametouse);
                    await page.keyboard.press("Enter");
                    await waitUntilDiepReady();
                    startPlaying();
                });
            }).catch(function (err) {
                console.error("Website timed out: ", err);
            });
        });

    });
}

function waitUntilDiepReady() {
    return new Promise(function (resolve, reject) {
        p.waitForFunction(function () {
            return document.getElementById("textInputContainer").style.display === "none";
        }).then(function () {
            resolve();
        });
    });
}

function startPlaying() {
    console.log("Started");
    var repeatid = setInterval(function() {
        p.evaluate(function() {
            return document.getElementById("a").style.display === "block";
        }).then(function(isdead) {
            if (isdead) {
                // you died!
                clearInterval(repeatid);
                console.log("Bot died");
                p.keyboard.press("Enter").then(function () {
                    p.waitFor(1000).then(function() {
                        p.keyboard.press("Enter").then(function () {
                            waitUntilDiepReady().then(function () {
                                startPlaying();
                            });
                        });
                    });
                });
            }
        })
    }, 200);
    
    Object.keys(gameColors).forEach(function(color) {
        tracker.registerColor(color, function(r, g, b, a) {
            var colorvalues = color.split(",");
            if (r === Number(colorvalues[0]) && g === Number(colorvalues[1]) && b === Number(colorvalues[2])) {
                return true;
            } else {
                return false;
            }
        });
    });

    var objecttracker = new tracker(Object.keys(gameColors));
    // used PixelPicker

    setInterval(function () {
        console.log("Frame reading started");
        p.screenshot({
            //fullPage: true,
            type: "png"
        }).then(function (imagebuffer) {
            var screenshot = new PNG({
                filterType: 4
            });
            screenshot.parse(imagebuffer, function (error) {
                objecttracker.track(screenshot.data, screenshot.width, screenshot.height).then(function(recs) {
                    if (recs.length !== 0) {
                        recs.forEach(function(rec) {
                            var gameobject = gameColors[rec.color];
                            console.log(gameobject);
                        });
                    }
                });
            });
        });
    }, 200);
};

start();
