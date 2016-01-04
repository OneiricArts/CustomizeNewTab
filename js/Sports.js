
/*
	Sports Object 
*/
function Sports() {
	Base.call(this);

	this.localData = {};
	this.schedule_url;

	this.hiddenGames = {};

	this.$games = {};
	this.$games_identifier;

	this.$game_table;
	this.$game_template;

	this.$no_games_message = '<span class="glyphicon glyphicon-bell"></span> No Games Today';
};

Sports.prototype = Object.create(Base.prototype); // See note below
Sports.prototype.constructor = Sports;

Sports.prototype.init = function() {
	this.loadLocalSchedule();
	this.cacheButtonActions();
};

Sports.prototype.cacheButtonActions = function() {};

Sports.prototype.getJsonData = function(url, callback) {
	console.log('getting from internet.');
	$.getJSON(url, function(result) {
		this.massageData.call(this, result, callback);
	}.bind(this));
	// TODO handle timeout, and network error
};

Sports.prototype.massageData = function(data, callback) {};

Sports.prototype.getDataSchedule = function() {
	this.getJsonData(this.schedule_url, this.displaySchedule);
};

/* Step 1: Check for local data 
   display that first, and then try to get new data
*/
Sports.prototype.loadLocalSchedule = function() {
	this.loadData( function(){
		this.writeScheduleToDOM();
		this.getDataSchedule();
	}, 
	this.getDataSchedule);
};

/* if not same time frame, overwrite */
Sports.prototype.displaySchedule = function(newData) {

	if(this.dataOutOfDate(newData)) {
		this.data = newData;
		this.saveData(this.writeScheduleToDOM());
	} 

	else {
		this.updateEachGame(newData);
	}
};

Sports.prototype.initWriteScheduleToDOM = function() {
	this.writeScheduleToDOM();
	
}

Sports.prototype.writeScheduleToDOM = function() {

	this.writeToTemplate();
	this.cacheGames();
	this.cacheScheduleActions();
	this.formatScheduleGames();
};

Sports.prototype.writeToTemplate = function() {};


/* FUNCTIONS THAT NEED TO BE OVERWRITTEN */

/* 
	@return true if needs updating
*/
Sports.prototype.dataOutOfDate = function(newData) {};


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

	var games = [];
	$('#NBA-schedul-games tr').each(function(){
		games[$(this).attr('id')] = $(this);
	});

	this.$games = games;
	/*var games = {};
	var id = this.$games_identifier;

	$(id).each(function(){
		games[$(this).attr('id')] = $(this);
	});

	this.$games = games;
	console.log(this.$games);*/
};



Handlebars.registerHelper('lookup', function(obj, field, options) {
	//return obj[field];
	console.log(obj);

	if (true)
		return options.fn(this);
	else
		return options.inverse(this);
	//return obj.hasOwnProperty(field);
});




