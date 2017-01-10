"use strict";

class Sport extends Widget {

	constructor() {
		super();
		this.schedule_url_start;
		this.schedule_url_end;
		this.schedule_url;
		this.today = new Date();
	}

	init() {
		this.loadLocalSchedule();
		this.cacheButtonActions();
		this.specificInit();
	}

	/*
		OVERWRITE in extending classes for unique functionality
	*/
	specificInit() {}
	cacheButtonActions() {}
	writeToTemplate() {}
	dataOutOfDate(newData) {return true;}
	updateNewData(newData) {}
	massageData(data, callback) {callback.call(this, data);}
	highlightGames() {}
	formatDate() {}

	yyyymmdd(changeDay) {
		if(changeDay) {
			this.today.setDate(this.today.getDate() + changeDay); 
		}
		else {
			this.today = new Date();
		}

		function twoDigits(n) {
			return n<10? '0'+n:''+n
		}

		var string = this.formatDate( 
				this.today.getFullYear(), 
				twoDigits(this.today.getMonth()+1), 
				twoDigits(this.today.getDate())
			);

		return string;
	}

	changeDay(n) {
		this.schedule_url = this.schedule_url_start + this.yyyymmdd(n) + this.schedule_url_end;
		this.resetSchedule();
	}

	getJsonData(url, callback) {
		$.getJSON(url, function(result) {
			this.massageData.call(this, result, callback);
		}.bind(this))
		.fail(function(result){
			//this.massageData.call(this, result, callback);
		}.bind(this));
		// TODO handle timeout
	}

	getDataSchedule () {
		this.getJsonData(this.schedule_url, this.displaySchedule);
	}

	loadLocalSchedule() {
		this.loadData( function(){
			this.writeScheduleToDOM();
			this.getDataSchedule();
		}, 
		this.getDataSchedule);
	}

	displaySchedule(newData) {
		this.updateNewData(newData);
		this.data = newData;
		this.saveData(this.writeScheduleToDOM());
	}

	writeScheduleToDOM() {
		this.writeToTemplate();
		this.highlightGames();
	}

	resetSchedule() {
		this.data = null;
		this.saveData(this.getDataSchedule);
	}

	updateSchedule() {
		this.getDataSchedule();
	}

	writeErrorMessage() {
		this.writeToTemplate(true);
	}
}