console.log('hellow world');

/*
	_ ECMAScript 6 _ bitches _ 
	https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
	https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
*/
"use strict";

/*
	Widget class
		- needs jQuery
*/
class Widget {

	constructor() {
		this.initialized = false;
		this.data = {};
		this.dataKey;
		this.domElement;
	}

	on() {
		if(this.initialized == false) {
			this.initialized = true;
			this.init();
		}
	}

	/**
	* ============================================================================
	*  			each widget is responsible for overriding   
	* ============================================================================
	*/
	
	// called when user has turned off widget, handle any clearouts, etc.
	off() {}

	// called from on(). handle initializing the widget
	init() {}

	/**
	* ============================================================================
	*  			complete functions / standard widget functionality   
	* ============================================================================
	*/

	/*
		@$template  -- name of .handlebars file
		@dataKey    -- name of top level data structure passed to template
		@dataObj    -- top level data structure being passed to template
		@$element   -- dom element, not id, its html will be replaced with template
		@showAffect -- [optional] fade in affect
	*/
	displayTemplate(tempalte_name, dataKey, dataObj, $element, showAffect) {
	
		var template = Handlebars.templates[tempalte_name];

		var data = {};
		data[dataKey] = dataObj;
		var output = template(data);
		
		if(showAffect) {
			$element.hide();
			$element.html(output);
			$element.fadeIn(500);
		} else {
			$element.html(output);
		}
	}

	/* 
		using jQuery -- fight me
		needs url and callback
	*/
	getData(url, callback) {
		$.getJSON(url, function(result) {
			callback.call(this, result);
		}.bind(this));
		// TODO handle timeout, and network error
	}

	/**
	* ============================================================================
	*  			Chrome specific widget functionality   
	* ============================================================================
	*/

	loadData(callbackSuccess, callbackFail) {

		chrome.storage.local.get(this.key, function(result) {
			if(result[this.datakey]) {
				this.data = result[this.datakey];
				callbackSuccess.call(this);
			}
			else{
				callbackFail.call(this);
			}
		}.bind(this));
	}

	saveData(callback) {

		var obj = {};
		obj[this.datakey] = this.data;

		chrome.storage.local.set( obj, function() {
			if(callback){callback.call(this);}
		}.bind(this));
	}

	get area() {return 2}
}

class Sport extends Widget {

	constructor() {
		super();
		this.schedule_url;
		this.today = new Date();
	}

	init() {
		this.loadLocalSchedule();
		this.cacheButtonActions();
		this.specificInit();
	}

	/*
		OVERWRITE in extending classes for unique functionality
	*/
	specificInit() {}
	cacheButtonActions() {}
	writeToTemplate() {}
	dataOutOfDate(newData) {return true;}
	updateEachGame(newData) {}
	massageData(data, callback) {callback.call(this, data);}
	highlightGames() {}
	formatDate() {}

	yyyymmdd(changeDay) {
		if(changeDay) {
			this.today.setDate(this.today.getDate() + changeDay); 
		}
		else {
			this.today = new Date();
		}

		function twoDigits(n) {
			return n<10? '0'+n:''+n
		}

		var string = this.formatDate( 
				this.today.getFullYear(), 
				twoDigits(this.today.getMonth()+1), 
				twoDigits(this.today.getDate())
			);

		return string;
	}

	getJsonData(url, callback) {
		$.getJSON(url, function(result) {
			this.massageData.call(this, result, callback);
		}.bind(this)).fail(function(result){
			this.massageData.call(this, result, callback);
		}.bind(this));
		// TODO handle timeout
	}


	getDataSchedule () {
		this.getJsonData(this.schedule_url, this.displaySchedule);
	}

	loadLocalSchedule() {
		this.loadData( function(){
			this.writeScheduleToDOM();
			this.getDataSchedule();
		}, 
		this.getDataSchedule);
	}

	displaySchedule(newData) {

		if(this.dataOutOfDate(newData)) {
			this.data = newData;
			this.saveData(this.writeScheduleToDOM());
		} 

		else {
			this.updateEachGame(newData);
		}
	}

	writeScheduleToDOM() {
		this.writeToTemplate();
		this.highlightGames();
	}

	resetSchedule() {
		this.data = null;
		this.saveData(this.getDataSchedule);
	}

	updateSchedule() {
		this.getDataSchedule();
	}

	writeErrorMessage() {
		this.writeToTemplate(true);
	}
}


class NHL extends Sport {

	constructor() {
		super();
		this.dataKey = 'NHL';
		//this.schedule_url = 'http://live.nhle.com/GameData/GCScoreboard/2016-04-14.jsonp';
		this.schedule_url = 'http://live.nhle.com/GameData/GCScoreboard/' + this.yyyymmdd() + '.jsonp';
	}

	formatDate(yyyy, mm, dd) {
		return yyyy + '-' + mm + '-' + dd;
	}

	writeToTemplate(error) {
		console.log('>>>>>>>>>>>>>');
		console.log(this.data);

		if(error) {
			if(!this.data) {this.data = {};}
			this.data['error'] = true;
			this.data.games = null;
		}

		this.displayTemplate('NHL', 'schedule', 
			this.data, $('#NHL_widget'));
	}

	getJsonData(url, callback) {
		console.log('getting from internet.');
		console.log(url);
		$.getJSON(url, function(result) {
			this.massageData.call(this, result, callback);
		}.bind(this)).fail(function(result){
			try {
				var json = result.responseText.split('(')[1];
				json = json.split(')')[0];
				var result = JSON.parse(json);
				this.massageData.call(this, result, callback);
			}

			catch(e) {
				this.writeErrorMessage(true);
			}
			
		}.bind(this));
		// TODO handle timeout
	}

	massageData(result, callback) {
		try {
			for (i=0; i < result.games.length; i++) {
				result.games[i].atcommon = result.games[i].atcommon.toLowerCase();
				result.games[i].htcommon = result.games[i].htcommon.toLowerCase();
			}
			callback.call(this, result);
		}
		catch(e) {
			console.log('fudge cakes -- massageData');
		}
	}

	cacheButtonActions() {
		//var that = this;
		//$('body').on('click', '#NBA_game_table #remove-game-btn', {that: that}, this.removeGame);
		$('body').on('click', '#NHL_widget #reset_games', this.resetSchedule.bind(this));
		$('body').on('click', '#NHL_widget #tomorrow-btn', this.changeDay.bind(this, 1));
		$('body').on('click', '#NHL_widget #yesterday-btn', this.changeDay.bind(this,-1));
		$('body').on('click', '#NHL_widget #today-btn', this.changeDay.bind(this,0));
	}

	changeDay(n) {
		this.schedule_url = 'http://live.nhle.com/GameData/GCScoreboard/'+
		this.yyyymmdd(n)+'.jsonp';
		this.resetSchedule();
	}
}


const _NHL = new NHL();
_NHL.init();


