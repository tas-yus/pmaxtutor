/* global $ */

$("document").ready(function(){
    setTimeout(function(){
        $("div.alert").remove();
    }, 3000 ); // 3 secs
});

$(".list-group-item").click(function() {
	if (!$(this).hasClass('active')) {
		$(this).toggleClass("active");
		$(".list-group-item.active").not(this).toggleClass("active");
	}
});

$( function() {
  $( ".draggable" ).draggable();
} );

function createCode(str) {
  if (!str) return "";
  var result;
  result = str.toLowerCase();
  result = result.trim();
  result = result.replace(/ /g, "-");
  return result;
}

function nowLoadingForm() {
  $('.form-wrapper').addClass('fade');
  $('.loader-wrapper-form').removeClass('hidden');
}
function unNowLoadingForm() {
  $('.form-wrapper').removeClass('fade');
  $('.loader-wrapper-form').addClass('hidden');
}
function displayErr(err) {
  if (!err) return;
  $('.err-message').removeClass('hidden');
  $('.err-message').text('*' + err.responseText);
  setTimeout(() => {
    $('.err-message').addClass('hidden');
  }, 3000);
}

function rejectForm(err) {
  unNowLoadingForm();
  displayErr(err);
}

function uploadFile() {
  var url = '/api/images/upload';
  var data = new FormData();
  var fileName = $("input[name='fileName']").val();
  var title = $("input[name='title']");
  if (!fileName && $('#preview').data('uploaded')) {
    $('#preview').data('fileName', createCode(title.val()));
  }
  data.append('fileName', fileName);
  $.each($("input[type='file']")[0].files, function(i, file) {
      data.append('file', file);
  });
  return $.ajax({
    url,
    data,
    cache: false,
    contentType: false,
    processData: false,
    method: 'POST',
  });
}
