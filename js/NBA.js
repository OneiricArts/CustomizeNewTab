
/*
	NFL Object 
*/
function NBA() {
	Sports.call(this);

	this.datakey = 'NBA_DATA';
	this.schedule_url = 'http://data.nba.com/json/cms/noseason/scoreboard/'+
						this.yyyymmdd()+'/games.json';

	this.$game_table = $('#NBA-panel #NBA_game_table');
	this.$game_template = $("#NBA-schedule-template").html();
};

NBA.prototype = Object.create(Sports.prototype); // See note below
NBA.prototype.constructor = NBA;

NBA.prototype.yyyymmdd = function() {

	var today = new Date();

	function twoDigits(n) {
		return n<10? '0'+n:''+n
	}

	return ( today.getFullYear()+
	twoDigits(today.getMonth()+1)+twoDigits(today.getDate()) );
}

NBA.prototype.specialInit = function() {
};

NBA.prototype.cacheButtonActions = function() {
	var that = this;
	$('body').on('click', '#NBA_game_table #remove-game-btn', {that: that}, this.removeGame);
	$('body').on('click', '#NBA_col #reset_games', this.resetSchedule.bind(this));
	$('body').on('click', '#NBA_col #update-btn', this.updateSchedule.bind(this));
	$('body').on('click', '#NBA_col #standings-btn', this.standings.bind(this));
};


NBA.prototype.removeGame = function(event) {

	var that = event.data.that;
	var id = $(this).closest('tr').attr('id');

	$('#'+id).remove();
	$('#c'+id).remove();

	for (i=0; i < that.data.sports_content.games.game.length; i++) {
		if(id == that.data.sports_content.games.game[i].id) {
			that.data.sports_content.games.game[i]['hidden'] = true;
			break;
		}
	};

	that.saveData();
};

NBA.prototype.dataOutOfDate = function(newData) {

	//return true;
	if(this.data == null) {
		console.log('true')
		return true;
	}
	if(this.data.sports_content == null) {
		console.log('true')
		return true;
	}
	//console.log(newData.sports_content.games.game[0].date + ' === ' + this.yyyymmdd() );
	//console.log( !( newData.sports_content.games.game[0].date === this.yyyymmdd() ) );
	return !( newData.sports_content.games.game[0].date === this.yyyymmdd() );
	//return !( newData.sports_content.sports_meta.season_meta.calendar_date === this.yyyymmdd() );
	//return false;
};


NBA.prototype.massageData = function(newData, callback) {

	for (i=0; i < newData.sports_content.games.game.length; i++) {

		var home_score = parseInt(newData.sports_content.games.game[i].home.score);
		var visitor_score = parseInt(newData.sports_content.games.game[i].visitor.score);

		newData.sports_content.games.game[i].home['winning'] = (home_score > visitor_score);
		newData.sports_content.games.game[i].visitor['winning'] = (visitor_score > home_score);

		/* check if scores or times have changed, and if so, put a flag to highlight row */

		if( this.data && this.data.sports_content && 
			(newData.sports_content.games.game[i].id == this.data.sports_content.games.game[i].id) ) {

			var newGame = newData.sports_content.games.game[i];
			var oldGame = this.data.sports_content.games.game[i];
			var same = (newGame.home.score + newGame.visitor.score) == (newGame.home.score + newGame.visitor.score);
			newData.sports_content.games.game[i]['highlight'] = !same;
		}
	}

	//this.newData = newData;
	//this.newData['hiddenGames'] = {};
	callback.call(this, newData);
};

Sports.prototype.writeToTemplate = function() {
	//console.log(this.data.sports_content.games.game)
	/*var templateData = {};
	templateData['games'] = this.data.sports_content.games.game;
	templateData['hiddenGames'] = this.data.hiddenGames;*/

	this.displayTemplate(this.$game_template, 'games', this.data.sports_content.games.game, 
		this.$game_table.find('tbody'));
};


NBA.prototype.updateEachGame = function(newData) {
	console.log('NBA updating');
	/*newData['hiddenGames'] = this.data['hiddenGames'];*/
	
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

NBA.prototype.highlightGames = function() {
	for (i=0; i < this.data.sports_content.games.game.length; i++) {
		if(this.data.sports_content.games.game[i].highlight == true)
		{
			var rowId = '#'+this.data.sports_content.games.game[i].id;
			/*takes too long: 
			$(rowId).fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100)();
			dom is being updated before it can finish lol
			*/
			$(rowId).effect("highlight", {color: '#FFFF99'}, 2000);		
		}
	};
};

NBA.prototype.standings = function() {
	var url = 'http://data.nba.com/json/cms/2015/standings/conference.json';
	this.getData(url, this.showStandings);
};

NBA.prototype.showStandings = function(data) {
	
	var templ = $('#NBA-standings-template').html();
	
	this.displayTemplate(templ, 'teams', 
		data.sports_content.standings.conferences.West.team, 
		$('#NBA-standings #West') );
	this.displayTemplate(templ, 'teams', 
		data.sports_content.standings.conferences.East.team, 
		$('#NBA-standings #East') );

	// Mark Playoff teams with grey line
	var border="border-bottom:3pt solid grey;";
	$($('#NBA-standings .modal-body #West tr')[8]).attr("style",border);
	$($('#NBA-standings .modal-body #East tr')[8]).attr("style",border);
};
