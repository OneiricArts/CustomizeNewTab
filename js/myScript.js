var debug = false;
if(debug){console.log('myScript running ...');}


(function() {

    var obj = new pageHandeler();
    obj.init();


    var $myCols;

    $( document ).ready(function() {
        $myCols = $('.row');
        $('#page_options button').click(triggerWidget);

        console.log(obj);
        console.log(obj.data)

    });

    function triggerWidget() {
        $(this).find('span').toggleClass('glyphicon-ok').toggleClass('glyphicon-remove');
        var id = "#" + $(this).attr('id').split('-')[0] + "_col";
        $(id).toggle();
        resizeColumns();


        if($(this).find('span').hasClass('glyphicon-ok')) {
            obj.data[$(this).attr('id').split('-')[0]] = true;
        }
        else {
            obj.data[$(this).attr('id').split('-')[0]] = false;
        }
        obj.saveData();
    }

    function resizeColumns() {
        //console.log('resizing. ..');
        var visibleCols = $myCols.children(":visible");

        if(visibleCols.length == 2 && 
            $(visibleCols[1]).attr('id') === 'Links_col') {
           
            $myCols.children().removeClass()
            
            $(visibleCols[0]).addClass('col-sm-9');
            $(visibleCols[1]).addClass('col-sm-3');

        }
        else if(visibleCols.length == 3) {

            $(visibleCols[0]).addClass('col-sm-5');
            $(visibleCols[1]).addClass('col-sm-5');
            $(visibleCols[2]).addClass('col-sm-2');
        }
        else {
            var div = Math.floor(12 / visibleCols.length);
            var rem = 12 % visibleCols.length;
            var colSize = (rem === 0) ? div : 2;
            $myCols.children().removeClass().addClass('col-sm-'+colSize);
        }
    }
})();










