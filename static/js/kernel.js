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
      $("#cvelinks").append("<a href='" + v.link + "' target='_blank' >" + v.link + "</a> - " + v.desc + "<br/>");
    });
    $("#cveeditlink").attr("href", "/editcve/" + cve);
    $("#cvecomparelink").attr("href", "/status/" + cve);
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
  $("#cveinfodialog").dialog({ autoOpen: false, width: 750, maxWidth: 960 });
  $("#editnotesdialog").dialog({ autoOpen: false, width: 'auto' });

  $("#cveinfodialog").on('dialogbeforeclose', function(event, ui) {
    $("#editnotesdialog").dialog('close');
  });

  $('#savenoteslink').on('click', function() {
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
  });

  $( "#deprecationdialog" ).dialog({
      resizable: false,
      height: "auto",
      width: "auto",
      modal: true,
      autoOpen: false,
      buttons: {
        "Do eet!": function() {
            var kernel_id = $('#deprecationdialog').attr('kernel_id');
            var deprecated = $('#deprecationdialog').attr('deprecated')
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
              $( this ).dialog( "close" );
            });
        },
        Cancel: function() {
          $( this ).dialog( "close" );
        }
      }
    });
});

function editnotes() {
  $('#editnotesdialog').dialog('option', 'title', 'Edit CVE notes').dialog('open');
}

function deprecate(c) {
  $('#deprecationdialog').dialog('open');
}
