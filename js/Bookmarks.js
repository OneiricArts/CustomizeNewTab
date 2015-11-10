var debug = true;

var Bookmarks = (function(){
	
	$( document ).ready(function() {
		var $addBookmark = $('#addBookmark');
		console.log($addBookmark);
		$addBookmark.click(addBookmark);
	});
	
	function addBookmark() {
		var $bookmark_list = $('#bookmark-list');
		console.log($bookmark_list);
		
		console.log('test');

		var bookmark = "<a href='" + $('#bookmark_url').val() + 
		"' class='list-group-item'>" + $('#bookmark_name').val() + "</a>"
		$bookmark_list.append(bookmark);
	}

	/* API for other js code */
	return {
		//handler: handler,
	}

})();