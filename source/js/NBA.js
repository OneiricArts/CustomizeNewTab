function NBA() {
	Sports.call(this);

	this.datakey = 'NBA_DATA';

	this.today;

	this.schedule_url = 'http://data.nba.com/json/cms/noseason/scoreboard/'+
						this.yyyymmdd()+'/games.json';

	this.$game_table = $('#NBA-panel #NBA_game_table');
	this.$game_template = $("#NBA-schedule-template").html();

	this.updateGamesID;

	this.rowId = '#NBA_widget';
	this.autoUpdateButtonId = this.rowId + ' #autoupdate-btn';
};

NBA.prototype = Object.create(Sports.prototype); // See note below
NBA.prototype.constructor = NBA;

NBA.prototype.off = function () {
	console.log('nba off');
	this.turnOffAutoUpdate();
};

NBA.prototype.yyyymmdd = function(changeDay) {

	if(changeDay) {
		this.today.setDate(this.today.getDate() + changeDay);
	}
	else {
		this.today = new Date();
	}

	function twoDigits(n) {
		return n<10? '0'+n:''+n
	}

	return ( this.today.getFullYear()+
	twoDigits(this.today.getMonth()+1)+twoDigits(this.today.getDate()) );
};

NBA.prototype.cacheButtonActions = function() {
	var that = this;
	$('body').on('click', '#NBA_game_table #remove-game-btn', {that: that}, this.removeGame);
	$('body').on('click', '#NBA_widget #reset_games', this.resetSchedule.bind(this));
	$('body').on('click', '#NBA_widget #update-btn', this.updateSchedule.bind(this));
	$('body').on('click', '#NBA_widget #autoupdate-btn', {that: that}, this.autoupdateSchedule);
	$('body').on('click', '#NBA_widget #standings-btn', this.standings.bind(this));
	$('body').on('click', '#NBA_widget #boxscore-btn', {that: that}, this.boxscore);
	$('body').on('click', '#NBA_widget #tomorrow-btn', this.tomorrowSchedule.bind(this));
	$('body').on('click', '#NBA_widget #yesterday-btn', this.yesterdaySchedule.bind(this));
	$('body').on('click', '#NBA_widget #today-btn', this.todaySchedule.bind(this));
};

NBA.prototype.removeGame = function(event) {

	var that = event.data.that;
	var id = $(this).closest('tr').attr('id');

	$('#'+id).remove();
	$('#c'+id).remove();

	for (var i = 0; i < that.data.sports_content.games.game.length; i++) {
		if(id == that.data.sports_content.games.game[i].id) {
			that.data.sports_content.games.game[i]['hidden'] = true;
			break;
		}
	};

	that.saveData();
};

NBA.prototype.dataOutOfDate = function(newData) {
	if(this.data == null || this.data.sports_content == null) {
		return true;
	}
	if(!newData.sports_content.games.game[0]){
		return true;
	}
	return !( newData.sports_content.games.game[0].date === this.yyyymmdd() );
};


