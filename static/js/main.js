function addcve() {
  closedialogs();
  $("#cvetoadd").val("");
  $("#cvenotes_input").val("");
  $("#addcvedialog").dialog('option', 'title', "Add new CVE").dialog('open');
}

function addkernel() {
  closedialogs();
  $("#kerneltoadd").val("");
  $("#addkerneldialog").dialog('option', 'title', "Add new Kernel").dialog('open');
}

function closedialogs() {
  $("#addcvedialog").dialog('close');
  $("#addkerneldialog").dialog('close');
}

$(document).ready(function() {
  $("#addcvedialog").dialog({ autoOpen: false, width: 'auto' });
  $("#addkerneldialog").dialog({ autoOpen: false, width: 'auto' });

  $('#savecvelink').on('click', function() {
    var cve_id = $("#cvetoadd").val();
    var cve_notes = $("#cvenotes_input").val();
    $.ajax({
      'type': 'POST',
      'url': '/addcve',
      'contentType': 'application/json',
      'data': JSON.stringify({
               cve_id: cve_id,
               cve_notes: cve_notes,
              })
    }).done(function(data) {
      if (data.error == "success") {
        $("#addcvedialog").dialog('close');
      } else {
        $("#addcveerror").empty().append(data.error);
      }
    });
  });

  $('#savekernellink').on('click', function() {
    var kernel = $("#kerneltoadd").val();
    $.ajax({
      'type': 'POST',
      'url': '/addkernel',
      'contentType': 'application/json',
      'data': JSON.stringify({
               kernel: kernel,
              })
    }).done(function(data) {
      if (data.error == "success") {
        $("#addkerneldialog").dialog('close');
        location.reload();
      } else {
        $("#addkernelerror").empty().append(data.error);
      }
    });
  });
});

