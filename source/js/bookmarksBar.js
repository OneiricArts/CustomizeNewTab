/**
	permissions need to be in manifest.json:
		"bookmarks",
		"chrome://favicon/"
*/
"use strict";
class Widget {
	constructor(){}


}

class BookmarksBar extends Widget {
	
	init() {
		chrome.bookmarks.getTree( this.createBookmarkList );
	}

	createBookmarkList(bookmarks_bar) {
		var bookmark_bar = bookmarks_bar[0].children[0].children;


		var bookmarks_arr = [];

		var i = 0;
		var counter = 0;
		while(counter < 7) {
			
			var bookmark = bookmark_bar[i];
			if(!bookmark.children) {
				bookmarks_arr.push(bookmark);
				counter++;
			}

			i++;
			console.log('a');
		}


		var tempalte_name = 'BookmarksBar'; 
		var dataKey = 'boomarks';
		var dataObj = bookmarks_arr;
		var $element = $('#bookmarks_bar'); 

	
		var template = Handlebars.templates[tempalte_name];

		var data = {};
		data[dataKey] = dataObj;

		var output = template(bookmarks_arr);
		
		$element.html(output);
	}
}


var a = new BookmarksBar()
if(dev_env) {
	a.init();
}
