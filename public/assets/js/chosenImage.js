$(document).ready(() => {
  $('img:not(.currentImg)').on("click", function() {
    $(".fade").removeClass("fade");
    $('.check-on-image').addClass("hidden");
    $('#preview').data('fileName', $(this).attr('alt'));
    $('#preview').data('uploaded', false);
    var img = $(this);
    var path = img.attr("alt");
    if ($(`#${path}`).prop('checked')) {
      $(`#${path}`).prop("checked", false);
      $(this).parent().find('i').addClass("hidden");
      img.removeClass("fade");
      $('#preview').parent().parent().addClass('hidden');
    } else {
      $(`#${path}`).prop("checked", true);
      $(this).parent().find('i').removeClass("hidden");
      img.addClass("fade");
      $('#preview').parent().parent().removeClass('hidden');
      $('#preview').attr('src', $(this).attr('src'));
      $("input[name='file']").val('');
    }
  });
  $("input[name='file']").on('change', function(){
      var fileName = $("input[name='file']")[0].files[0].name;
      if (fileName) {
        readIMG(this);
        $('#preview').data('fileName', removeExtension(fileName));
        $('#preview').data('uploaded', true);
        $("input[type='radio']").prop("checked", false);
        $('.check-on-image').addClass("hidden");
        $('img').removeClass("fade");
      } else {
        $('#preview').parent().parent().addClass('hidden');
      }
  });

  function readIMG(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
          $('#preview').parent().parent().removeClass('hidden');
          $('#preview').attr('src', e.target.result);
        }
        reader.readAsDataURL(input.files[0]);
    }
  }

  $('#show-old-photos').on('click', () => {
      var hidden = $('#old-photos').hasClass("hidden");
      if (hidden) {
        $('#old-photos').removeClass("hidden");
        $('i.fa-plus').removeClass('fa-plus').addClass('fa-minus');
      } else {
        $('#old-photos').addClass("hidden");
        $('i.fa-minus').removeClass('fa-minus').addClass('fa-plus');
      }
  });

  $('.closable').on('click', () => {
    $('#preview').parent().parent().addClass('hidden');
    $("input[type='radio']").prop("checked", false);
    $('.check-on-image').addClass("hidden");
    $('img').removeClass("fade");
    $("input[name='file']").val('');
  });

  function removeExtension(fileName) {
    var name = fileName.split(".")[0];
    return name;
  }
});
