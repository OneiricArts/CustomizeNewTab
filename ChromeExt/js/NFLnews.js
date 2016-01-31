
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
};


NFLnews.prototype.displayrNFL = function(data) {
	
	var posts = data.data.children;

	for (var i = 0; (i < posts.length) && (i < 5); i++) {
		console.log(i+1 + ' ... ' + posts[i].data.title);
	}

	var subPosts = posts.slice(0,5);

	console.log('---')

	for (var i = 5; i < posts.length; i++) {
		
		var flair = posts[i].data.link_flair_text;
		if(flair && (this.importantFlairs.indexOf(flair) > -1)) {
			console.log(flair);

			subPosts.push(posts[i]);
		}
	}
	console.log('---')


	this.displayTemplate($('#rNFL-template').html(), 'posts', subPosts, 
			$('#rNFL'));
};