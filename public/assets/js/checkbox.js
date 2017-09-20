$("#checkAllRadios").on("click" , function () {
	var allRadios = $("input[type=checkbox]");
	if ($(this).is(":checked")) {
		allRadios.prop("checked", true);
	} else {
		allRadios.prop("checked", false);
	}
});