NBA.prototype.massageData = function(newData, callback) {

	for (var i = 0; i < newData.sports_content.games.game.length; i++) {

		var home_score = parseInt(newData.sports_content.games.game[i].home.score);
		var visitor_score = parseInt(newData.sports_content.games.game[i].visitor.score);

		newData.sports_content.games.game[i].home['winning'] = (home_score > visitor_score);
		newData.sports_content.games.game[i].visitor['winning'] = (visitor_score > home_score);

		var newGame = newData.sports_content.games.game[i];

		/* check if scores or times have changed, and if so, put a flag to highlight row */
		if( this.data && this.data.sports_content && this.data.sports_content.games.game[i] &&
			(newData.sports_content.games.game[i].id ==
				this.data.sports_content.games.game[i].id) ) {

			//this.data.sfsdfa[i];

			var oldGame = this.data.sports_content.games.game[i];

			/* highlight */
			var same;
			if( newGame.home.score === '' ) {
				same = true;
			}
			else {
				same = (parseInt(newGame.home.score) + parseInt(newGame.visitor.score)) ==
					(parseInt(oldGame.home.score) + parseInt(oldGame.visitor.score));
			}
			newData.sports_content.games.game[i]['highlight'] = !same;
		}


		try {
			if(newData.sports_content.games.game[i].period_time.period_status === "PPD") {
				newData.sports_content.games.game[i].period_time.period_status = "Postponed";
			} else if(newData.sports_content.games.game[i].period_time.game_status === "1") {
				var hours = parseInt(newData.sports_content.games.game[i].time.substring(0,2));
				var minutes = parseInt(newData.sports_content.games.game[i].time.substring(2,4));
				var yyyy = parseInt(newData.sports_content.games.game[i].date.substring(0,4));
				var mm = parseInt(newData.sports_content.games.game[i].date.substring(4,6));
				var dd = parseInt(newData.sports_content.games.game[i].date.substring(6,8));

				var date = new Date(yyyy, mm, dd);

				var EST_UTC_OFFSET = 5; // EST + 5 = UTC

				date.setUTCHours(hours+EST_UTC_OFFSET%24, minutes);
				var gametime = date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
				newData.sports_content.games.game[i].period_time.period_status = gametime;
			}
		}
		catch (e) {
			console.log(e);
		}

		/* quarter status */

		/*
			clear game_clock if game is done or in half-time, the API sometimes
				still returns a value.
			Clear game_clock if 'Start/End of' (0.00 is redundant)
		*/
		if( newData.sports_content.games.game[i].period_time.period_status === "Final" ||
			newData.sports_content.games.game[i].period_time.period_status === "Halftime" ||
			newData.sports_content.games.game[i].period_time.period_status.includes('Start') ||
			newData.sports_content.games.game[i].period_time.period_status.includes('End') ) {
				newData.sports_content.games.game[i].period_time.game_clock = "";
		}

		//console.log(JSON.stringify(newData.sports_content.games.game[i].period_time));

		// Cleaning up time column, currently can get too long
		if (newData.sports_content.games.game[i].period_time.period_status.includes('Qtr') &&
			!newData.sports_content.games.game[i].period_time.period_status.includes('End')) {
			// #th Qtr ==> #Q
			newData.sports_content.games.game[i].period_time.period_status =
				`${newData.sports_content.games.game[i].period_time.period_value}Q`;
		} else if(newData.sports_content.games.game[i].period_time.period_status.includes('End')) {
			// End of 1st Qtr ==> End of 1st
			newData.sports_content.games.game[i].period_time.period_status =
				newData.sports_content.games.game[i].period_time.period_status.replace('Qtr', '');
		}

		// game is in overtime?
		var overtime = parseInt(newData.sports_content.games.game[i].period_time.period_value);
		var status = parseInt(newData.sports_content.games.game[i].period_time.game_status);

		if( overtime > 4 && status == 3) {
			newData.sports_content.games.game[i]['overtime'] = (overtime - 4);
		}

		var game = newData.sports_content.games.game[i];
		var period_value = parseInt(game.period_time.period_value);
		var game_clock = game.period_time.game_clock;

		if(devEnv) {
			// favorite team
			if(game.visitor.abbreviation === 'GSW' || game.home.abbreviation === 'GSW') {
				newData.sports_content.games.game[i].fav_team = true;
			}
		}

		// close game: game in progress, 4th qtr or OT, within 5 points
		if(status == 2 && period_value > 3 ) {

			var game_clock_min = parseFloat(game_clock.split(':')[0]);

			/*
				last 5 minutes of regulation, or all of OT (OT is only 5 mins)
				if there is no :, it means there are only seconds left, which i currently
				check by length of split
			*/
			if(game_clock_min < 6 || game_clock.split(':').length < 2) {
				var difference = parseInt(newGame.home.score) - parseInt(newGame.visitor.score);
				if( Math.abs(difference) < 6 ) {
					// mark as close game, and if its hidden, show
					newData.sports_content.games.game[i].close_game = true;
					//newData.sports_content.games.game[i].hidden = false;
				}
			}
		}

	} // forloop
	callback.call(this, newData);
};

/*
	case: no games
		- for now: handle in template, still want functionality of being able to
		cycle through games.

		- later: good place to put other informatoin (standings)
*/
NBA.prototype.writeToTemplate = function() {

	//this.data.sports_content.games.game.push({'home':'test'});

	if(this.updateGamesID) {
		this.data.sports_content.games['autoUpdating'] = true;
	} else {
		this.data.sports_content.games['autoUpdating'] = false;
	}

	this.data.sports_content.games.day = this.today.getDate();
	this.data.sports_content.games.month = this.today.getMonth()+1;
	this.data.sports_content.games.date = this.data.sports_content.sports_meta.season_meta.calendar_date;

	this.displayTemplate('NBAschedule', 'schedule',
		this.data.sports_content.games, $('#NBA_widget'));
};


NBA.prototype.updateEachGame = function(newData) {
	console.log('NBA updating');

	for (var i=0; i < this.data.sports_content.games.game.length &&
	i < newData.sports_content.games.game.length; i++) {
		if(this.data.sports_content.games.game[i].id !==
			newData.sports_content.games.game[i].id){
			console.log('data not same -- error');
			break;
		}
		if(this.data.sports_content.games.game[i]['hidden'] &&
			!this.data.sports_content.games.game[i].close_game) {
			newData.sports_content.games.game[i]['hidden'] = true;
		}
	};

	this.data = newData;
	this.saveData(this.writeScheduleToDOM());
};

