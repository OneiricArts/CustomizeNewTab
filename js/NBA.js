
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


NBA.prototype.massageData = function(data, callback) {

	for (i=0; i < data.sports_content.games.game.length; i++) {

		var home_score = parseInt(data.sports_content.games.game[i].home.score);
		var visitor_score = parseInt(data.sports_content.games.game[i].visitor.score);

		data.sports_content.games.game[i].home['winning'] = (home_score > visitor_score);
		data.sports_content.games.game[i].visitor['winning'] = (visitor_score > home_score);
	}

	this.data = data;
	callback.call(this, data);
};

Sports.prototype.writeToTemplate = function() {
	console.log(this.data.sports_content.games.game)
	this.displayTemplate(this.$game_template, 'games', this.data.sports_content.games.game, 
		this.$game_table.find('tbody'));
};


NBA.prototype.updateEachGame = function(newData) {
	console.log('NBA updating');


	local_games = this.data.sports_content.games.game;
	all_games = newData.sports_content.games.game;

	var i,j;
	for (i=0, j=0; i < all_games.length; i++) {

		// same game?
		if(all_games[i].id == local_games[j].id) {
			
			var game_time = (all_games[i].period_time.period_status +  
							  all_games[i].period_time.game_clock) ==
							  (local_games[j].period_time.period_status +  
							  local_games[j].period_time.game_clock);

			var visitor_scores = all_games[i].visitor.score == local_games[j].visitor.score;
			var home_scores = all_games[i].home.score == local_games[j].home.score;
							  				  
			if( (!game_time) || (!visitor_scores) || (!home_scores) ) {
				
				console.log('new!');
				//writeGameDetails($games[all_games[i].id], all_games[i], true);
				local_games[j] = all_games[i];
				//saveLocalData();
				this.saveData();
				//this.saveData(this.writeToTemplate);
			}
			this.styleScores(local_games[j]);
			j++;
		}
	}
};

NBA.prototype.styleScores = function(game) {

		/*var visitor_score = parseInt(game.visitor.score);
		var home_score = parseInt(game.home.score);

		this.$games[game.id].find('#away_team').toggleClass('winning', visitor_score > home_score);
		this.$games[game.id].find('#home_team').toggleClass('winning', home_score > visitor_score);*/
	}