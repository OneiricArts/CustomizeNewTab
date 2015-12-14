
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

	this.playbyplay();
};

NFL.prototype.dataOutOfDate = function(newData) {

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
			//$(this).closest('tr').remove();
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

NFL.prototype.playbyplay = function() {

	id = 2015120300; // game.eid

	var pbp_url = 'http://www.nfl.com/liveupdate/game-center/'+id+'/'+id+'_gtd.json'
	
	$.getJSON(pbp_url, function(result) {

		var drives = result[id]['drives'];
		var curr = drives.crntdrv;
		var plays = drives[curr].plays;

		keys = []
		for(k in plays) {
			keys.push(parseInt(k));
		}
		keys.sort();
		console.log(keys)

		for (var i = 0; i < keys.length; i++) {
			var desc = plays[keys[i]].desc;
			var down = plays[keys[i]].down;
			var ydstogo = plays[keys[i]].ydstogo;
			var ydsnet = plays[keys[i]].ydsnet;

			console.log(ydsnet);

			console.log(down  +'|' + ydstogo + '|' + ydsnet + '| --' + desc);
		};
	});
};