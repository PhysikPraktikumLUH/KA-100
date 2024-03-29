
var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
var cbuf = document.getElementById("canvasbuf");
var ctxbuf = cbuf.getContext("2d");
var osziImg = document.getElementById("osziImg");
var netzteilImg1 = document.getElementById("netzteilImg1");
var netzteilImg2 = document.getElementById("netzteilImg2");
var fgImg1 = document.getElementById("fgImg1");
var fgImg2 = document.getElementById("fgImg2");
var micImg1 = document.getElementById("micImg1");
var micImg2 = document.getElementById("micImg2");


var ALL_SVG_IMG = [osziImg, fgImg1, fgImg2, netzteilImg1, netzteilImg2, micImg1, micImg2];



var imgWidth = 0;
var imgHeight = 0;
var OSZI_ASPECT_RATIO = 778.0 / 1765.0;
var OSZI_SCREEN_POS = [0.069, 0.118, 0.366, 0.672];
var SLIDER_POS = [
	[0.587, 0.25],
	[0.71, 0.25],
	[0.883, 0.31],
	[0.8, 0.65]
];
var COMBOBOX_POS = [
    [0.548, 0.94],
    [0.674, 0.94]
];
var COLORS = [
	[
		"rgb(236,226,220)",
		"rgb(200,200,200)",
		"rgb(120,200,120)",
		"rgb(100,200,100)"
	],
	[
		"rgb(236,226,220)",
		"rgb(200,200,200)",
		"rgb(200,50,50)",
		"rgb(230,50,50)"
	],
	[
		"rgb(101,101,101)",
		"rgb(130,130,130)",
		"rgb(170,170,170)",
		"rgb(200,255,200)"
	],
	[
		"rgb(124,124,124)",
		"rgb(170,170,170)",
		"rgb(200,255,200)",
		"rgb(230,255,230)"
	],
	[
		"rgb(255,255,255)",
		"rgb(220,220,220)",
		"rgb(190,255,190)",
		"rgb(160,255,160)"
	],
	[
		"rgb(100,0,0)",
		"rgb(130,0,0)",
		"rgb(200,0,0)",
		"rgb(255,0,0)"
	],
	[
		"rgb(236,226,220)",
		"rgb(200,200,200)",
		"rgb(200,200,0)",
		"rgb(255,255,0)"
	],
	[
		"rgb(235,235,235)",
		"rgb(225,225,225)",
		"rgb(225,245,225)",
		"rgb(235,255,235)"
	],
	[
		"rgb(76,76,76)",
		"rgb(70,70,70)",
		"rgb(60,60,60)",
		"rgb(53,53,53)"
	]
];

var OSZI_GRID_TO_CANVAS_RATIO_X = 10.4;
var OSZI_GRID_TO_CANVAS_RATIO_Y = 8.4;
var DEFAULT_SAMPLERATE = 1000;
var DEFAULT_FPS = 100;
var data_buffer = new Array(10 * DEFAULT_SAMPLERATE);
var data_buffer_it = 0;
var data_buffer_end = 0;
var data_buffer_full = false;

var showFps = false;
var osziFrozen = false;
var aboutToPause = false;

var inputsch1 = document.getElementById("inputsch1");
var inputsch2 = document.getElementById("inputsch2");

var dc1slider = document.getElementById("dc1slider");
var dc2slider = document.getElementById("dc2slider");
var dc1screen = 0;
var dc2screen = 0;

var fg1ampslider = document.getElementById("fg1ampslider");
var fg2ampslider = document.getElementById("fg2ampslider");
var fg1fqslider = document.getElementById("fg1fqslider");
var fg2fqslider = document.getElementById("fg2fqslider");
var fg1fqfineslider = document.getElementById("fg1fqfineslider");
var fg2fqfineslider = document.getElementById("fg2fqfineslider");

var fg1tonewaves = 0;
var fg2tonewaves = 0;

var fg1function = 0;
var fg2function = 0;

var fg1fqmode = 2;
var fg2fqmode = 2;

var previousNewItem = 0;
var previousCh1Voltage = 0;
var previousCh2Voltage = 0;

var LINE_WIDTH = 0.008;
var osziSaw = 0.0;
var osziScreenDX = 0.5;
var osziScreenDY = 5.0;

var fg1time = 0.0;
var fg2time = 0.0;
var subTickTime = 0.001 * (new Date());

var mouseHold = false;

var FPS = 50;
var dt = 1.0 / FPS;
var counterStartTime = 0.001 * (new Date());
var lastTickTime = 0.001 * (new Date());
var counter = 0;
var measured_FPS = 0;

var buttons = []

var ch1divleds = [];
var ch2divleds = [];
var timedivleds = [];

var fg1fqmodeleds = []
var fg2fqmodeleds = []

var triggerled = 0;
var lastTriggerTime = 0;
var triggerledOn = false;
var triggernormbutton = 0;

var ch1divselection = 9;
var ch2divselection = 9;
var timedivselection = 6;

var ch1posslider = document.getElementById("ch1posslider");
var ch2posslider = document.getElementById("ch2posslider");
var timeposslider = document.getElementById("timeposslider");
var triggerlevelslider = document.getElementById("triggerlevelslider");

var audioCtx = 0;
var audioStarted = false;
var audioBuffer = 0;
var lastAudioBufferWriteTime = 0;
var fg1oscillator = 0;
var fg2oscillator = 0;
var fg1volume = 0;
var fg2volume = 0;

var svg_loaded_count = 0
for (svg of ALL_SVG_IMG) {
    svg.addEventListener("load", () => {
        svg_loaded_count++;
        if (svg_loaded_count == ALL_SVG_IMG.length) {
            all_loaded();
        }
    })
}

