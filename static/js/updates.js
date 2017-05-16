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

function initializeContextMenus(items) {
  $(function(){
      $.contextMenu({
          selector: '.status-context-menu',
          trigger: 'left',
          callback: function(key, options) {
              if ($(this).attr('status_id') != key)
                  update($(this), key);
          },
          items: items,
      });
  });
}

$(document).ready(function() {
  items = {};
  $('#status_ids').children().each(function() {
      id = $(this).attr('id').replace("status_", "")
      status = $(this).text().trim();
      items[id] = { "name": status };
  });

  initializeContextMenus(items);
});
