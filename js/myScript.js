if(debug){console.log('myScript running ...');}
NFLschedule.handler();
NBAschedule.handler();

var $myCols;

$( document ).ready(function() {
    //console.log( "ready!" );

    $myCols = $('.row');
    $('#page_options button').click(triggerNFL);

});


function triggerNFL() {

	$(this).find('span').toggleClass('glyphicon-ok').toggleClass('glyphicon-remove');

	var id = "#" + $(this).attr('id').split('-')[0] + "_col";

	$(id).toggle();
	resizeColumns();
}



function resizeColumns() {

	console.log('resizing. ..');

    var visibleCols = $myCols.children(":visible").length;

    console.log($myCols);

    var div = Math.floor(12 / visibleCols);
    var rem = 12 % visibleCols;

    var colSize = (rem === 0) ? div : 2;

    $myCols.children().removeClass().addClass('col-md-'+colSize);

}