function all_loaded() {
	c.addEventListener('mousedown', canvasMousePress);

	triggerled = osziImg.contentDocument.getElementById("Trigd");

	dc1screen = netzteilImg1.contentDocument.getElementById("DISP_VOLTS_TEXT");
	dc2screen = netzteilImg2.contentDocument.getElementById("DISP_VOLTS_TEXT");

	fg1tonewaves = fgImg1.contentDocument.getElementById("ToneWaves");
	fg2tonewaves = fgImg2.contentDocument.getElementById("ToneWaves");
	
	addButton(osziImg, "BTN_ON", COLORS[5], 0, 0, TurnOnOff, true);
	
	addButton(osziImg, "Slope", COLORS[6]);
	addButton(osziImg, "BTN_TR_CH1", COLORS[6], 0, 2);
	addButton(osziImg, "BTN_TR_CH2", COLORS[6], 0, 2);
	addButton(osziImg, "BTN_Norm", COLORS[6]);
	
	addButton(osziImg, "BTN_ACDC1GRP", COLORS[0]);
	addButton(osziImg, "BTN_GND1GRP", COLORS[1]);
	addButton(osziImg, "BTN_ACDC2GRP", COLORS[0]);
	addButton(osziImg, "BTN_GND2GRP", COLORS[1]);
	
	addButton(osziImg, "BTN_UP_VCH1", COLORS[2], 2, 0, Ch1DivUp);
	addButton(osziImg, "BTN_DWN_VCH1", COLORS[2], 2, 0, Ch1DivDown);
	addButton(osziImg, "BTN_UP_VCH2", COLORS[2], 2, 0, Ch2DivUp);
	addButton(osziImg, "BTN_DWN_VCH2", COLORS[2], 2, 0, Ch2DivDown);
	addButton(osziImg, "BTN_UP_VCH21", COLORS[2], 2, 0, TimeDivUp);
	addButton(osziImg, "BTN_DWN_VCH11", COLORS[2], 2, 0, TimeDivDown);
	
	addButton(osziImg, "CH1", COLORS[4], 0, 1, SetCh1Tr);
	addButton(osziImg, "CH2", COLORS[4], 0, 1, SetCh2Tr);
	addButton(osziImg, "DUAL", COLORS[4], 0, 1);
	addButton(osziImg, "ADD", COLORS[4], 0, 1, SetCh1Tr);
	addButton(osziImg, "XY", COLORS[4], 0, 1);
	
	addButton(osziImg, "BTN2", COLORS[3], 0, 0, Ch1PosClick);
	addButton(osziImg, "BTN", COLORS[3], 0, 0, Ch2PosClick);
	addButton(osziImg, "BTN1", COLORS[3], 0, 0, TimePosClick);
	addButton(osziImg, "TriggerLevel", COLORS[3], 0, 0, TriggerLevelClick);
	
	addButton(osziImg, "BNC_CH1", 0, 2, 0, OpenCh1Menu, true);
	addButton(osziImg, "BNC_CH2", 0, 2, 0, OpenCh2Menu, true);

	addButton(fgImg1, "Knob_Freq", COLORS[7], 0, 0, Fg1FreqButton, true, "circle");
	addButton(fgImg1, "Knob_Amp", COLORS[7], 0, 0, Fg1AmpButton, true, "circle");
	addButton(fgImg1, "BTN_Function", COLORS[7], 2, 0, Fg1FunctionButton, true, "circle");
	addButton(fgImg1, "BTN_FREQ_UP", COLORS[2], 2, 0, Fg1FreqUpButton, true);
	addButton(fgImg1, "BTN_FREQ_DWN", COLORS[2], 2, 0, Fg1FreqDownButton, true);
	addButton(fgImg1, "ToneSpeaker", COLORS[8], 0, 0, Fg1Speaker, true);

	addButton(fgImg2, "Knob_Freq", COLORS[7], 0, 0, Fg2FreqButton, true, "circle");
	addButton(fgImg2, "Knob_Amp", COLORS[7], 0, 0, Fg2AmpButton, true, "circle");
	addButton(fgImg2, "BTN_Function", COLORS[7], 2, 0, Fg2FunctionButton, true, "circle");
	addButton(fgImg2, "BTN_FREQ_UP", COLORS[2], 2, 0, Fg2FreqUpButton, true);
	addButton(fgImg2, "BTN_FREQ_DWN", COLORS[2], 2, 0, Fg2FreqDownButton, true);
	addButton(fgImg2, "ToneSpeaker", COLORS[8], 0, 0, Fg2Speaker, true);
	

	addLed(ch1divleds, "_1mV_OFF", 0.001);
	addLed(ch1divleds, "_2mV_OFF", 0.002);
	addLed(ch1divleds, "_5mV_OFF", 0.005);
	addLed(ch1divleds, "_10mV_OFF", 0.01);
	addLed(ch1divleds, "_20mV_OFF", 0.02);
	addLed(ch1divleds, "_50mV_OFF", 0.05);
	addLed(ch1divleds, "V1_OFF", 0.1);
	addLed(ch1divleds, "V2_OFF", 0.2);
	addLed(ch1divleds, "V5_OFF", 0.5);
	addLed(ch1divleds, "_1V_OFF", 1);
	addLed(ch1divleds, "_2V_OFF", 2);
	addLed(ch1divleds, "_5V_OFF", 5);
	addLed(ch1divleds, "_10V_OFF", 10);
	addLed(ch1divleds, "_20V_OFF", 20);

	addLed(ch2divleds, "_1mV_OFF1", 0.001);
	addLed(ch2divleds, "_2mV_OFF1", 0.002);
	addLed(ch2divleds, "_5mV_OFF1", 0.005);
	addLed(ch2divleds, "_10mV_OFF1", 0.01);
	addLed(ch2divleds, "_20mV_OFF1", 0.02);
	addLed(ch2divleds, "_50mV_OFF1", 0.05);
	addLed(ch2divleds, "V1_OFF1", 0.1);
	addLed(ch2divleds, "V2_OFF1", 0.2);
	addLed(ch2divleds, "V5_OFF1", 0.5);
	addLed(ch2divleds, "_1V_OFF1", 1);
	addLed(ch2divleds, "_2V_OFF1", 2);
	addLed(ch2divleds, "_5V_OFF1", 5);
	addLed(ch2divleds, "_10V_OFF1", 10);
	addLed(ch2divleds, "_20V_OFF1", 20);

	/* disabled because too fast to properly display
	addLed(timedivleds, "us1_OFF", 0.0000001);
	addLed(timedivleds, "us2_OFF", 0.0000002);
	addLed(timedivleds, "us5_OFF", 0.0000005);
	addLed(timedivleds, "_1us_OFF", 0.000001);
	addLed(timedivleds, "_2us_OFF", 0.000002);
	addLed(timedivleds, "_5us_OFF", 0.000005);
	addLed(timedivleds, "_10us_OFF", 0.00001);
	*/
	addLed(timedivleds, "_20us_OFF", 0.00002);
	addLed(timedivleds, "_50us_OFF", 0.00005);
	addLed(timedivleds, "ms1_OFF", 0.0001);
	addLed(timedivleds, "ms2_OFF", 0.0002);
	addLed(timedivleds, "ms5_OFF", 0.0005);
	addLed(timedivleds, "_1ms_OFF", 0.001);
	addLed(timedivleds, "_2ms_OFF", 0.002);
	addLed(timedivleds, "_5ms_OFF", 0.005);
	addLed(timedivleds, "_10ms_OFF", 0.01);
	addLed(timedivleds, "_20ms_OFF", 0.02);
	addLed(timedivleds, "_50ms_OFF", 0.05);
	addLed(timedivleds, "s1_OFF", 0.1);
	addLed(timedivleds, "s2_OFF", 0.2);

	addLed(fg1fqmodeleds, "_10kHz_OFF", 10000, fgImg1);
	addLed(fg1fqmodeleds, "_1kHz_OFF", 1000, fgImg1);
	addLed(fg1fqmodeleds, "_100Hz_OFF", 100, fgImg1);
	addLed(fg1fqmodeleds, "_10Hz_OFF", 10, fgImg1);
	addLed(fg1fqmodeleds, "_1Hz_OFF", 1, fgImg1);

	addLed(fg2fqmodeleds, "_10kHz_OFF", 10000, fgImg2);
	addLed(fg2fqmodeleds, "_1kHz_OFF", 1000, fgImg2);
	addLed(fg2fqmodeleds, "_100Hz_OFF", 100, fgImg2);
	addLed(fg2fqmodeleds, "_10Hz_OFF", 10, fgImg2);
	addLed(fg2fqmodeleds, "_1Hz_OFF", 1, fgImg2);
	
	triggernormbutton = getButtonByName("BTN_Norm");
	updateWindowSize();
	updateConnectionDevides1();
	updateConnectionDevides2();
	updateFgFunctionLed();
	updateFgFqLed();
	window.setTimeout(tick, 0);

	console.log("hi")
}

