/*
	_ ECMAScript 6 _ bitches _ 
	https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
	https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
*/
"use strict";

/*
	Widget class
		- needs jQuery
		- handlebars runtime
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

	/*
	 * 	each widget is responsible for overriding   
	 */
	
	off() {}  // called when user has turned off widget, handle clearouts, etc.
	init() {} // called from on(). handle initializing the widget
	

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

		chrome.storage.local.get(this.dataKey, function(result) {

			if(result[this.dataKey]) {
				this.data = result[this.dataKey];
				callbackSuccess.call(this);
			}
			else{
				callbackFail.call(this);
			}
		}.bind(this));
	}

	saveData(callback) {

		var obj = {};
		obj[this.dataKey] = this.data;

		chrome.storage.local.set( obj, function() {
			if(callback){callback.call(this);}
		}.bind(this));
	}
}

class Sport extends Widget {

	constructor() {
		super();
		this.schedule_url_start;
		this.schedule_url_end;
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

	changeDay(n) {
		this.schedule_url = this.schedule_url_start + this.yyyymmdd(n) + this.schedule_url_end;
		this.resetSchedule();
	}

	getJsonData(url, callback) {
		$.getJSON(url, function(result) {
			this.massageData.call(this, result, callback);
		}.bind(this))
		.fail(function(result){
			//this.massageData.call(this, result, callback);
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
		this.schedule_url_start = 'http://live.nhle.com/GameData/GCScoreboard/';
		this.schedule_url_end = '.jsonp';
		this.schedule_url =  this.schedule_url_start + this.yyyymmdd() + this.schedule_url_end;
	}

	formatDate(yyyy, mm, dd) { return yyyy + '-' + mm + '-' + dd;}

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
		console.log(result);
		try {
			for (var i = 0; i < result.games.length; i++) {
				result.games[i].atcommon = result.games[i].atcommon.toLowerCase();
				result.games[i].htcommon = result.games[i].htcommon.toLowerCase();
			}
			callback.call(this, result);
		}
		catch(e) {
			console.log('fudge cakes -- massageData' + e);
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
}

class MLB extends Sport {

	constructor() {
		super();
		this.dataKey = 'MLB';
		//'http://gd2.mlb.com/components/game/mlb/year_2016/month_04/day_15/master_scoreboard.json';
		this.schedule_url_start = 'http://gd2.mlb.com/components/game/mlb/';
		this.schedule_url_end = '/master_scoreboard.json';
		this.schedule_url = this.schedule_url_start + this.yyyymmdd() + this.schedule_url_end;
	}

	formatDate(yyyy, mm, dd) {
		return 'year_' + yyyy + '/month_' + mm + '/day_' + dd;
	}

	writeToTemplate(error) {
		//console.log(this.data.games);

		console.log(this.data);

		this.displayTemplate('MLB', 'schedule', 
			this.data.data.games, $('#MLB_widget'));
	}

	cacheButtonActions() {
		var that = this;
		$('body').on('click', '#MLB_widget #remove-game-btn', {that: that}, this.removeGame);
		$('body').on('click', '#MLB_widget #reset_games', this.resetSchedule.bind(this));
		$('body').on('click', '#MLB_widget #tomorrow-btn', this.changeDay.bind(this, 1));
		$('body').on('click', '#MLB_widget #yesterday-btn', this.changeDay.bind(this,-1));
		$('body').on('click', '#MLB_widget #today-btn', this.changeDay.bind(this,0));
	}

	removeGame(event) {
		var that = event.data.that;
		var id = $(this).closest('tr').attr('id');

		$('#'+id).remove();
		//$('#c'+id).remove();

		for (var i = 0; i < that.data.data.games.game.length; i++) {
			if(id == that.data.data.games.game[i].game_pk) {
				that.data.data.games.game[i]['hidden'] = true;
				break;
			}
		};

		that.saveData();
	}

	massageData(result, callback) {
		try {
			for (var i = 0; i < result.data.games.game.length; i++) {
				var game = result.data.games.game[i];

				/* time status 
				*********************************************************************************************/
				var time_to_show;

				//console.log('>>>>>> ===== ' + game.status.status);

				if(game.status.status == "Final" || game.status.status === "Postponed") {
					time_to_show = game.status.status;
				}
				else if (game.status.status === "In Progress") {
					time_to_show = game.status.inning_state + ' of ' + game.status.inning;
				}
				else if (game.status.status === "Preview" || game.status.status === "Pre-Game" 
						|| game.status.status === "Warmup") {

					try {
						var timeArr = game.time.split(':');
						var dateArr = game.original_date.split('/');
						// check time.Arr.length
						var yyyy 	= parseInt(dateArr[0]);
						var mm 		= parseInt(dateArr[1]);
						var dd 		= parseInt(dateArr[2]);
						var hours 	= parseInt(timeArr[0]);
						var minutes = parseInt(timeArr[1]);


						/*if( i == 0 || i == 2 ) {
							console.log('{{{{{{{{{{{{{ ' + i);
							console.log(hours);
							console.log(hours-1);
							console.log(game.ampm);
							//hours += 12;
							console.log(hours);
							var EST_UTC_OFFSET = 5;
							console.log( (hours-1+12+EST_UTC_OFFSET)%24 );
							var a = new Date();
							a.setUTCHours( (hours-1+12+EST_UTC_OFFSET)%24 , minutes);
							console.log( a.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) );
							console.log('}}}}}}}}}}}}}');
						}*/


						var date = new Date(yyyy, mm, dd);
						hours = hours - 1;      // setUTCHours is 0-23, NBA API is 1 - 24 for hours
						if(game.ampm === "PM") {
							hours += 12;
						}
						else { //AM
							hours -= 12;
						}

						var EST_UTC_OFFSET = 5; // EST + 5 = UTC
						date.setUTCHours( (hours+EST_UTC_OFFSET)%24, minutes);
						time_to_show = date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
					}

					catch(e) {
						time_to_show = game.time + " " + game.time_zone;
						console.log('>> time_to_show excption');
					}
				}
				result.data.games.game[i]['time_to_show'] = time_to_show;

				/* winning 
				********************************************************************************************/
				if(game.linescore) {
					var at_score = parseInt(game.linescore.r.away);
					var ht_score = parseInt(game.linescore.r.home);
					result.data.games.game[i]['atwinning'] = at_score > ht_score;
					result.data.games.game[i]['htwinning'] = ht_score > at_score;
				}
			}
			callback.call(this, result);
		}
		catch(e) {
			console.log('fudge cakes -- massageData' + e);
		}

		callback.call(this, result);
	}
}

/*const _NHL = new NHL();
_NHL.init();

const _MLB = new MLB();
_MLB.init();*/

