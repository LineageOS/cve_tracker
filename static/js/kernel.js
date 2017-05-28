function openLinks(cve, cve_id) {
  $("#cvelinks").text("Loading...");
  $("#cvenotes").text("Loading...");

  $.ajax({
    'type': 'POST',
    'url': '/getlinks',
    'contentType': 'application/json',
    'data': JSON.stringify({
             cve_id: cve_id,
            })
  }).done(function(data) {
    $("#cvelinks").empty();
    $.each(JSON.parse(data), function(i, v) {
      if (!v.desc) v.desc = 'No description';
      $("#cvelinks").append("<a href='" + v.link + "' target='_blank'>" + shorten(v.link, 80) + "</a> - " + v.desc + "<hr>");
    });
    $("#cveeditlink").attr("href", "/editcve/" + cve);
    $("#cvecomparelink").attr("href", "/status/" + cve);
    $("#cveinfodialog").dialog('close');
    $("#cveinfodialog").dialog('option', 'title', cve).dialog('open');
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
    $('#cvenotes_input').val(data[0].notes);
    if (!data[0].notes) {
      data[0].notes = 'No notes';
    }
    $("#cvenotes").text(data[0].notes);
    $('#editnotesdialog').attr('cve_id', cve_id);
  });
}

$(document).ready(function() {
  $("#cveinfodialog").dialog({autoOpen: false, width: 'auto' });
  $("#cveinfodialog").on('dialogbeforeclose', function(event, ui) {
    $("#editnotesdialog").dialog('close');
  });

  $("#editnotesdialog").dialog({
    autoOpen: false,
    width: 'auto',
    buttons: [
      {
        text: "Save!",
        id: "savenotes",
        click: savenotes
      }
    ]
  });

  $("#deprecationdialog").dialog({
    autoOpen: false,
    width: "auto",
    modal: true,
    buttons: [
      {
        text: "Do eet!",
        click: savedeprecation
      }
    ]
  });
});

function editnotes() {
  $('#editnotesdialog').dialog('open');
}

function savenotes() {
  var cve_id = $('#editnotesdialog').attr('cve_id');
  var notes = $('#cvenotes_input').val();
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
      $('#cvenotes').text(notes);
      $('#editnotesdialog').dialog('close');
    } else {
        $("#editnoteserror").empty().append(data.error);
    }
  });
}

function deprecate() {
  $('#deprecationdialog').dialog('open');
}

function savedeprecation() {
  var kernel_id = $( this ).attr('kernel_id');
  var deprecated = $( this ).attr('deprecated')
  $.ajax({
    'type': 'POST',
    'url': '/deprecate',
    'contentType': 'application/json',
    'data': JSON.stringify({
            kernel_id: kernel_id,
            deprecate: deprecated,
    })
  }).done(function(data) {
    location.reload();
  });
}

function shorten(text, maxLength) {
  var ret = text;
  if (ret.length > maxLength) {
    ret = ret.substr(0, maxLength - 3) + "...";
  }
  return ret;
}