function Ch1PosClick() {
	if (getButtonByName("BTN2")["pressed"]) {
		ch1posslider.style.display = "block";
	}
	else {
		ch1posslider.style.display = "none";
	}
}
function Ch2PosClick() {
	if (getButtonByName("BTN")["pressed"]) {
		ch2posslider.style.display = "block";
	}
	else {
		ch2posslider.style.display = "none";
	}
}
function TimePosClick() {
	if (getButtonByName("BTN1")["pressed"]) {
		timeposslider.style.display = "block";
	}
	else {
		timeposslider.style.display = "none";
	}
}
function TriggerLevelClick() {
	if (getButtonByName("TriggerLevel")["pressed"]) {
		triggerlevelslider.style.display = "block";
	}
	else {
		triggerlevelslider.style.display = "none";
	}
}

function TurnOnOff() {
	if (getButtonByName("BTN_ON")["pressed"]) {
		ch1divselection = 9;
		ch2divselection = 9;
		timedivselection = 6;
		ch1divleds[ch1divselection]["led"].setAttribute('style', 'fill: rgb(100, 200, 100)');
		ch2divleds[ch2divselection]["led"].setAttribute('style', 'fill: rgb(100, 200, 100)');
		timedivleds[timedivselection]["led"].setAttribute('style', 'fill: rgb(100, 200, 100)');
		buttons.forEach(function(item, index, array) {
			if (!item["worksOffline"]) {
				if (item["pressed"] == 1) {
					item["pressed"] = 0;
				}
				else if (item["pressed"] == 3) {
					item["pressed"] = 2;
				}
				if (item["name"] == "CH1" || item["name"] == "BTN_TR_CH1") {
					item["pressed"] = 1;
				}
				updateButtonColor(item, false);
			}
		});
	}
	else {
		ch1divleds[ch1divselection]["led"].setAttribute('style', 'fill: rgb(118,97,88)');
		ch2divleds[ch2divselection]["led"].setAttribute('style', 'fill: rgb(118,97,88)');
		timedivleds[timedivselection]["led"].setAttribute('style', 'fill: rgb(118,97,88)');
		resetSlider(ch1posslider);
		resetSlider(ch2posslider);
		resetSlider(timeposslider);
		resetSlider(triggerlevelslider);
		buttons.forEach(function(item, index, array) {
			if (!item["worksOffline"]) {
				if (item["pressed"] == 1) {
					item["pressed"] = 0;
				}
				else if (item["pressed"] == 3) {
					item["pressed"] = 2;
				}
				updateButtonColor(item, false);
			}
		});
	}
}

function resetSlider(slider) {
	slider.style.display = "none";
	slider.value = 0;
}

function addLed(arr, name, value, svg = osziImg) {
	arr.push({
		led: svg.contentDocument.getElementById(name),
		value: value
	});
}

function Ch1DivUp() {
	ch1divleds[ch1divselection]["led"].setAttribute('style', 'fill: rgb(118,97,88)');
	if (ch1divselection < ch1divleds.length - 1) {
		ch1divselection++;
	}
	ch1divleds[ch1divselection]["led"].setAttribute('style', 'fill: rgb(100, 200, 100)');
}
function Ch1DivDown() {
	ch1divleds[ch1divselection]["led"].setAttribute('style', 'fill: rgb(118,97,88)');
	if (ch1divselection > 0) {
		ch1divselection--;
	}
	ch1divleds[ch1divselection]["led"].setAttribute('style', 'fill: rgb(100, 200, 100)');
}

function Ch2DivUp() {
	ch2divleds[ch2divselection]["led"].setAttribute('style', 'fill: rgb(118,97,88)');
	if (ch2divselection < ch2divleds.length - 1) {
		ch2divselection++;
	}
	ch2divleds[ch2divselection]["led"].setAttribute('style', 'fill: rgb(100, 200, 100)');
}
function Ch2DivDown() {
	ch2divleds[ch2divselection]["led"].setAttribute('style', 'fill: rgb(118,97,88)');
	if (ch2divselection > 0) {
		ch2divselection--;
	}
	ch2divleds[ch2divselection]["led"].setAttribute('style', 'fill: rgb(100, 200, 100)');
}

function TimeDivUp() {
	timedivleds[timedivselection]["led"].setAttribute('style', 'fill: rgb(118,97,88)');
	if (timedivselection < timedivleds.length - 1) {
		timedivselection++;
	}
	timedivleds[timedivselection]["led"].setAttribute('style', 'fill: rgb(100, 200, 100)');
}
function TimeDivDown() {
	timedivleds[timedivselection]["led"].setAttribute('style', 'fill: rgb(118,97,88)');
	if (timedivselection > 0) {
		timedivselection--;
	}
	timedivleds[timedivselection]["led"].setAttribute('style', 'fill: rgb(100, 200, 100)');
}

function SetCh1Tr() {
	if (!getButtonByName("BTN_TR_CH1")["pressed"]) {
		buttonPressed(getButtonByName("BTN_TR_CH1"));
		buttonReleased(getButtonByName("BTN_TR_CH1"), false);
	}
}
function SetCh2Tr() {
	if (!getButtonByName("BTN_TR_CH2")["pressed"]) {
		buttonPressed(getButtonByName("BTN_TR_CH2"));
		buttonReleased(getButtonByName("BTN_TR_CH2"), false);
	}
}

function addButton(svgfile, name, color, pressed = 0, group = 0, action = 0, worksOffline = false, queryString = "path") {
	// pressed 0: by default off, 1: by default on, 2: not a toggle but a click button, 3: not a toggle but a currently pressed click button
	button = svgfile.contentDocument.getElementById(name);

	button.addEventListener("mousedown",  mousePress);
	button.addEventListener("mouseup",  mouseRelease);
	button.addEventListener("mouseenter",  mouseEnter);
	button.addEventListener("mouseleave",  mouseLeave);

    button.style.cursor = "pointer";

	buttonItem = {
			button: button,
			name: name,
			svgfile: svgfile,
			pressed: pressed,
			color: color,
			group: group,
			action: action,
            worksOffline: worksOffline,
            queryString: queryString
		};

	buttons.push(buttonItem);
	updateButtonColor(buttonItem, false, false);
}

