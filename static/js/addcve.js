$(document).ready(function() {
  $('#addcve').on('click', function() {
    window.location = "/addcve/" + $('#cvetoadd').val()
  });
});
