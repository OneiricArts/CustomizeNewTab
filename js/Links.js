function Links() {
	Base.call(this);

   this.datakey = "Links_data";

   this.loadData(
      this.showTopSites,
      //this.setDefaults,
      this.setDefaults
   );
   
};

Links.prototype = Object.create(Base.prototype); // See note below

Links.prototype.constructor = Links;

Links.prototype.init = function(){
   this.showTopSites();
   
   var that = this;
   
   $("#bookmark-panel").on('click', '#remove', function(evt) {
      evt.preventDefault(); 
      console.log($(this).closest('a'));
      that.removeCustomLink($(this).closest('a'));
   });

   $('#addBookmark').click(function(){
      that.data.push({
         title: $('#bookmark_name').val(),
         url: $('#bookmark_url').val()
      });
      that.saveData();
      that.showTopSites();
   });
};

Links.prototype.showTopSites = function(){
   chrome.topSites.get(function(mostVisitedURLs){
     
      var $template = $("#Links-template").html();
      var dataKey = "links";
      var dataObj = {};

      dataObj['topSites'] = mostVisitedURLs.slice(0,5);

      if(this.data && this.data.length > 0) {
         dataObj['customSites'] = this.data;
      }

      var $element = $("#bookmark-panel");
      this.displayTemplate($template, dataKey, dataObj, $element);
      this.saveData();
   }.bind(this));
};

Links.prototype.setDefaults = function() {

   this.data = [
      {
         title: 'r/NBA',
         url: 'https://www.reddit.com/r/nba'
      },
      {
         title: 'r/NFL',
         url: 'https://www.reddit.com/r/nfl'
      }
   ];
   this.showTopSites();
};

Links.prototype.removeCustomLink = function($this) {
   console.log($this)
   this.data.splice(parseInt($this.attr('id')),1);
   $this.remove();
   this.saveData();
};