function canvasMousePress(e) {}

function mousePress(e) {
	buttonPressed(getButtonByName(e.currentTarget.id, getSvgByDoc(e.srcElement.ownerDocument)));
}

function mouseRelease(e) {
	buttonReleased(getButtonByName(e.currentTarget.id, getSvgByDoc(e.srcElement.ownerDocument)), true);
}

function mouseEnter(e) {
	updateButtonColor(getButtonByName(e.currentTarget.id, getSvgByDoc(e.srcElement.ownerDocument)), true);
}

function mouseLeave(e) {
	buttonReleased(getButtonByName(e.currentTarget.id, getSvgByDoc(e.srcElement.ownerDocument)), false);
}

function getSvgByDoc(doc) {
	result = undefined;
	ALL_SVG_IMG.forEach(function(item, index, array) {
		if (item.contentDocument == doc) {
			result = item;
			return;
		}
	});
	return result;
}

function getButtonByName(name, svgfile = osziImg) {
	result = undefined;
	buttons.forEach(function(item, index, array) {
		if (item["name"] == name && item["svgfile"] == svgfile) {
			result = item;
			return;
		}
	});
	return result;
}

function buttonPressed(button) {
	if (getButtonByName("BTN_ON")["pressed"] || button["worksOffline"]) {
		if (button["pressed"] == 0) {
			button["pressed"] = 1;
		}
		else if (button["pressed"] == 1) {
			button["pressed"] = 0;
		}
		else if (button["pressed"] == 2) {
			button["pressed"] = 3;
		}

		if (button["group"] != 0) {
			buttons.forEach(function(item, index, array) {
				if (item != button && item["group"] == button["group"]) {
					item["pressed"] = 0;
					updateButtonColor(item, false);
				}
			});
		}
		updateButtonColor(button, true);
		if (button["action"] != 0) {
			button["action"]();
		}
	}
}

function buttonReleased(button, hovered) {
	if (button["pressed"] == 3) {
		button["pressed"] = 2;
	}
	updateButtonColor(button, hovered);
}

function updateButtonColor(button, hovered) {
    if (button["color"] != 0) {
        pressed = false;
        if (button["pressed"] == 1 || button["pressed"] == 3) {
            pressed = true;
        }
        if (pressed) {
            if (hovered) {
                button["button"].querySelector(button["queryString"]).setAttribute('style', 'fill: ' + button["color"][2]);
            }
            else {
                button["button"].querySelector(button["queryString"]).setAttribute('style', 'fill: ' + button["color"][3]);
            }
        }
        else {
            if (hovered) {
                button["button"].querySelector(button["queryString"]).setAttribute('style', 'fill: ' + button["color"][1]);
            }
            else {
                button["button"].querySelector(button["queryString"]).setAttribute('style', 'fill: ' + button["color"][0]);
            }
        }
    }
}
	
function OpenCh1Menu() {
    if (inputsch1.style.display == "block") {
        inputsch1.style.display = "none";
    }
    else {
        inputsch1.style.display = "block";
    }
}

function OpenCh2Menu() {
    if (inputsch2.style.display == "block") {
        inputsch2.style.display = "none";
    }
    else {
        inputsch2.style.display = "block";
    }
}

function CreateDisplayVoltageString(x) {
	prefix = " ";
	if (x < 0) {
		prefix = "";
	}
	if (x * x < 100) {
		return prefix + SliderAmpToRealAmp(x).toPrecision(1) + "V";
	}
	else {
		return prefix + SliderAmpToRealAmp(x).toPrecision(2) + "V";
	}
}
function CreateDisplayFrequencyString(x) {
	return SliderFqToRealFq(x).toPrecision(6) + " Hz";
}

function GetFg1Freq() {
	return fg1fqmodeleds[fg1fqmode]["value"] * SliderFqToRealFq(parseInt(fg1fqslider.value) + parseInt(fg1fqfineslider.value) / 50);
}
function GetFg2Freq() {
	return fg2fqmodeleds[fg2fqmode]["value"] * SliderFqToRealFq(parseInt(fg2fqslider.value) + parseInt(fg2fqfineslider.value) / 50);
}

