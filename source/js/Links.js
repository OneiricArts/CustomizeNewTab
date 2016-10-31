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
   var that = this;
   
   $("#bookmark-panel").on('click', '#remove_customLink', function(evt) {
      evt.preventDefault(); 
      that.removeCustomLink($(this).closest('a'));
   });

   //$("body").on('click', '#bookmark-panel #remove', {that:this}, this.removeCustomLink);
   $("body").on('click', '#addBookmark', {that:this}, this.addBookmark);

   /* clear values on close */
   $('body').on('hidden.bs.modal', '#addCustomLinkModal', function () {
      $('#addCustomLinkModal .modal-body').find('textarea,input').val('');
   });
};

Links.prototype.addBookmark = function(event){
   var that = event.data.that;
   that.data.push({
         title: $('#bookmark_name').val(),
         url: $('#bookmark_url').val()
      });
   that.saveData(that.showTopSites());
};

Links.prototype.showTopSites = function(){
   chrome.topSites.get(function(mostVisitedURLs){
     
      //var $template = $("#Links-template").html();
      var dataKey = "links";
      var dataObj = {};

      dataObj['topSites'] = mostVisitedURLs.slice(0,5);

      if(this.data && this.data.length > 0) {
         dataObj['customSites'] = this.data;
      }

      var $element = $("#bookmark-panel");
      this.displayTemplate('Links', dataKey, dataObj, $element);
      this.saveData();
   }.bind(this));
};

Links.prototype.setDefaults = function() {

   this.data = [
      {
         title: 'NPR',
         url: 'http://www.npr.org/'
      },
      {
         title: 'UNICEF',
         url: 'http://www.unicef.org/'
      },
      {
         title: 'Hints',
         url: 'https://github.com/OneiricArts/CustomizeNewTab/wiki/Hints'
      }
      
   ];
   this.showTopSites();
};

Links.prototype.removeCustomLink = function($el) {
   
   this.data.splice(parseInt($el.attr('id').split('_')[0]),1);
   
   if(this.data.length == 0) {
      $('#custom-sites').remove();
      this.saveData();
   }
   else {
      this.saveData(this.showTopSites);
   }
};
