/**
 * Custom Applications SDK for Mazda Connect Infotainment System
 *
 * A mini framework that allows to write custom applications for the Mazda Connect Infotainment System
 * that includes an easy to use abstraction layer to the JCI system.
 *
 * Written by Andreas Schwarz (http://github.com/flyandi/mazda-custom-applications-sdk)
 * Copyright (c) 2016. All rights reserved.
 *
 * WARNING: The installation of this application requires modifications to your Mazda Connect system.
 * If you don't feel comfortable performing these changes, please do not attempt to install this. You might
 * be ending up with an unusuable system that requires reset by your Dealer. You were warned!
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the
 * GNU General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even
 * the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
 * License for more details.
 *
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see http://www.gnu.org/licenses/
 *
 */


/**
 * Tire Pressue Monitoring System by Torben Tigges
 *
 * This is the main file of the application and contains the required information
 * to run the application on the mini framework.
 *
 */

CustomApplicationsHandler.register("app.tpms", new CustomApplication({

	/**
	 * (require)
	 *
	 * An object array that defines resources to be loaded such as javascript's, css's, images, etc
	 *
	 * All resources are relative to the applications root path
	 */

	require: {

		/**
		 * (js) defines javascript includes
		 */

		js: [],

		/**
		 * (css) defines css includes
		 */

		css: ['app.css'],

		/**
		 * (images) defines images that are being preloaded
		 *
		 * Images are assigned to an id
		 */

		images: {

		},
	},

	/**
	 * (settings)
	 *
	 * An object that defines application settings
	 */

	settings: {

		/**
		 * (terminateOnLost)
		 *
		 * If set to 'true' this will remove the stateless life cycle and always
		 * recreate the application once the focus is lost. Otherwise by default
		 * the inital created state will stay alive across the systems runtime.
		 *
		 * Default is false or not set
		 * /

		// terminateOnLost: false,

		/**
		 * (title) The title of the application in the Application menu
		 */

		title: 'TPMS',

		/**
		 * (statusbar) Defines if the statusbar should be shown
		 */

		statusbar: true,

		/**
		 * (statusbarIcon) defines the status bar icon
		 *
		 * Set to true to display the default icon app.png or set a string to display
		 * a fully custom icon.
		 *
		 * Icons need to be 37x37
		 */

		statusbarIcon: false,

		/**
		 * (statusbarTitle) overrides the statusbar title, otherwise title is used
		 */

		statusbarTitle: false,

		/**
		 * (statusbarHideHomeButton) hides the home button in the statusbar
		 */

		// statusbarHideHomeButton: false,

		/**
		 * (hasLeftButton) indicates if the UI left button / return button should be shown
		 */

		hasLeftButton: false,

		/**
		 * (hasMenuCaret) indicates if the menu item should be displayed with an caret
		 */

		hasMenuCaret: false,

		/**
		 * (hasRightArc) indicates if the standard right car should be displayed
		 */

		hasRightArc: false,

	},

	/***
	 *** User Interface Life Cycles
	 ***/

	/**
	 * (created)
	 *
	 * Executed when the application gets initialized
	 *
	 * Add any content that will be static here
	 */

	pressureSettings: {
		normal: 2,
		warnDiff: 0.2,
		multiplier: 6 // can be modified to have the color change earlier or later to yellow/orange/red
	},

	outTemp: 0,

	tires: [
		{
			position:"fl",
			classeslist:"front left",
			tireid:"fltire",
			prgid:"flprg",
			pressureid:"flpressure",
			tempid:"fltemp"
		},
		{
			position:"fr",
			classeslist:"front right",
			tireid:"frtire",
			prgid:"frprg",
			pressureid:"frpressure",
			tempid:"frtemp"
		},
		{
			position:"rr",
			classeslist:"rear right",
			tireid:"rrtire",
			prgid:"rrprg",
			pressureid:"rrpressure",
			tempid:"rrtemp"
		},
		{
			position:"rl",
			classeslist:"rear left",
			tireid:"rltire",
			prgid:"rlprg",
			pressureid:"rlpressure",
			tempid:"rltemp"
		}
	],

	created: function() {

		this.tirescontainer = this.element("div", "tires", false, false, "", false);

		for (var i=0; i<this.tires.length; i++) {
		// tire element:
			var tire = this.element("div", this.tires[i].tireid, "tire", false, "", true);
		// gauge container with gauge elements:
			var gauge = this.element("div", this.tires[i].prgid, "pressuregauge", false, "", true);
			var scale = this.element("div", false, "scale scalenorm", false, "", true);
			var gaugecontainer = this.element("div", false, "pressuregaugecontainer", false, [gauge, scale], true);
		// pressure with value and unit:
			var pressurevalue = this.element("span", this.tires[i].pressureid, "pressurevalue", false, "2,0", true);
			var pressureunit = this.element("span", false, "pressureunit", false, "bar", true);
			var pressure = this.element("div", false, "pressure", false, [pressurevalue, pressureunit]);
		// temperature with value and unit:
			var temperaturevalue = this.element("span", this.tires[i].tempid, "temperaturevalue", false, "9,0", true);
			var temperatureunit = this.element("span", false, false, false, "&deg;C", true);
			var temperature = this.element("div", false, "temperature", false, [temperaturevalue, temperatureunit]);
		// combine all in the tirecontainer:
			var tirecontainer = this.element("div", this.tires[i].position, (this.tires[i].classeslist + " tirecontainer"), false, [tire, gaugecontainer, pressure, temperature]).appendTo(this.tirescontainer);
		}

		this.tpmsContainer = this.element("div", "tpmsContainer", false, false, this.tirescontainer, false);


//
		this.subscribe(VehicleData.temperature.outside, function(value) {
			this.outTemp = value;
		}.bind(this));

//		We fake some values with speed values, just to test the function:
		this.subscribe(VehicleData.vehicle.speed, function(value) {
			values = [{pressure: (value*10)+50, temperature: this.outTemp+2},{pressure: (value*10)+100, temperature: this.outTemp+3},{pressure: (value*10)+150, temperature: this.outTemp+4},{pressure: (value*10)+200, temperature: this.outTemp+5}];
			this.handlePressure(values);
		}.bind(this));

	},

	/**
	 * (focused)
	 *
	 * Executes when the application gets the focus. You can either use this event to
	 * build the application or use the created() method to predefine the canvas and use
	 * this method to run your logic.
	 */

	focused: function() {


	},


	/**
	 * (lost)
	 *
	 * Lost is executed when the application looses it's context. You can specify any
	 * logic that you want to run before the application gets removed from the DOM.
	 *
	 * If you enabled terminateOnLost you may want to save the state of your app here.
	 */

	lost: function() {

	},

	/***
	 *** Events
	 ***/

	/**
	 * (event) onControllerEvent
	 *
	 * Called when a new (multi)controller event is available
	 */

	onControllerEvent: function(eventId) {

		// Look above where we create this.label
		// Here is where we assign the value!

	},

	handlePressure: function(values) {

		for (var i=0; i<values.length; i++) {

			var tempPressure = this.round(values[i].pressure/1000); // assuming hPa
			var tempHeight = this.pixelposition(tempPressure);
			var tempOffset = this.comparePressure(tempPressure, "offset");
			var tempColor = this.perc2color(tempOffset);
			var tempClassName = this.comparePressure(tempPressure, "class");

			this.canvas.find("#"+this.tires[i].tireid).attr("class", tempClassName);
			this.canvas.find("#"+this.tires[i].prgid).css({"background": tempColor, "height": tempHeight+"px"});
			this.canvas.find("#"+this.tires[i].pressureid).html(tempPressure);
			this.canvas.find("#"+this.tires[i].tempid).html(values[i].temperature);

		}

	},

// Helperfunctions:
	round: function(value) {
		var interval = 0.05; // could be changed
		var decimals = 2; // could be changed
	//	interval || (interval = 1.0);
		var inv = 1.0 / interval;
		var res = Math.round(value * inv) / inv;
		return res.toFixed(decimals).toLocaleString('de'); // needs to be adapted to your locale // decimal point vs comma
	},

	pixelposition: function(pres) {
		var maxPressure = this.pressureSettings.normal + 0.5; // could be modified
		var maxHeight = 58; //px // specific to the car background image (tire height = gauge height)
		return maxHeight-(maxHeight*(maxPressure-pres));
	},

	comparePressure: function(value, answer) {
		var normalPressure = this.pressureSettings.normal;
		var alarmDiff = this.pressureSettings.warnDiff;
	//	var warnDiff = alarmDiff - 0.05; // or changes to this.pressureSettings
		var multiplier = this.pressureSettings.multiplier; // can be modified to have the color change earlier or later to yellow/orange/red
		if (value === normalPressure) {
			var diff = 0;
		}
		else if (value < normalPressure) {
			var diff = normalPressure - value;
		}
		else {
			var diff = value - normalPressure;
		}
		if (answer === "class") {
			if (diff >= alarmDiff-0.01) { // -0.01 => weird error: no warning shown at 1.8 but at 2.2
				return "tire alarm";
			}
			else {
				return "tire norm";
			}
		}
		else if (answer === "offset") {
			diff = diff * multiplier;
			if (diff > 100) {
				diff = 100;
			}
			return  (diff / normalPressure) * 100;
		}
	},

	perc2color: function(perc) {
		var r, g, b = 0;
		if(perc < 50) {
			g = 255;
			r = Math.round(5.1 * perc);
		}
		else {
			r = 255;
			g = Math.round(510 - 5.10 * perc);
		}
		var h = r * 0x10000 + g * 0x100 + b * 0x1;
		return '#' + ('000000' + h.toString(16)).slice(-6);
	}

})); /** EOF **/
