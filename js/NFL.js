
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