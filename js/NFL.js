
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

Sports.prototype.specialInit = function() {
	console.log('special init');

};

Sports.prototype.dataOutOfDate = function(newData) {
	console.log('dataOutOfDate')

	return !((this.data.gms) && this.data.gms.w == newData.gms.w);
};


Sports.prototype.writeScheduleToDOM = function() {
	console.log('write')
};