function tick() {
	var tickTime = 0.001 * (new Date());
	var dt_measured = tickTime - lastTickTime;
	
	dc1screen.textContent = CreateDisplayVoltageString(dc1slider.value);
	dc2screen.textContent = CreateDisplayVoltageString(dc2slider.value);
	
	if (fg1oscillator != 0) {
		updateFg1Freq();
	}
	if (fg2oscillator != 0) {
		updateFg2Freq();
	}

	if (!osziFrozen) {

		timegridratio = 2 * OSZI_GRID_TO_CANVAS_RATIO_X * timedivleds[timedivselection]["value"];


		ctxbuf.clearRect(0, 0, c.width, c.height);
		ctxbuf.globalAlpha = 1.0 - 20 * dt_measured;
		ctxbuf.drawImage(c, 0, 0);
		ctx.clearRect(0, 0, c.width, c.height);
		ctx.drawImage(cbuf, 0, 0);

		ratioch1 = OSZI_GRID_TO_CANVAS_RATIO_Y;
		ratioch2 = OSZI_GRID_TO_CANVAS_RATIO_Y;
		if (getButtonByName("XY")["pressed"]) {
			ratioch1 = OSZI_GRID_TO_CANVAS_RATIO_X;
			triggerledOn = false;
		}

		ch1ac = getButtonByName("BTN_ACDC1GRP")["pressed"];
		ch2ac = getButtonByName("BTN_ACDC2GRP")["pressed"];
		ch1ground = getButtonByName("BTN_GND1GRP")["pressed"];
		ch2ground = getButtonByName("BTN_GND2GRP")["pressed"];
		ch1ac = getButtonByName("BTN_ACDC1GRP")["pressed"];
		ch2ac = getButtonByName("BTN_ACDC2GRP")["pressed"];

		abort_frame = false;

		for (var i = 0; i < DEFAULT_SAMPLERATE; ++i) {
			if (abort_frame) {
				break;
			}
			subTickTime = lastTickTime + i * dt_measured / DEFAULT_SAMPLERATE;
			osziSaw += dt_measured / osziScreenDX / DEFAULT_SAMPLERATE;
			fg1time += dt_measured * GetFg1Freq() / DEFAULT_SAMPLERATE;
			fg2time += dt_measured * GetFg2Freq() / DEFAULT_SAMPLERATE;
			
			ch1 = 0;
			if (!ch1ground) {
				if (ch1ac && inputsch1.value == "dc") {
					ch1 = 0;
				}
				else {
					ch1 = ch1connection();
				}
			}
			ch2 = 0;
			if (!ch2ground) {
				if (ch2ac && inputsch2.value == "dc") {
					ch2 = 0;
				}
				else {
					ch2 = ch2connection();
				}
			}
			newItem = 0;
			if (getButtonByName("BTN_ON")["pressed"]) {
				newItem = 0;
				if (getButtonByName("CH1")["pressed"]) {
					newItem = {
						x: osziSaw / timegridratio + timeposslider.value / 100,
						y1: - ch1 / ch1divleds[ch1divselection]["value"] / ratioch1 + 0.5 - ch1posslider.value / 100,
						y2: undefined,
						birth: subTickTime
					};
				}
				else if (getButtonByName("CH2")["pressed"]) {
					newItem = {
						x: osziSaw / timegridratio + timeposslider.value / 100,
						y1: undefined,
						y2: -ch2 / ch2divleds[ch2divselection]["value"] / ratioch2 + 0.5 - ch2posslider.value / 100,
						birth: subTickTime
					};
				}
				else if (getButtonByName("DUAL")["pressed"]) {
					newItem = {
						x: osziSaw / timegridratio + timeposslider.value / 100,
						y1: -ch1 / ch1divleds[ch1divselection]["value"] / ratioch1 + 0.5 - ch1posslider.value / 100,
						y2: -ch2 / ch2divleds[ch2divselection]["value"] / ratioch2 + 0.5 - ch2posslider.value / 100,
						birth: subTickTime
					};
				}
				else if (getButtonByName("ADD")["pressed"]) {
					newItem = {
						x: osziSaw / timegridratio + timeposslider.value / 100,
						y1: -(ch1 + ch2) / ch1divleds[ch1divselection]["value"] / ratioch1 + 0.5 - ch1posslider.value / 100,
						y2: undefined,
						birth: subTickTime
					};
				}
				else if (getButtonByName("XY")["pressed"]) {
					newItem = {
						x: ch1 / ch1divleds[ch1divselection]["value"] / ratioch1 + 0.5 - ch1posslider.value / 100,
						y1: -ch2 / ch2divleds[ch2divselection]["value"] / ratioch2 + 0.5 - ch2posslider.value / 100,
						y2: undefined,
						birth: subTickTime
					};
				}

				data_buffer[data_buffer_it] = [subTickTime, ch1, ch2];
				if (osziSaw > 1.02 * timegridratio && data_buffer_end == 0) {
					data_buffer_end = data_buffer_it;
					data_buffer_it = 0;
					if (aboutToPause) {
						FreezeOszi();
						abort_frame = true;
					}
				}
				if (++data_buffer_it >= data_buffer.length) {
					data_buffer_it = 0;
					data_buffer_full = true;
				}
				
				if (!getButtonByName("XY")["pressed"]) {
					if (!abort_frame) {
						if (getButtonByName("BTN_TR_CH1")["pressed"] || getButtonByName("BTN_TR_CH2")["pressed"]) {
							if (previousNewItem != 0 && osziSaw > 1.02 * timegridratio) {
								if (
									(getButtonByName("BTN_TR_CH1")["pressed"] &&
									((!getButtonByName("Slope")["pressed"] && previousCh1Voltage < getTriggerLevel() && ch1 >= getTriggerLevel()) || (getButtonByName("Slope")["pressed"] && previousCh1Voltage >= getTriggerLevel() && ch1 < getTriggerLevel()))
									)
									|| (getButtonByName("BTN_TR_CH2")["pressed"] &&
									((!getButtonByName("Slope")["pressed"] && previousCh2Voltage < getTriggerLevel() && ch2 >= getTriggerLevel()) || (getButtonByName("Slope")["pressed"] && previousCh2Voltage >= getTriggerLevel() && ch2 < getTriggerLevel()))
									)
								) {
									triggerledOn = true;
									lastTriggerTime = tickTime;
									osziSaw = -0.02 * timegridratio;
									data_buffer_it = 0;
									data_buffer_end = 0;
									data_buffer_full = false;
								}
								else {
									if (tickTime - lastTriggerTime > 2 * timegridratio) {
										triggerledOn = false;
										if (!getButtonByName("BTN_Norm")["pressed"]) {
											lastTriggerTime = tickTime;
											osziSaw = -0.02 * timegridratio;
											data_buffer_it = 0;
											data_buffer_end = 0;
											data_buffer_full = false;
										}
									}
								}
							}
						}
						else {
							triggerledOn = false;
							if (osziSaw > 1.02 * timegridratio) {
								osziSaw -= 1.04 * timegridratio;
								data_buffer_it = 0;
								data_buffer_end = 0;
							}
						}
					}
				}
				else {
					osziSaw = -0.02 * timegridratio;
					data_buffer_end = 0;
				}
				
				previousCh1Voltage = ch1;
				previousCh2Voltage = ch2;

				
				ctx.strokeStyle = "rgba(255, 255, 255, 1.0)";
				difX = newItem["x"] - previousNewItem["x"];
				if (difX * difX < 0.5) {
					ctx.beginPath();
					ctx.lineWidth = LINE_WIDTH * c.width;
					if (getButtonByName("DUAL")["pressed"]) {
						ctx.strokeStyle = "rgba(255, 255, 0, 1.0)";
					}
					ctx.moveTo(previousNewItem["x"] * c.width, previousNewItem["y1"] * c.height)
					ctx.lineTo(newItem["x"] * c.width, newItem["y1"] * c.height)
					ctx.stroke();
					ctx.beginPath();
					if (getButtonByName("DUAL")["pressed"]) {
						ctx.strokeStyle = "rgba(0, 255, 255, 1.0)";
					}
					ctx.moveTo(previousNewItem["x"] * c.width, previousNewItem["y2"] * c.height)
					ctx.lineTo(newItem["x"] * c.width, newItem["y2"] * c.height)
					ctx.stroke();
				}

			}
			else {
				osziSaw = timegridratio;
			}
			previousNewItem = newItem;
		}
		
		if (getButtonByName("TriggerLevel")["pressed"]) {
			ctx.lineWidth = 0.5 * LINE_WIDTH * c.width;
			triggerlevel = 0;
			if (getButtonByName("BTN_TR_CH1")["pressed"]) {
				triggerlevel = -getTriggerLevel() / ch1divleds[ch1divselection]["value"] / OSZI_GRID_TO_CANVAS_RATIO_Y + 0.5 - ch1posslider.value / 100;
			}
			else if (getButtonByName("BTN_TR_CH2")["pressed"]) {
				triggerlevel = -getTriggerLevel() / ch2divleds[ch1divselection]["value"] / OSZI_GRID_TO_CANVAS_RATIO_Y + 0.5 - ch2posslider.value / 100;
			}
			ctx.strokeStyle = "rgba(255, 0, 0, 1.0)";
			ctx.moveTo(-0.1 * c.width, triggerlevel * c.height);
			ctx.lineTo(1.1 * c.width, triggerlevel * c.height);
			ctx.stroke();
		}

		if (triggerledOn) {
			triggerled.querySelector("path").setAttribute('style', 'fill: rgb(0, 200, 0)');
		}
		else {
			triggerled.querySelector("path").setAttribute('style', 'fill: rgb(100, 100, 100)');
		}

		counter++;
	}
	if (tickTime - counterStartTime > 1.0) {
		measured_FPS = Math.round(counter / (tickTime - counterStartTime));
		if (showFps) {
			document.getElementById("FPS").innerHTML = measured_FPS + " FPS";
		}
		else {
			document.getElementById("FPS").innerHTML = "";
		}
		counter = 0;
		counterStartTime = tickTime;
	}
	lastTickTime = tickTime;
	window.setTimeout(tick, 0);
}

