
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

				// label whos winning
				var home_score = parseInt(jsonObj.gms.g[i].hs);
				var visitor_score = parseInt(jsonObj.gms.g[i].vs);

				if(home_score > visitor_score) {
					jsonObj.gms.g[i]['home_winning'] = true;
				}
				if(visitor_score > home_score) {
					jsonObj.gms.g[i]['visitor_winning'] = true;
				}
			}

			//callback.call(this,jsonObj);
			this.massageData(jsonObj,callback);
		}
	}.bind(this);
	xhr.send();
};

NFL.prototype.massageData = function(data, callback) {

	var url = 'http://www.nfl.com/liveupdate/scores/scores.json'
	$.getJSON(url, function(result) {

		for (var i = 0; i < data.gms.g.length; i++) {

			if( (data.gms.g[i].eid in result)) {

				data.gms.g[i]['extrainfo'] = result[data.gms.g[i].eid];

				/*if(data.gms[i].q == 'P') {
					data.gms[i]['hasntStarted'] = true; 
				}*/

				if(data.gms.g[i]['extrainfo'].home.score[1] !== null) {
					data.gms.g[i]['scoreTable'] = true; 
				}

				if( data.gms.g[i]['extrainfo'].qtr !== null &&
					!isNaN(data.gms.g[i]['extrainfo'].qtr) ||
					data.gms.g[i]['extrainfo'].qtr === "OT") { //TODO
					
					//console.log('playing == true');
					data.gms.g[i]['playing'] = true; 
				}

				if(data.gms.g[i].q === 'F' || data.gms.g[i].q === 'FO') {
					data.gms.g[i]['done'] = true; 
				}

				// label whos winning
				if(data.gms.g[i].extrainfo.home.score.T !== null) {
					var home_score = parseInt(data.gms.g[i].extrainfo.home.score.T);
					var visitor_score = parseInt(data.gms.g[i].extrainfo.away.score.T);

					if(home_score > visitor_score) {
						data.gms.g[i]['home_winning'] = true;
					}
					if(visitor_score > home_score) {
						data.gms.g[i]['visitor_winning'] = true;
					}
				}
				//console.log(data.gms.g[i]);
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
	
	if(this.data.gms.g.length > 0) {
		$('#week_number').text(this.data.gms.w +' / '+ this.data.gms.g[0].gt);
		this.displayTemplate(this.$game_template, 'games', this.data.gms.g, 
			this.$game_table.find('tbody'));
	}
	else {
		$('#NFL_col .panel-body').html(this.$no_games_message);
	}
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

