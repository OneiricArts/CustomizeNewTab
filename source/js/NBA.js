class NBA extends Sport {

	constructor() {
		super();
		this.dataKey = 'NBA_DATA';
		this.$game_table = $('#NBA-panel #NBA_game_table');
		this.$game_template = $("#NBA-schedule-template").html();

		this.updateGamesID;

		this.rowId = '#NBA_widget';
		this.autoUpdateButtonId = this.rowId + ' #autoupdate-btn';
	}

	off() {
		console.log('nba off');
		this.turnOffAutoUpdate();
	}

	async getJsonData(url, callback) {
    const data = await NBAData.getSchedule(this.today);
    callback.call(this, data);
	}

  displaySchedule(newResult) {
    const newData = newResult;
    try {
			for (var i = 0; i < this.data.sports_content.games.game.length &&
				i < newData.sports_content.games.game.length; i++) {

					if(this.data.sports_content.games.game[i].id !==
					newData.sports_content.games.game[i].id){
					console.log('data not same -- error');
					break;
				}

				var oldGame = this.data.sports_content.games.game[i];
				var newGame = newData.sports_content.games.game[i];

				// hide?
				if(oldGame['hidden'] && !oldGame.close_game) {
					newGame['hidden'] = true;
				}

				// highlight?
				var same;
				if( newGame.home.score === '' ) {
					same = true;
				}
				else {
					same = (parseInt(newGame.home.score) + parseInt(newGame.visitor.score)) ==
								 (parseInt(oldGame.home.score) + parseInt(oldGame.visitor.score));
				}
				newData.sports_content.games.game[i]['highlight'] = !same;
				// newData.sports_content.games.game[i]['highlight'] = true;
			};
    } catch (excption) {
      // do nothing
    }

    this.data = newData;
    this.saveData(this.writeScheduleToDOM());
  }

	writeToTemplate() {
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
	}

	cacheButtonActions() {
		var that = this;
		$('body').on('click', '#NBA_game_table #remove-game-btn', {that: that}, this.removeGame);
		$('body').on('click', '#NBA_widget #reset_games', this.resetSchedule.bind(this));
		$('body').on('click', '#NBA_widget #update-btn', this.updateSchedule.bind(this));
		$('body').on('click', '#NBA_widget #autoupdate-btn', {that: that}, this.autoupdateSchedule);
		$('body').on('click', '#NBA_widget #standings-btn', this.standings.bind(this));
		$('body').on('click', '#NBA_widget #boxscore-btn', {that: that}, this.boxscore);
		$('body').on('click', '#NBA_widget #tomorrow-btn', this.changeDay.bind(this, 1));
		$('body').on('click', '#NBA_widget #yesterday-btn', this.changeDay.bind(this, -1));
		$('body').on('click', '#NBA_widget #today-btn', this.changeDay.bind(this, 0));
	}

	removeGame(event) {
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
	}

	highlightGames() {
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
	}

	// AUTO UPDATING CODE

	autoupdateSchedule(event) {

		$(this).toggleClass('btn-secondary').toggleClass('btn-success');

		var self = event.data.that;

		if($(this).hasClass('btn-success')) {
			console.log('updating---');
			self.continueAutoUpdate.bind(self);
			self.updateGamesID = window.setInterval(self.continueAutoUpdate.bind(self), 10000);
		}
		else {
			self.turnOffAutoUpdate();
		}
	}

	continueAutoUpdate() {
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
	}

	turnOffAutoUpdate() {
		console.log('clearing---');
		window.clearInterval(this.updateGamesID);
		if($(this.autoUpdateButtonId).hasClass('btn-success')) {
			var btn = $(this.autoUpdateButtonId);
			btn.find('span').toggleClass('glyphicon-remove', true);
			btn.find('span').toggleClass('glyphicon-ok', false);
			btn.toggleClass('btn-success', false);
			btn.toggleClass('btn-default', true)
		}
	}

	// standings

	async standings(){
		const year = this.data.sports_content.sports_meta.season_meta.standings_season_year;
		const data = await NBAData.getStandings(year);

		//var templ = $('#NBA-standings-template').html();

		this.displayTemplate('NBAstandings', 'teams', data.sports_content.standings.conferences.West.team, $('#NBA-standings #West'));
		this.displayTemplate('NBAstandings', 'teams', data.sports_content.standings.conferences.East.team, $('#NBA-standings #East'));

		// Mark Playoff teams with grey line
		var border="border-bottom:3pt solid grey;";
		$($('#NBA-standings #West tr')[8]).attr("style",border);
		$($('#NBA-standings #East tr')[8]).attr("style",border);
	}

	async boxscore(event) {
		var self = event.data.that;
		const data  = await NBAData.getBoxScore(self.today, $(this).val());
		self.displayTemplate('NBAboxscore', 'game', data.sports_content.game, $('#NBA-boxscore .modal-content'));
	}
}
