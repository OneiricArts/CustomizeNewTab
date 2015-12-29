
var Bookmarks = (function(){
	
	$( document ).ready(function() {
		displayLocal();
		addHooks();
	});
	
	function addBookmark() {
		var $bookmark_list = $('#bookmark-list');

		console.log($bookmark_list);
		
		var bookmark = "<a href='" + $('#bookmark_url').val() + 
		"' class='list-group-item'>" + $('#bookmark_name').val() + "</a>"
		
		$bookmark_list.append(bookmark);
		saveLocal();
	}

	function editBookmarks() {

		console.log($('#bookmark-list a'));
		if($(this).hasClass("btn-danger")){ // was in edit mode, remove
			$('#bookmark-list a').unbind("click"); // will remove preventDefault and removeLink
			$(this).toggleClass('btn-danger',false);
		} 

		else{
			$( '#bookmark-list a' ).click(function( event ) {
				event.preventDefault();
			});

			$('#bookmark-list a').bind("click", removeLink);
			$(this).toggleClass('btn-danger',true);
		}
		saveLocal();
	}

	function removeLink() {
		$(this).remove();
		saveLocal();
	}

	function saveLocal() {

		var $list = $('#bookmark-list').html();
		chrome.storage.local.set({'localBookmarks': $list});
	}


	function displayLocal() {
		chrome.storage.local.get('localBookmarks', function (result) {
			
			// if (false && result.localBookmarks) will reset
			if(result.localBookmarks) {
				$('#bookmark-list').html("");
				$('#bookmark-list').append(result.localBookmarks);
			}

			saveLocal();

		});
	}

	function addHooks(){
		var $addBookmark = $('#addBookmark');
		$addBookmark.click(addBookmark);

		var $editBookmarks = $('#editBookmarks');
		$editBookmarks.click(editBookmarks);

		/*$('#bookmark-panel').on('click', 'a', function(event){
			console.log('00000000000')
			event.preventDefault();
			console.log($(this).attr("href"))
			chrome.tabs.create({ url: $(this).attr("href") });
		});*/
	}
	/* API for other js code */
	return {
		//handler: handler,
	}

})();