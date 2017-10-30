$('img').on("click", function() {
  $(".fade").removeClass("fade");
  $("i").addClass("hidden");
  var img = $(this);
  var path = img.attr("alt");
  if ($(`#${path}`).prop('checked')) {
    $(`#${path}`).prop("checked", false);
    $(this).parent().find('i').addClass("hidden");
    img.removeClass("fade");
  } else {
    $(`#${path}`).prop("checked", true);
    $(this).parent().find('i').removeClass("hidden");
    img.addClass("fade");
  }
});
