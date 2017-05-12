function update(c) {
  cve_id = $(c).attr('cve_id');
  kernel_id = $(c).attr('kernel_id');
  oldStatus = parseInt($(c).attr('status_id'));
  newStatus = oldStatus == 5 ? 1 : oldStatus + 1;

  $.ajax({
    'type': 'POST',
    'url': '/update',
    'contentType': 'application/json',
    'data': JSON.stringify({
             kernel_id: kernel_id,
             status_id: newStatus,
             cve_id: cve_id,
            })
  }).done(function(data) {
    if (data.error == "success") {
      $(c).attr('status_id', newStatus);
      updateCVEStatus($(c));
      $("#progressbar").attr("value", data.progress);
      updateProgressBar();
    }
  });
}

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
