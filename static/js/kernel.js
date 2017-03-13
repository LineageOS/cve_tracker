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
      if (!v.desc) v.desc = 'No description';
      $("#links").append("<a href='" + v.link + "' target='_blank' >" + v.link + "</a> - " + v.desc + "<br/>");
    });
    $("#links").append("<br><a href='/editcve/" + cve + "'>edit</a>");
    $("#links").dialog('option', 'title', cve).dialog('open');
  });

  $.ajax({
    'type': 'POST',
    'url': '/getnotes',
    'contentType': 'application/json',
    'data': JSON.stringify({
      cve_id: cve_id,
    })
  }).done(function(data) {
    data = JSON.parse(data);
    $('#cvenotes').val(data[0].notes);
    if (!data[0].notes) {
      data[0].notes = 'No notes';
    }
    $("#links").prepend("<div><span id='cve_notes'>" + data[0].notes + "</span> <a class='small button' onclick='editnotes(this);'>Edit</a></div>");
    $('#editnotes').attr('cve_id', cve_id);
  });
}

$(document).ready(function() {
  $("#links").dialog({ autoOpen: false, width: 'auto' });
  $("#editnotes").dialog({ autoOpen: false, width: 'auto' });

  $("#links").on('dialogbeforeclose', function(event, ui) {
    $("#editnotes").dialog('close');
  });

  $('#savenoteslink').on('click', function() {
    var cve_id = $('#editnotes').attr('cve_id');
    var notes = $('#cvenotes').val();
    $.ajax({
      'type': 'POST',
      'url': '/editnotes',
      'contentType': 'application/json',
      'data': JSON.stringify({
               cve_id: cve_id,
               cve_notes: notes,
      })
    }).done(function(data) {
      if (data.error == "success") {
        if (!notes) {
          notes = 'No notes';
        }
        $('#cve_notes').text(notes);
        $('#editnotes').dialog('close');
      } else {
        $("#editnoteserror").empty().append(data.error);
      }
    });
  });
});

function editnotes() {
  $('#editnotes').dialog('option', 'title', 'Edit CVE notes').dialog('open');
}