NBA.prototype.autoupdateSchedule = function(event) {

	$(this).toggleClass('btn-secondary').toggleClass('btn-success');

	var self = event.data.that;

	if($(this).hasClass('btn-success')) {
		console.log('updating---');
		self.continueAutoUpdate.bind(self);
		self.updateGamesID = window.setInterval(self.continueAutoUpdate.bind(self), 10000);
	}
	else {
		//console.log('clearing---');
		//window.clearInterval(self.updateGamesID);
		self.turnOffAutoUpdate();
	}
};

NBA.prototype.continueAutoUpdate = function() {
	var all_games_done = true;
	for (var i=0; i < this.data.sports_content.games.game.length; i++) {
		if(this.data.sports_content.games.game[i].period_time.period_status !== "Final") {
			all_games_done = false;
			break;
		}
	}
	if(!all_games_done) {
		this.getDataSchedule();
	}
	else {
		this.turnOffAutoUpdate();
	}
};

NBA.prototype.turnOffAutoUpdate = function() {
	console.log('clearing---');
	window.clearInterval(this.updateGamesID);
	if($(this.autoUpdateButtonId).hasClass('btn-success')) {
		var btn = $(this.autoUpdateButtonId);
		btn.find('span').toggleClass('glyphicon-remove', true);
		btn.find('span').toggleClass('glyphicon-ok', false);
		btn.toggleClass('btn-success', false);
		btn.toggleClass('btn-default', true)
	}
};

NBA.prototype.highlightGames = function() {
	for (var i=0; i < this.data.sports_content.games.game.length; i++) {
		if(this.data.sports_content.games.game[i].highlight) {
			var rowId = '#'+this.data.sports_content.games.game[i].id;
			//$(rowId).effect("highlight", {color: '#FFFF99'}, 2000);
			//$(rowId).fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100).fadeIn(100).fadeOut(100).fadeIn(100);

			// doing it this way to remove jQueryUI dependency for now
			$(rowId).addClass("flash");
			setTimeout( removeHighlight, 2000);
			function removeHighlight(){ $(rowId).removeClass("flash"); }

			// clear after highlighted
			this.data.sports_content.games.game[i].highlight == false;
		}
	}
	/*
		clear highlight values, so doesn't hihglight before newdata comes in
		fixes bug where the same things highlight on new tab open
			--> put it in loop above
	*/
	/*for (i=0; i < this.data.sports_content.games.game.length; i++) {
		this.data.sports_content.games.game[i].highlight == false;
	}*/
};

NBA.prototype.standings = function() {
	const year = this.data.sports_content.sports_meta.season_meta.standings_season_year;
	NBAData.getStandings(year).then(result => this.showStandings(result));
};

NBA.prototype.showStandings = function(data) {

	//var templ = $('#NBA-standings-template').html();

	this.displayTemplate('NBAstandings', 'teams',
		data.sports_content.standings.conferences.West.team,
		$('#NBA-standings #West') );
	this.displayTemplate('NBAstandings', 'teams',
		data.sports_content.standings.conferences.East.team,
		$('#NBA-standings #East') );

	// Mark Playoff teams with grey line
	var border="border-bottom:3pt solid grey;";
	$($('#NBA-standings #West tr')[8]).attr("style",border);
	$($('#NBA-standings #East tr')[8]).attr("style",border);
};

NBA.prototype.boxscore = function(event) {
	var self = event.data.that;
	NBAData.getBoxScore(self.today, $(this).val())
		.then(result => self.showBoxscore(result));
};

NBA.prototype.showBoxscore = function(data) {
	try {
		var players = data.sports_content.game.home.players.player;
		data.sports_content.game.home.players.starters = players.splice(0,5);
		data.sports_content.game.home.players.bench = players;
		// players = data.sports_content.game.home.players.player;
		// data.sports_content.game.home.players.bench = players.splice(5,8);


		var players = data.sports_content.game.visitor.players.player;
		data.sports_content.game.visitor.players.starters = players.splice(0,5);
		data.sports_content.game.visitor.players.bench = players;

		this.displayTemplate('NBAboxscore', 'game',
			data.sports_content.game,
			$('#NBA-boxscore .modal-content') );
	} catch(e) {console.log(e);}
};

NBA.prototype.tomorrowSchedule = function(event) {
		this.schedule_url = 'http://data.nba.com/json/cms/noseason/scoreboard/'+
						this.yyyymmdd(1)+'/games.json';
	this.resetSchedule();
};

NBA.prototype.todaySchedule = function(event) {
		this.schedule_url = 'http://data.nba.com/json/cms/noseason/scoreboard/'+
						this.yyyymmdd(0)+'/games.json';
	this.resetSchedule();
};

NBA.prototype.yesterdaySchedule = function(event) {
		this.schedule_url = 'http://data.nba.com/json/cms/noseason/scoreboard/'+
						this.yyyymmdd(-1)+'/games.json';
	this.resetSchedule();
};
