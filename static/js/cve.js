function updateCVEStatus(target) {
  status_id = target.attr('status_id');
  target.removeClass (function (index, css) {
    return (css.match (/(^|\s)status_\S+/g) || []).join(' ');
  });
  target.addClass("status_" + status_id);
  target.html($("#status_" + status_id).html());
  
}

function initializeCVEStatuses() {
  $.each($(".status"), function(key, value) {
    updateCVEStatus($(value));
  });
}

$(document).ready(function() {
  initializeCVEStatuses();
});
