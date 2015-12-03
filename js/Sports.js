
/*
	Sports Object 
*/
function Sports() {
	Base.call(this);

	this.localData = {};
	this.schedule_url;
	this.$games = {};

	this.$games_identifier;
};

Sports.prototype = Object.create(Base.prototype); // See note below
Sports.prototype.constructor = Sports;

Sports.prototype.init = function() {
	this.displaySchedule();
	this.specialInit();
};

Sports.prototype.specialInit = function() {};

Sports.prototype.getData = function(url, callback) {

	$.getJSON(url, function(result) {

		if(result) {
			callback.call(this, result);
		}
		else {
			// TODO handle error
		}
	}.bind(this));
	// TODO handle timeout, and network error
};

/*
	Display the Schedule
	- local data?
		yes: write to dom -> get data and check if local data out of date?
			yes: save, and write to dom
			no: update each game
		no: get data & write to dom
*/

Sports.prototype.displaySchedule = function() {
	this.loadLocalSchedule();
};

Sports.prototype.getDataSchedule = function() {
	this.getData(this.schedule_url, this.getSchedule);
};

Sports.prototype.loadLocalSchedule = function() {

	this.loadData(this.displayLocalData, this.getDataSchedule);
};

Sports.prototype.displayLocalData = function() {
	this.writeScheduleToDOM()
	this.getData(this.schedule_url, this.getSchedule);
};

Sports.prototype.getSchedule = function(newData) {

	if(this.dataOutOfDate(newData)) {
		this.data = newData;
		this.saveData(this.writeScheduleToDOM());
	} 

	else {
		this.getData(this.schedule_url, this.updateEachGame);
	}
};


/* FUNCTIONS THAT NEED TO BE OVERWRITTEN */

/* 
	do a check to see if local data is up-to-date. do not
	want to overwrite, since we edit local data to keep track
	of removed games 
	@return true if needs updating
*/
Sports.prototype.dataOutOfDate = function(newData) {};

/*
	write the schedule to the dom 
*/
Sports.prototype.writeScheduleToDOM = function() {};

/*
	Check individual Games for chances
*/
Sports.prototype.updateEachGame = function(newData) {};



/* UNIVERSAL DOM MANIPULATION */
Sports.prototype.cacheGames = function(callback) {
	var games = [];
	var id = this.$games_identifier

	$(id).each(function(){
		games[$(this).attr('id')] = $(this);
	});

	$games = games;
};


