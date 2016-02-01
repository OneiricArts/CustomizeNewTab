
/*
	NFL Object 
*/
function NFLnews() {
	Base.call(this);

	//this.datakey = 'NFL_DATA';
	this.rNFLURL = 'https://www.reddit.com/r/nfl.json';
	this.importantFlairs = ['Breaking News', 'Injury Report']

};

NFLnews.prototype = Object.create(Base.prototype); 
NFLnews.prototype.constructor = NFL;

NFLnews.prototype.init = function(url, callback) {
	this.getData(this.rNFLURL, this.displayrNFL);
	this.dates();
};


NFLnews.prototype.displayrNFL = function(data) {
	
	var posts = data.data.children;
	var subPosts = posts.slice(0,5);

	for (var i = 5; i < posts.length; i++) {
		var flair = posts[i].data.link_flair_text;
		if(flair && (this.importantFlairs.indexOf(flair) > -1)) {
			subPosts.push(posts[i]);
		}
	}

	this.displayTemplate($('#rNFL-template').html(), 'posts', subPosts, $('#rNFL'));
};

NFLnews.prototype.dates = function() {
	var draftDate = new Date(2016, 03, 03); // April 3
	var superBowl = new Date(2016, 01, 07); // Sunday, February 7
	superBowl.setUTCHours(12+6+5,30);

	var dates = [];

	dates.push(countdown(new Date(), superBowl, countdown.DAYS | countdown.HOURS | countdown.MINUTES, 4).toString() 
		+ " to Super Bowl L");
		//+ " to the SUPERBOWL! (" + superBowl.toDateString() + ", " + superBowl.toLocaleTimeString() + ")");

	dates.push(countdown(new Date(), draftDate, countdown.MONTHS | countdown.DAYS, 2).toString() 
		+ " to the NFL Draft! (" + draftDate.toDateString() + ")");

	this.displayTemplate($('#NFL-dates-template').html(), 'dates', dates, $('#NFL-dates'));
};
