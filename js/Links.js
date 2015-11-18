function pageHandeler() {
	Base.call(this);
	this.datakey = 'links_data';
};

pageHandeler.prototype = Object.create(Base.prototype); // See note below

pageHandeler.prototype.constructor = pageHandeler;

pageHandeler.prototype.init = function(){
	//console.log(this.data);
   this.cacheDOM();
	this.loadData(this.datakey, this.loadWidget, this.setDefaults);
};

pageHandeler.prototype.cacheDOM = function(){
   this.domElement = $('#Links_col')
};

pageHandeler.prototype.loadWidget = function(){
   
};

pageHandeler.prototype.setDefaults = function(){

   this.data = [
      {
         name: 'r/NBA',
         url: 'https://www.reddit.com/r/nba'
      },
      {
         name: 'r/NFL',
         url: 'https://www.reddit.com/r/nfl'
      }
   ];

	this.loadWidget();
};
