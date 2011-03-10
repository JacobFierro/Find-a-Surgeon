/* 
	Author: Jacob Fierro
	Purpose: Find a Surgeon App
	Date: 2-23-11
*/

// create namespace
var SRCH = typeof(SRCH) === "undefined" ? {} : SRCH;

SRCH.ListView = (function(){ 
    /* privately scoped code */

    return { /* public shit */ 

    } 

}());


SRCH.DataModel = (function(){ 
    /* privately scoped code */

    return { /* public shit */ 

    } 

}());


SRCH.DataManager = (function(){
   
   
   return {
       get_data : function() {
           
       }
   } 
});



$(document).ready(function() {
	//initialize to empty text field
	$("#input").focus().val("find some fucking shit");
	
	//setup lettering
	$(".filterable a").lettering();
	
	//bind the keyup event, publish value
	$('#input').keyup(function(){
		var value = $('#input').val().toLowerCase();
		
	});

});
