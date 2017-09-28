var $myGroup = $('#myGroup');
$myGroup.on('show.bs.collapse','.collapse', function() {
    $myGroup.find('.collapse.in').collapse('hide');
});

$("a[role='button']").on("click", function() {
  if ($(this).find("i.fa-plus").length !== 0) {
    $(this).find("i.fa-plus").attr("class", "fa fa-minus");
  } else {
    $(this).find("i.fa-minus").attr("class", "fa fa-plus");
  }
});
