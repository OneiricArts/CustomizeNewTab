
/*
	NFL Object 
*/
function NFL() {
	Sports.call(this);

	this.datakey = 'NFL_DATA';
	this.schedule_url = 'http://www.nfl.com/liveupdate/scorestrip/ss.json';
};

NFL.prototype = Object.create(Sports.prototype); // See note below
NFL.prototype.constructor = NFL;

NFL.prototype.specialInit = function() {
	this.$game_table = $('#NFL_col #NFL-schedule-table');
	this.$game_template = $("#NFL-schedule-template").html();

	//this.playbyplay();
};

NFL.prototype.dataOutOfDate = function(newData) {

	return false;
	if(this.data == null) {return true;}
	return !((this.data.gms) && this.data.gms.w == newData.gms.w);
};

NFL.prototype.writeScheduleToDOM2 = function() {
	this.displayTemplate(this.$game_template, 'games', this.data.gms, this.$game_table.find('tbody'));
};


Sports.prototype.cacheScheduleActions = function() {

	var games = {};
	$('#NFL-schedule-games tr').each(function(){
		games[$(this).attr('id')] = $(this);
	});
	this.$games = games;

	var that = this;
	$('#NFL-schedule-games button').unbind();
	$('#NFL-schedule-games button').click({that: that}, this.removeGame);

	$('#reset_games').unbind(); 
	$('#reset_games').click( that.resetSchedule.bind(this));
};


NFL.prototype.removeGame = function(event) {
	var that = event.data.that;
	var targetId = $(this).closest('tr').attr('id');

	for (var i = 0; i < that.data.gms.length; i++) {

		if(that.data.gms[i].eid == targetId) 
		{
			that.data.gms.splice(i, 1);
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
	console.log('teasdfsdfst')

	var counter = 0;
	var i,j;	// i for old, j for new
	for (i=0, j=0; j < this.data.gms.length; i++) {

		var new_game = newData.gms[i];
		var old_game = this.data.gms[j];

		if(new_game.eid == old_game.eid) {
			this.data.gms[j] = new_game;
			j++;
			counter++;
		}
	}
	this.saveData();
	this.writeScheduleToDOM();
	console.log(counter);
};