function ch1connection() {
    if (inputsch1.value == "none") {
        return 0;
    }
    else if (inputsch1.value == "dc") {
	    return SliderAmpToRealAmp(dc1slider.value);
    }
    else if (inputsch1.value == "fg") {
	    return SliderAmpToRealAmp(fg1ampslider.value) * fgFunction(fg1time, fg1function);
    }
    else if (inputsch1.value == "mic") {
		return micConnection();
    }
}
function ch2connection() {
    if (inputsch2.value == "none") {
        return 0;
    }
    else if (inputsch2.value == "dc") {
	    return SliderAmpToRealAmp(dc2slider.value);
    }
    else if (inputsch2.value == "fg") {
	    return SliderAmpToRealAmp(fg2ampslider.value) * fgFunction(fg2time, fg2function);
    }
    else if (inputsch2.value == "mic") {
		return micConnection();
    }
}

function fgFunction(time, mode) {
	if (mode == 0) {
		return Math.sin(time * 2 * Math.PI);
	}
	else if (mode == 1) {
		if (Math.round(2 * time + 1.5) % 2 == 0) {
			return 1;
		}
		else {
			return -1;
		}
	}
	else if (mode == 2) {
		a = Math.round(2 * time);
		b = 2 * time - a;
		if (a % 2 == 0) {
			return 2 * b;
		}
		else {
			return -2 * b;
		}
	}
	return 0;
}

function micConnection() {
	if (audioBuffer == 0) {
		return 0;
	}
	else {
		index = Math.round((subTickTime - lastAudioBufferWriteTime) / audioBuffer.duration * audioBuffer.length);
		return audioBuffer.getChannelData(0)[index];
	}
}

function getTriggerLevel() {
	if (!triggernormbutton["pressed"]) {
		return 0;
	}
	if (triggerlevelslider.value > 50) {
		return Math.pow(10, (triggerlevelslider.value - 50) / 50);
	}
	else if (triggerlevelslider.value < -50) {
		return -Math.pow(10, (-triggerlevelslider.value - 50) / 50);
	}
	else {
		return triggerlevelslider.value / 50;
	}
}

function updateWindowSize() {
	w = 0.8 * window.innerWidth;
	h = 0.8 * OSZI_ASPECT_RATIO * window.innerWidth;
	osziImg.width = w;
	osziImg.height = h;
	osziposx = 0.1 * window.innerWidth;
	osziposy = 0.05 * OSZI_ASPECT_RATIO * window.innerWidth;
	osziImg.style.left = osziposx + 'px';
	osziImg.style.top = osziposy + 'px';

	netzteilratio = 1765.0 / 778.0;
    netzteilscale = 0.15;
    netzteilImg1.width = netzteilscale * w;
    netzteilImg2.width = netzteilscale * w;
    netzteilImg1.height = netzteilratio * netzteilImg1.width;
    netzteilImg2.height = netzteilratio * netzteilImg2.width;
	netzteilImg1.style.left = (osziposx + 0.25 * w - 0.5 * netzteilImg1.width) + 'px';
	netzteilImg2.style.left = (osziposx + 0.75 * w - 0.5 * netzteilImg1.width) + 'px';
	netzteilImg1.style.top = (osziposy + 1.0 * h) + 'px';
	netzteilImg2.style.top = (osziposy + 1.0 * h) + 'px';
	dc1slider.style.left = (osziposx + 0.25 * w - 0.5 * netzteilImg1.width) + 'px';
	dc2slider.style.left = (osziposx + 0.75 * w - 0.5 * netzteilImg1.width) + 'px';
	dc1slider.style.top = (osziposy + 0.5 * netzteilImg1.height + 1.0 * h) + 'px';
	dc2slider.style.top = (osziposy + 0.5 * netzteilImg2.height + 1.0 * h) + 'px';
	dc1slider.style.width = 0.82 * netzteilImg1.height + 'px';
	dc2slider.style.width = 0.82 * netzteilImg2.height + 'px';

	fgratio = 990.0 / 2530.0;
	fgscale = 0.49;
	fgImg1.width = fgscale * w;
	fgImg2.width = fgscale * w;
	fgImg1.height = fgratio * fgImg1.width;
	fgImg2.height = fgratio * fgImg2.width;
	fgImg1.style.left = (osziposx + 0.25 * w - 0.5 * fgImg1.width) + 'px';
	fgImg2.style.left = (osziposx + 0.75 * w - 0.5 * fgImg2.width) + 'px';
	fgImg1.style.top = (osziposy + 1.02 * h) + 'px';
	fgImg2.style.top = (osziposy + 1.02 * h) + 'px';
	fgSliders1 = [fg1ampslider, fg1fqslider, fg1fqfineslider];
	fgSliders1.forEach(function(item, index, array) {
		item.style.left = (osziposx + (0.27 + 0.015 * index) * w - 0.5 * fgImg1.width) + 'px';
		item.style.top = (osziposy + 0.5 * fgImg1.height + 1.02 * h) + 'px';
		item.style.width = 0.82 * fgImg1.height + 'px';
	});
	fg1ampslider.style.left = (osziposx + 0.5 * w - 0.5 * fgImg1.width) + 'px';
	fgSliders2 = [fg2ampslider, fg2fqslider, fg2fqfineslider];
	fgSliders2.forEach(function(item, index, array) {
		item.style.left = (osziposx + (0.77 + 0.015 * index) * w - 0.5 * fgImg2.width) + 'px';
		item.style.top = (osziposy + 0.5 * fgImg2.height + 1.02 * h) + 'px';
		item.style.width = 0.82 * fgImg2.height + 'px';
	});
	fg2ampslider.style.left = (osziposx + 1.0 * w - 0.5 * fgImg2.width) + 'px';

	micRatio = 2.0;
	micScale = 0.15;
    micImg1.width = micScale * w;
    micImg2.width = micScale * w;
    micImg1.height = micRatio * micImg1.width;
    micImg2.height = micRatio * micImg2.width;
	micImg1.style.left = (osziposx + 0.25 * w - 0.5 * micImg1.width) + 'px';
	micImg2.style.left = (osziposx + 0.75 * w - 0.5 * micImg2.width) + 'px';
	micImg1.style.top = (osziposy + 1.0 * h) + 'px';
	micImg2.style.top = (osziposy + 1.0 * h) + 'px';

	c.width = w * OSZI_SCREEN_POS[2];
	c.height = h * OSZI_SCREEN_POS[3];
	cbuf.width = w * OSZI_SCREEN_POS[2];
	cbuf.height = h * OSZI_SCREEN_POS[3];
	cbuf.style.display = 'none';
	c.style.left = (osziposx + w * OSZI_SCREEN_POS[0]) + 'px';
	c.style.top = (osziposy + h * OSZI_SCREEN_POS[1]) + 'px';
	
	slider1 = document.getElementById("ch1posslider");
	slider1.style.left = osziposx + w * SLIDER_POS[0][0] + 'px';
	slider1.style.top = osziposy + h * SLIDER_POS[0][1] + 'px';
	slider2 = document.getElementById("ch2posslider");
	slider2.style.left = osziposx + w * SLIDER_POS[1][0] + 'px';
	slider2.style.top = osziposy + h * SLIDER_POS[1][1] + 'px';
	sliderx = document.getElementById("timeposslider");
	sliderx.style.left = osziposx + w * SLIDER_POS[2][0] + 'px';
	sliderx.style.top = osziposy + h * SLIDER_POS[2][1] + 'px';
	slidert = document.getElementById("triggerlevelslider");
	slidert.style.left = osziposx + w * SLIDER_POS[3][0] + 'px';
	slidert.style.top = osziposy + h * SLIDER_POS[3][1] + 'px';

    inputsch1.style.left = osziposx + w * COMBOBOX_POS[0][0] + 'px';
    inputsch1.style.top = osziposy + h * COMBOBOX_POS[0][1] + 'px';
    inputsch2.style.left = osziposx + w * COMBOBOX_POS[1][0] + 'px';
    inputsch2.style.top = osziposy + h * COMBOBOX_POS[1][1] + 'px';
}

