function updateProgressBar() {
  $("#progressbar").progressbar({
    value: parseInt($("#progressbar").attr("value")),
  });
}

function updateCVEStatus(target) {
  status_id = target.attr('status_id');
  target.removeClass (function (index, css) {
    return (css.match (/(^|\s)status_\S+/g) || []).join(' ');
  });
  target.addClass("status_" + status_id);
  target.html($("#status_" + status_id).html());
  
}

function initializeCVEStatuses() {
  $.each($(".cvediv"), function(key, value) {
    updateCVEStatus($("#" + $(value).attr('id') + " :nth-child(2)"));
  });
}

$(document).ready(function() {
  updateProgressBar();
  initializeCVEStatuses();
});
