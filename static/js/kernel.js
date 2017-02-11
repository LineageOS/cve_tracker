function openLinks(cve, cve_id) {
  $("#links").empty();

  $.ajax({
    'type': 'POST',
    'url': '/getlinks',
    'contentType': 'application/json',
    'data': JSON.stringify({
             cve_id: cve_id,
            })
  }).done(function(data) {
    $.each(JSON.parse(data), function(i, v) {
      $("#links").append("<a href='" + v.link + "' target='_blank' >" + v.link + "</a> - " + v.desc + "<br/>");
    });
    $("#links").append("<br><a href='/editcve/" + cve + "'>edit</a>");
    $("#links").dialog('option', 'title', cve).dialog('open');
  });
}

$(document).ready(function() {
  $("#links").dialog({ autoOpen: false,
                       width: 'auto'
                     });
});