function updateConnectionDevides1() {
	netzteilImg1.style.visibility = "hidden";
	dc1slider.style.display = "none";
	fgImg1.style.visibility = "hidden";
	fg1ampslider.style.display = "none";
	fg1fqslider.style.display = "none";
	fg1fqfineslider.style.display = "none";
	micImg1.style.visibility = "hidden";
	if (inputsch1.value == "dc") {
		netzteilImg1.style.visibility = "visible";
		dc1slider.style.display = "block";
	}
	else if (inputsch1.value == "fg") {
		getButtonByName("Knob_Freq", fgImg1)["pressed"] = false;
		getButtonByName("Knob_Amp", fgImg1)["pressed"] = false;
		updateButtonColor(getButtonByName("Knob_Freq", fgImg1), false)
		updateButtonColor(getButtonByName("Knob_Amp", fgImg1), false)
	fgImg1.style.visibility = "visible";
	} else if (inputsch1.value == "mic") {
		micImg1.style.visibility = "visible";
		if (!audioStarted) {
			initAudio();
		}
	}
	if (audioStarted && inputsch1.value != "mic" && inputsch2.value != "mic") {
		stopAudio();
	}
}
function updateConnectionDevides2() {
	netzteilImg2.style.visibility = "hidden";
	dc2slider.style.display = "none";
	fgImg2.style.visibility = "hidden";
	fg2ampslider.style.display = "none";
	fg2fqslider.style.display = "none";
	fg2fqfineslider.style.display = "none";
	micImg2.style.visibility = "hidden";
	if (inputsch2.value == "dc") {
		netzteilImg2.style.visibility = "visible";
		dc2slider.style.display = "block";
	}
	else if (inputsch2.value == "fg") {
		getButtonByName("Knob_Freq", fgImg2)["pressed"] = false;
		getButtonByName("Knob_Amp", fgImg2)["pressed"] = false;
		updateButtonColor(getButtonByName("Knob_Freq", fgImg2), false)
		updateButtonColor(getButtonByName("Knob_Amp", fgImg2), false)
		fgImg2.style.visibility = "visible";
	}
	else if (inputsch2.value == "mic") {
		micImg1.style.visibility = "visible";
		if (!audioStarted) {
			initAudio();
		}
	}
	if (audioStarted && inputsch1.value != "mic" && inputsch2.value != "mic") {
		stopAudio();
	}
}

function initAudioContext() {
	if (audioCtx == 0) {
		audioCtx = new AudioContext();
	}
}

function initAudio() {
	try {
		initAudioContext();
		const GotAudioStream = function(stream) {
			const audioSource = audioCtx.createMediaStreamSource(stream);
			const audioProcessor = audioCtx.createScriptProcessor(1024, 1, 1);
			audioSource.connect(audioProcessor);
			audioProcessor.connect(audioCtx.destination);
			audioStarted = true;
			audioProcessor.onaudioprocess = function(e) {
				saveAudioBuffer(e.inputBuffer);
			};
		};
		navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(GotAudioStream);
	}
	catch (err) {
		console.log(err);
	}
}

function stopAudio() {
	audioCtx.close();
	audioStarted = false;
}

function saveAudioBuffer(buf) {
	lastAudioBufferWriteTime = 0.001 * (new Date());
	audioBuffer = buf
}

function SliderAmpToRealAmp(value) {
	return 0.1 * value;
}

function SliderFqToRealFq(value) {
	return Math.pow(10, value / 100);
}

function FreezeButton() {
	if (timedivleds[timedivselection]["value"] <= 0.01 && !osziFrozen && !getButtonByName("XY")["pressed"]) {
		document.getElementById("freeze").disabled = true;
		aboutToPause = true;
	}
	else {
		FreezeOszi();
	}
}

function FreezeOszi() {
	aboutToPause = false;
	document.getElementById("freeze").disabled = false;
	osziFrozen = !osziFrozen;
	if (osziFrozen) {
		document.getElementById("freeze").innerHTML = "Resume Oszilloscope";
		document.getElementById("download").disabled = false;
	}
	else {
		document.getElementById("freeze").innerHTML = "Freeze Oszilloscope";
		document.getElementById("download").disabled = true;
	}
}

function DownloadButton() {
	datalength = data_buffer_end;
	if (getButtonByName("XY")["pressed"] || datalength == 0 || data_buffer_full) {
		datalength = data_buffer.length;
	}
	filetext = "";
	for (var i = 0; i < datalength; ++i) {
		filetext += (1000 * (data_buffer[i][0] - data_buffer[0][0])) + ", " + data_buffer[i][1] + ", " + data_buffer[i][2] + ", " + "\n";
	}
	filename = "data.csv";
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(filetext));
	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}

