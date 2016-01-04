
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
	console.log(this)
	$('body').on('click', '#NBA_game_table #remove-game-btn', function() {
		that.removeGame($(this).closest('tr').attr('id'));
	});

	$('body').on('click', '#NBA_col #reset_games', this.resetSchedule.bind(this));

	//$('#reset_games').click( that.resetSchedule.bind(this));
};


NBA.prototype.removeGame = function(id) {
	console.log(id);
	$('#'+id).remove();
	$('#c'+id).remove();

	/*
	if(!this.data['hiddenGames']) {
		this.data['hiddenGames'] = {};
	}
	this.data['hiddenGames'][id] = true;
	*/

	for (i=0; i < this.data.sports_content.games.game.length; i++) {
		if(id == this.data.sports_content.games.game[i].id) {
			this.data.sports_content.games.game[i]['hidden'] = true;
		}
	};

	this.saveData();
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

	//this.data = data;
	//this.data['hiddenGames'] = {};
	callback.call(this, data);
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

	//console.log(this.data);

	/*newData['hiddenGames'] = this.data['hiddenGames'];*/
	
	for (i=0; i < this.data.sports_content.games.game.length; i++) {

		if(this.data.sports_content.games.game[i]['hidden']) {
			newData.sports_content.games.game[i]['hidden'] = true;
		}
	};

	this.data = newData;
	this.saveData(this.writeScheduleToDOM());
};

NBA.prototype.styleScores = function(game) {

		/*var visitor_score = parseInt(game.visitor.score);
		var home_score = parseInt(game.home.score);

		this.$games[game.id].find('#away_team').toggleClass('winning', visitor_score > home_score);
		this.$games[game.id].find('#home_team').toggleClass('winning', home_score > visitor_score);*/
	}