
/*
	NFL Object 
*/
function NFL() {
	Sports.call();

	this.datakey = 'NFL_DATA';
	this.schedule_url = 'http://www.nfl.com/liveupdate/scorestrip/ss.json';

	this.$game_table = $('#NFL_col #NFL-schedule-table');
	this.$game_template = $("#NFL-schedule-template").html();
};

NFL.prototype = Object.create(Sports.prototype); // See note below
NFL.prototype.constructor = NFL;

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

	if(this.data == null) {return true;}
	if(this.data.w == null) {return true;}
	return !(this.data.w == newData.w);
};

NFL.prototype.writeToTemplate = function() {

	this.displayTemplate(this.$game_template, 'games', this.data.gms, 
		this.$game_table.find('tbody'));
};

NFL.prototype.cacheButtonActions = function() {
	var that = this;
	$('body').on('click', '#NFL-schedule-games button', {that: that}, this.removeGame);
	$('body').on('click', '#NFL_col #reset_games', this.resetSchedule.bind(this));
};

NFL.prototype.cacheGames = function() {

	var games = {};
	$('#NFL-schedule-games tr').each(function(){
		games[$(this).attr('id')] = $(this);
	});
	this.$games = games;
};


NFL.prototype.removeGame = function(event) {
	var that = event.data.that;
	var targetId = $(this).closest('tr').attr('id');

	for (var i = 0; i < that.data.gms.length; i++) {

		if(that.data.gms[i].eid == targetId) 
		{
			//that.data.gms.splice(i, 1);
			that.data.gms[i]['hidden'] = true;

			that.$games[targetId].remove();
			$('#c'+targetId).remove();
			break;
		}
	}
	that.saveData();
};

NFL.prototype.formatScheduleGames = function() {

	for (var i = 0; i < this.data.gms.length; i++) {
		var game = this.data.gms[i];
		
		/* highlight winning team */
		var visitor_score = parseInt(game.vs);
		var home_score = parseInt(game.hs);

		this.$games[game.eid].find('#home-team').toggleClass('winning', home_score > visitor_score);
		this.$games[game.eid].find('#visitor-team').toggleClass('winning', visitor_score > home_score);
		/* /highlight winning team */

		var $time = this.$games[game.eid].find('#time');

		if(parseInt(game.rz) > 0) {
			//$scores.append(' [RZ]')
		}
		
		/* game quarter */
		if(game.q == 'H') {
			$time.html('@Half');	
		}

		else if(game.q == 'F' || game.q == 'FO') {
			$time.html(game.d + ", " + game.q);
		}

		else if(game.q !== 'P'){
			$time.html(game.q + "Q");		
		}

		else {
			//$time.html(game.q);	
		}
		/* /game quarter */
	}
};

NFL.prototype.updateEachGame = function(newData) {
	//console.log('teasdfsdfst')

		for (i=0; i < this.data.sports_content.games.game.length; i++) {
		if(this.data.sports_content.games.game[i].id !== 
			newData.sports_content.games.game[i].id){
			console.log('data not same -- error');
			break;
		}
		if(this.data.sports_content.games.game[i]['hidden']) {
			newData.sports_content.games.game[i]['hidden'] = true;
		}
	};

	this.data = newData;
	this.saveData(this.writeScheduleToDOM());
};

