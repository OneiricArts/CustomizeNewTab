
/*
	NFL Object 
*/
function NFLnews() {
	Base.call(this);

	//this.datakey = 'NFL_DATA';
	this.rNFLURL = 'https://www.reddit.com/r/nfl.json';
	this.importantFlairs = ['Breaking News', 'Injury Report', 'Look Here!', 'Retirement', 'Serious'];
	this.ignoreFlairs = ['Rumor', 'Misleading'];

};

NFLnews.prototype = Object.create(Base.prototype); 
NFLnews.prototype.constructor = NFL;

NFLnews.prototype.init = function() {
	this.getData(this.rNFLURL, this.displayrNFL);
	this.dates();
};


NFLnews.prototype.displayrNFL = function(data) {
	
	var posts = data.data.children;  // all posts on rNFL front page
	var subPosts = [];				 // posts that I will show
	//var subPosts = posts.slice(0,5);
	
	var i = 0;		  // index of post in array
	var counter = 0;  // count to 5 posts

	/* 
		get top 5 posts, minus any posts with "bad flair" (e.g. rumor)
			- don't respect hidden because no one is logged in
			- while v. for -- need to skip over indices but still get 5 
	*/
	while ( (counter < 5) && (i < posts.length) ) {

		var flair = posts[i].data.link_flair_text;
		
		if( !flair ) {
			subPosts.push(posts[i]);
			counter++;
		} else if( this.ignoreFlairs.indexOf(flair) < 0 ) { // not in ignoreFlairs array
			subPosts.push(posts[i]);
			counter++;
		}
		i++;
	}

	/* get any important posts not in top 5 */
	while (i < posts.length) {
		var flair = posts[i].data.link_flair_text;
		if( flair && (this.importantFlairs.indexOf(flair) > -1) ) { // in importantFlairs array
			subPosts.push(posts[i]);
		}
		i++;
	}

	this.displayTemplate($('#rNFL-template').html(), 'posts', subPosts, $('#rNFL'), false);
};

NFLnews.prototype.dates = function() {
	var draftDate = new Date(2016, 03, 03); // April 3
	var superBowl = new Date(2016, 01, 07); // Sunday, February 7
	//superBowl.setUTCHours(12+6+5,30);

	var dates = [
		{
			"countdown": countdown(new Date(), draftDate, countdown.MONTHS | countdown.DAYS, 2).toString(),
			"message": 'to the NFL Draft!',
			"date": draftDate.toDateString()
		}
	];

	//+ " to the SUPERBOWL! (" + superBowl.toDateString() + ", " + superBowl.toLocaleTimeString() + ")");

	this.displayTemplate($('#NFL-dates-template').html(), 'dates', dates, $('#NFL-dates'));
};
