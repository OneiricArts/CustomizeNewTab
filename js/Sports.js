
/*
	Sports Object 
*/
function Sports() {
	Base.call(this);

	this.localData = {};
	this.schedule_url;
	this.$games = {};

	this.$games_identifier;

	this.$game_table;
	this.$no_games_message = '<span class="glyphicon glyphicon-bell"></span> No Games Today';
};

Sports.prototype = Object.create(Base.prototype); // See note below
Sports.prototype.constructor = Sports;

Sports.prototype.init = function() {
	this.loadLocalSchedule();

	this.specialInit();
};

Sports.prototype.specialInit = function() {};

Sports.prototype.getJsonData = function(url, callback) {

	console.log('getting from internet.');
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




/* only done on start */
Sports.prototype.loadLocalSchedule = function() {
	this.loadData(this.displayLocalData, this.getDataSchedule);
};

Sports.prototype.displayLocalData = function() {
	this.writeScheduleToDOM()
	this.getDataSchedule();
};

Sports.prototype.getDataSchedule = function() {
	this.getJsonData(this.schedule_url, this.displaySchedule);
};

Sports.prototype.displaySchedule = function(newData) {

	// display new data
	if(this.dataOutOfDate(newData)) {
		this.data = newData;
		this.saveData(this.writeScheduleToDOM());
	} 

	// display old data
	else {
		this.getJsonData(this.schedule_url, this.updateEachGame);
	}
};

Sports.prototype.initWriteScheduleToDOM = function() {
	this.writeScheduleToDOM();
	
}

Sports.prototype.writeScheduleToDOM = function() {
	
	if(this.data.gms.length == 0) {
		this.$game_table.html(this.$no_games_message);
		return;
	}
	this.writeScheduleToDOM2();
	this.cacheScheduleActions();
	this.formatScheduleGames();
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
Sports.prototype.writeScheduleToDOM2 = function() {};

Sports.prototype.cacheScheduleActions = function() {};

/*
	Check individual Games for chances
*/
Sports.prototype.updateEachGame = function(newData) {};

Sports.prototype.formatScheduleGames = function() {};


Sports.prototype.resetSchedule = function() {
	this.data = null;
	this.saveData(this.getDataSchedule);
};


/* UNIVERSAL DOM MANIPULATION */
Sports.prototype.cacheGames = function(callback) {
	var games = {};
	var id = this.$games_identifier;

	$(id).each(function(){
		games[$(this).attr('id')] = $(this);
	});

	this.$games = games;
	console.log(this.$games);
};

Sports.prototype.displayTemplate = function($template, dataKey, dataObj, $element) {

	var source = $template;
	var template = Handlebars.compile(source);
	var data = {};
	data[dataKey] = dataObj;
	var output = template(data);
	$element.html(output);
};




