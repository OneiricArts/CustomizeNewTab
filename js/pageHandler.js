function pageHandeler() {
	Base.call(this);
	this.datakey = 'pageHndler_widgets';
};

pageHandeler.prototype = Object.create(Base.prototype); // See note below

pageHandeler.prototype.constructor = pageHandeler;

pageHandeler.prototype.init = function(){
	//console.log(this.data);
	this.loadData(this.datakey, this.loadWidgets, this.setDefaults);
};


pageHandeler.prototype.loadWidgets = function(){
   	
   	console.log('loadWidgets');
   	console.log(this.data['NBA']);

   	NBAschedule.handler();
   	NFLschedule.handler();

   	if(this.data['NFL']) {
    	//NFLschedule.handler();
   	}
   	else {
   		$('#page_options #NFL-button').trigger("click");
   	}

   	if(this.data['NBA']) {
    	//NBAschedule.handler();
   	}
   	else {
		$('#page_options #NBA-button').trigger("click");
   	}

   	if(this.data['Links']) {
   	}
   	else {
		$('#page_options #Links-button').trigger("click");
   	}

};

pageHandeler.prototype.setDefaults = function(){

	console.log('setDefaults');
	this.data['NBA'] = true;
	this.data['NFL'] = true;
	this.data['Links'] = true;

	this.loadWidgets();
};
