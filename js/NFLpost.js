
/*
	NFL Object 
*/
function NFL() {
	Sports.call(this);

	this.datakey = 'NFL_DATA';
	this.schedule_url = 'http://www.nfl.com/liveupdate/scorestrip/ss.json';

	this.$game_table = $('#NFL_col #NFL-schedule-table');
	this.$game_template = $("#NFL-schedule-template").html();
};

NFL.prototype = Object.create(Sports.prototype); // See note below
NFL.prototype.constructor = NFL;

NFL.prototype.capitalizeFirstChar = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

NFL.prototype.getJsonData = function(url, callback) {
	console.log('getting from internet');
	var url = 'http://www.nfl.com/ajax/scorestrip?season=2015&seasonType=POST&week=18';	
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);		
	xhr.onreadystatechange = function() {
		var response = xhr.responseXML;
		if(response) {
			var jsonObj = $.xml2json(response);

			for (var i = 0; i < jsonObj.gms.g.length; i++) {

				// capitalize the first char of team name 
				jsonObj.gms.g[i].hnn = this.capitalizeFirstChar(jsonObj.gms.g[i].hnn);
				jsonObj.gms.g[i].vnn = this.capitalizeFirstChar(jsonObj.gms.g[i].vnn);
			}

			callback.call(this,jsonObj);
		}
	}.bind(this);
	xhr.send();
};

NFL.prototype.massageData = function(data, callback) {

	var url = 'http://www.nfl.com/liveupdate/scores/scores.json'
	$.getJSON(url, function(result) {

		for (var i = 0; i < data.gms.length; i++) {

			data.gms[i]['extrainfo'] = result[data.gms[i].eid];

			/*if(data.gms[i].q == 'P') {
				data.gms[i]['hasntStarted'] = true; 
			}*/

			if(data.gms[i]['extrainfo'].home.score[1] !== null) {
				data.gms[i]['scoreTable'] = true; 
			}

			if(!isNaN(data.gms[i].q)) {
				data.gms[i]['playing'] = true; 
			}

			if(data.gms[i].q === 'F' || data.gms[i].q === 'FO') {
				data.gms[i]['done'] = true; 
			}
		}
		callback.call(this,data);		
	}.bind(this));
};

NFL.prototype.dataOutOfDate = function(newData) {
	//return false;
	if(this.data == null) {return true;}
	if(this.data.gms == null) {return true;}
	return !(this.data.gms.w == newData.gms.w);
};

NFL.prototype.writeToTemplate = function() {
	this.displayTemplate(this.$game_template, 'games', this.data.gms.g, 
		this.$game_table.find('tbody'));
};

NFL.prototype.cacheButtonActions = function() {
	var that = this;
	$('body').on('click', '#NFL_col #reset_games', this.resetSchedule.bind(this));
	$('body').on('click', '#NFL_col #remove-game-btn', {that: that}, this.removeGame);
	$('body').on('click', '#NFL_col #refresh_scores', this.updateSchedule.bind(this));
};

NFL.prototype.removeGame = function(event) {

	var that = event.data.that;
	var targetId = $(this).closest('tr').attr('id');
	
	$('#'+targetId).remove();
	$('#c'+targetId).remove();
	
	for (var i = 0; i < that.data.gms.g.length; i++) {
		if(that.data.gms.g[i].eid === targetId) {
			that.data.gms.g[i]['hidden'] = true;
			break;
		}
	}
	that.saveData();
};



NFL.prototype.updateEachGame = function(newData) {
	console.log('NFL updating')
	
	for (i=0; i < this.data.gms.g.length; i++) {
		if(this.data.gms.g[i].eid !== newData.gms.g[i].eid){
			console.log('data not same -- error');
			break;
		}
		if(this.data.gms.g[i]['hidden']) {
			newData.gms.g[i]['hidden'] = true;
		}
	};

	this.data = newData;
	this.saveData(this.writeScheduleToDOM());
};

