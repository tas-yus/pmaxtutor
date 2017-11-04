var checkable = $(".checkable");

checkable.each(function() {
  $(this).click(function(e) {
    e.preventDefault();
    var done = false;
    var url = $(this).parent().parent().attr("href").replace("learn", "done");
    $.ajax({
      method: "POST",
      url: url,
      dataType: "json"
    }).done(() => {
      console.log("done");
    }).fail((err) => {
      if(err.status == 200) {
        $(this).removeClass("fa-circle-o");
        $(this).addClass("fa-check-circle-o");
      } else {
        console.log(err);
      }
    });
  });
});
