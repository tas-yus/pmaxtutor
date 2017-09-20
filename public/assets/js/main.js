/* global $ */

$("document").ready(function(){
    setTimeout(function(){
        $("div.alert").remove();
    }, 3000 ); // 3 secs

});

// var numVidAdds = 1;
//
// $("#add-vids").click(() => {
// 	if(numVidAdds < 20) numVidAdds++;
// 	printInputs(numVidAdds);
// });
//
// $("#remove-vids").click(() => {
// 	if(numVidAdds > 1) numVidAdds--;
// 	printInputs(numVidAdds);
// });
//
// function printInputs(num) {
// 	var html = "";
// 	for (var i = 0; i < num; i++) {
// 	    html += "<input type='text' name='video' placeholder='video url'>";
// 	}
// 	html += "<button>Add</button>";
// 	$("#form-vidNew").html(html);
// }

$(".list-group-item").click(function() {
	if (!$(this).hasClass('active')) {
		$(this).toggleClass("active");
		$(".list-group-item.active").not(this).toggleClass("active");
	}
});
