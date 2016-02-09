
/*
	NFL Object for the off-season
	first time going through cycle, so don't know how to consolidate
*/
function NFL() {
	Base.call(this);
};

NFL.prototype = Object.create(Base.prototype); 
NFL.prototype.constructor = NFL;

NFL.prototype.init = function() {
	//console.log('NFL off');
	NFLnews = new NFLnews();
	NFLnews.init();
};