function Fg1FreqButton() {
	if (getButtonByName("Knob_Freq", fgImg1)["pressed"]) {
		fg1fqslider.style.display = "block";
		fg1fqfineslider.style.display = "block";
	}
	else {
		fg1fqslider.style.display = "none";
		fg1fqfineslider.style.display = "none";
	}
}
function Fg2FreqButton() {
	if (getButtonByName("Knob_Freq", fgImg2)["pressed"]) {
		fg2fqslider.style.display = "block";
		fg2fqfineslider.style.display = "block";
	}
	else {
		fg2fqslider.style.display = "none";
		fg2fqfineslider.style.display = "none";
	}
}

function Fg1AmpButton() {
	if (getButtonByName("Knob_Amp", fgImg1)["pressed"]) {
		fg1ampslider.style.display = "block";
	}
	else {
		fg1ampslider.style.display = "none";
	}
}
function Fg2AmpButton() {
	if (getButtonByName("Knob_Amp", fgImg2)["pressed"]) {
		fg2ampslider.style.display = "block";
	}
	else {
		fg2ampslider.style.display = "none";
	}
}

function Fg1FunctionButton() {
	fg1function = (fg1function + 1) % 3;
	updateFgFunctionLed();
}
function Fg2FunctionButton() {
	fg2function = (fg2function + 1) % 3;
	updateFgFunctionLed();
}

function Fg1FreqUpButton() {
	fg1fqmode++;
	if (fg1fqmode > fg1fqmodeleds.length - 1) {
		fg1fqmode = fg1fqmodeleds.length - 1;
	}
	updateFgFqLed();
}
function Fg2FreqUpButton() {
	fg2fqmode++;
	if (fg2fqmode > fg2fqmodeleds.length - 1) {
		fg2fqmode = fg2fqmodeleds.length - 1;
	}
	updateFgFqLed();
}

function Fg1FreqDownButton() {
	fg1fqmode--;
	if (fg1fqmode < 0) {
		fg1fqmode = 0;
	}
	updateFgFqLed();
}
function Fg2FreqDownButton() {
	fg2fqmode--;
	if (fg2fqmode < 0) {
		fg2fqmode = 0;
	}
	updateFgFqLed();
}

function updateFgFqLed() {
	fg1fqmodeleds.forEach(function(item, index, array) {
		if (index == fg1fqmode) {
			item["led"].setAttribute('style', 'fill: rgb(100, 200, 100)');
		}
		else {
			item["led"].setAttribute('style', 'fill: rgb(118,97,88)');
		}
	});
	fg2fqmodeleds.forEach(function(item, index, array) {
		if (index == fg2fqmode) {
			item["led"].setAttribute('style', 'fill: rgb(100, 200, 100)');
		}
		else {
			item["led"].setAttribute('style', 'fill: rgb(118,97,88)');
		}
	});
}

function updateFgFunctionLed() {
	fgImg1.contentDocument.getElementById("Auswahl_Sine").querySelector("circle").setAttribute('style', 'fill: rgb(88,88,88)');
	fgImg1.contentDocument.getElementById("Auswahl_Square").querySelector("circle").setAttribute('style', 'fill: rgb(88,88,88)');
	fgImg1.contentDocument.getElementById("Auswahl_Triangle").querySelector("circle").setAttribute('style', 'fill: rgb(88,88,88)');
	fgImg2.contentDocument.getElementById("Auswahl_Sine").querySelector("circle").setAttribute('style', 'fill: rgb(88,88,88)');
	fgImg2.contentDocument.getElementById("Auswahl_Square").querySelector("circle").setAttribute('style', 'fill: rgb(88,88,88)');
	fgImg2.contentDocument.getElementById("Auswahl_Triangle").querySelector("circle").setAttribute('style', 'fill: rgb(88,88,88)');
	if (fg1function == 0) {
		fgImg1.contentDocument.getElementById("Auswahl_Sine").querySelector("circle").setAttribute('style', 'fill: rgb(88,200,88)');
	}
	else if (fg1function == 1) {
		fgImg1.contentDocument.getElementById("Auswahl_Square").querySelector("circle").setAttribute('style', 'fill: rgb(88,200,88)');
	}
	else if (fg1function == 2) {
		fgImg1.contentDocument.getElementById("Auswahl_Triangle").querySelector("circle").setAttribute('style', 'fill: rgb(88,200,88)');
	}
	if (fg2function == 0) {
		fgImg2.contentDocument.getElementById("Auswahl_Sine").querySelector("circle").setAttribute('style', 'fill: rgb(88,200,88)');
	}
	else if (fg2function == 1) {
		fgImg2.contentDocument.getElementById("Auswahl_Square").querySelector("circle").setAttribute('style', 'fill: rgb(88,200,88)');
	}
	else if (fg2function == 2) {
		fgImg2.contentDocument.getElementById("Auswahl_Triangle").querySelector("circle").setAttribute('style', 'fill: rgb(88,200,88)');
	}
}

function Fg1Speaker() {
	
	if (getButtonByName("ToneSpeaker", fgImg1)["pressed"]) {
		fg1tonewaves.setAttribute('style', 'display: block');

		initAudioContext();
		fg1volume = audioCtx.createGain();
		fg1volume.connect(audioCtx.destination);
		fg1oscillator = audioCtx.createOscillator();
		fg1oscillator.connect(fg1volume);
		fg1oscillator.connect(audioCtx.destination);
		updateFg1Freq();
		fg1oscillator.start();
	}
	else {
		fg1tonewaves.setAttribute('style', 'display: none');
		
		fg1oscillator.stop();
	}
}
function Fg2Speaker() {
	if (getButtonByName("ToneSpeaker", fgImg2)["pressed"]) {
		fg2tonewaves.setAttribute('style', 'display: block');
		
		initAudioContext();
		fg2volume = audioCtx.createGain();
		fg2volume.connect(audioCtx.destination);
		fg2oscillator = audioCtx.createOscillator();
		fg2oscillator.connect(fg2volume);
		fg2oscillator.connect(audioCtx.destination);
		updateFg2Freq();
		fg2oscillator.start();
	}
	else {
		fg2tonewaves.setAttribute('style', 'display: none');

		fg2oscillator.stop();
	}
}

function updateFg1Freq() {
	if (fg1function == 0) {
		fg1oscillator.type = 'sine';
	}
	else if (fg1function == 1) {
		fg1oscillator.type = 'square';
	}
	else if (fg1function == 2) {
		fg1oscillator.type = 'triangle';
	}
	fq = GetFg1Freq();
	if (fq > 24000) {
		fq = 24000;
	}
	fg1oscillator.frequency.value = fq;
	fg1volume.gain.value = fg1ampslider.value / 10	;
}
function updateFg2Freq() {
	if (fg2function == 0) {
		fg2oscillator.type = 'sine';
	}
	else if (fg2function == 1) {
		fg2oscillator.type = 'square';
	}
	else if (fg2function == 2) {
		fg2oscillator.type = 'triangle';
	}
	fq = GetFg2Freq();
	if (fq > 24000) {
		fq = 24000;
	}
	fg2oscillator.frequency.value = fq;
	fg2volume.gain.value = fg2ampslider.value / 10;
}