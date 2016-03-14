(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

/*
	how to setup for extension:
	https://davidsimpson.me/2014/05/27/add-googles-universal-analytics-tracking-chrome-extension/
	didn't know i had to do the check, and specify /new_tab.html
*/
ga('create', 'UA-72036968-1', 'auto');
ga('set', 'checkProtocolTask', function(){});
ga('send', 'pageview', '/new_tab.html');

/* send browser dimensions */
//var dimensions = window.innerHeight + "x" + window.innerWidth;
//ga('send', 'Browser Dimensions', 'plixels', dimensions);

/* load time */
ga('send', 'timing', 'JS Dependencies', 'load', timeSincePageLoad);


$('html').on('click', 'a', function(e){
	
	var descrip = e.target.id;
	if(descrip === "") {
		descrip = e.target.className;
	}
	if(descrip === "") {
		descrip = 'link';
	}

	ga('send', 'event', descrip, 'click');
});

$('html').on('click', 'button', function(e){

	var descrip = e.target.id;

	if(descrip === "") {
		descrip = e.target.className;
	}
	if(descrip === "") {
		descrip = 'button';
	}

	ga("send", "event", descrip, 'click');
});

$('html').on('click', 'span', function(e){

	var descrip = e.target.id;

	if(descrip === "") {
		descrip = e.target.className;
	}
	if(descrip === "") {
		descrip = 'span';
	}

	ga("send", "event", descrip, 'click');
});

/* 
	send uncaught exceptions to google analytics for now, will
	look into post to server later
*/
window.onerror = function(msg, url, line, col, error) {
 
	var extra = !col ? '' : '\ncolumn: ' + col;
	extra += !error ? '' : '\nerror: ' + error;
	error_msg = "Error: " + msg + "\nurl: " + url + "\nline: " + line + extra;

	ga('send', 'exception', {
		'exDescription': error_msg,
	});

	//ga("send", "event", msg, 'exception');
};