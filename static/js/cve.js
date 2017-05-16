function update(c, s) {
  cve_id = c.attr('cve_id');
  kernel_id = c.attr('kernel_id');

  $.ajax({
    'type': 'POST',
    'url': '/update',
    'contentType': 'application/json',
    'data': JSON.stringify({
             kernel_id: kernel_id,
             status_id: s,
             cve_id: cve_id,
            })
  }).done(function(data) {
    if (data.error == "success") {
      c.attr('status_id', s);
      updateCVEStatus(c);
      $("#progressbar").attr("value", data.progress);
      $("#progressvalue").text(Math.floor(data.progress) + " %");
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

function initializeContextMenus() {
  $(function(){
      $.contextMenu({
          selector: '.status-context-menu',
          trigger: 'left',
          callback: function(key, options) {
              if ($(this).attr('status_id') != key)
                  update($(this), key);
          },
          items: {
              // TODO: dynamically populate this
              "1": {name: "unpatched"},
              "2": {name: "patched"},
              "3": {name: "does not apply"},
              "4": {name: "waiting on upstream"},
              "5": {name: "on gerrit"},
          }
      });
  });
}

$(document).ready(function() {
  updateProgressBar();
  initializeCVEStatuses();
  initializeContextMenus();
});
