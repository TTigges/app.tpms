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
 * HelloWorld Application
 *
 * This is the main file of the application and contains the required information
 * to run the application on the mini framework.
 *
 * The filename needs to be app.js in order to be recognized by the loader.
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

	pressure: {
		normal: 2
	},

	outTemp: 0,

	created: function() {

		var tires = [
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
		];

		this.tires = this.element("div", "tires", false, false, "", false);

		for (var i=0; i<tires.length; i++) {
		// tire element:
			var tire = this.element("div", tires[i].tireid, "tire", false, "", true);
		// gauge container with gauge elements:
			var gauge = this.element("div", tires[i].prgid, "pressuregauge", false, "", true);
			var scale = this.element("div", false, "scale scalenorm", false, "", true);
			var gaugecontainer = this.element("div", false, "pressuregaugecontainer", false, [gauge, scale], true);
		// pressure with value and unit:
			var pressurevalue = this.element("span", tires[i].pressureid, "pressurevalue", false, "2,0", true);
			var pressureunit = this.element("span", false, "pressureunit", false, "bar", true);
			var pressure = this.element("div", false, "pressure", false, [pressurevalue, pressureunit]);
		// temperature with value and unit:
			var temperaturevalue = this.element("span", tires[i].tempid, "temperaturevalue", false, "9,0", true);
			var temperatureunit = this.element("span", false, false, false, "&deg;C", true);
			var temperature = this.element("div", false, "temperature", false, [temperaturevalue, temperatureunit]);
		// combine all in the tirecontainer:
			var tirecontainer = this.element("div", tires[i].position, (tires[i].classeslist + " tirecontainer"), false, [tire, gaugecontainer, pressure, temperature]).appendTo(this.tires);
		}

		this.tpmsContainer = this.element("div", "tpmsContainer", false, false, this.tires, false);

//		We fake some values with speed values, just to test the function:
		
		this.subscribe(VehicleData.temperature.outside, function(value) {

			this.outTemp = value;

		}.bind(this));


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

		var flpressure = (values[0].pressure / 1000); // converted to bar and rounded
		var fltemperature = values[0].temperature;
		var frpressure = (values[1].pressure / 1000); // converted to bar and rounded
		var frtemperature = values[1].temperature;
		var rrpressure = (values[2].pressure / 1000); // converted to bar and rounded
		var rrtemperature = values[2].temperature;
		var rlpressure = (values[3].pressure / 1000); // converted to bar and rounded
		var rltemperature = values[3].temperature;

		var flperc = this.pixelposition(flpressure);
		var frperc = this.pixelposition(frpressure);
		var rrperc = this.pixelposition(rrpressure);
		var rlperc = this.pixelposition(rlpressure);

		var percOfffl = this.calcoffset(flpressure);
		var percOfffr = this.calcoffset(frpressure);
		var percOffrr = this.calcoffset(rrpressure);
		var percOffrl = this.calcoffset(rlpressure);

		this.canvas.find("#flpressure").html(this.round(flpressure));
		this.canvas.find("#frpressure").html(this.round(frpressure));
		this.canvas.find("#rrpressure").html(this.round(rrpressure));
		this.canvas.find("#rlpressure").html(this.round(rlpressure));

		this.canvas.find("#flprg").css("height",flperc+"px");
		this.canvas.find("#frprg").css("height",frperc+"px");
		this.canvas.find("#rrprg").css("height",rrperc+"px");
		this.canvas.find("#rlprg").css("height",rlperc+"px");

		this.canvas.find("#flprg").css("background",this.perc2color(percOfffl));
		this.canvas.find("#frprg").css("background",this.perc2color(percOfffr));
		this.canvas.find("#rrprg").css("background",this.perc2color(percOffrr));
		this.canvas.find("#rlprg").css("background",this.perc2color(percOffrl));

		this.canvas.find("#fltemp").html(fltemperature);
		this.canvas.find("#frtemp").html(frtemperature);
		this.canvas.find("#rrtemp").html(rrtemperature);
		this.canvas.find("#rltemp").html(rltemperature);

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
		var maxPressure = this.pressure.normal + 0.5; // could be modified
		var maxHeight = 58; //px // specific to the car background image (tire height = gauge height)
		return maxHeight-(maxHeight*(maxPressure-pres));
	},

	calcoffset: function(pres) {
		var normalPressure = this.pressure.normal;
		var multiplier = 6; // can be modified to have the color change earlier or later to yellow/orange/red
		if (pres === normalPressure) {
			var diff = 0;
		}
		else if (pres < normalPressure) {
			var diff = normalPressure - pres;
		}
		else {
			var diff = pres - normalPressure;
		}
		diff = diff*multiplier;
		if (diff > 100) {
			diff = 100;
		}
		return  (diff/normalPressure) * 100;
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
