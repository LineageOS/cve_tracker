function addcve() {
  closedialogs();
  $("#cvetoadd").val("");
  $("#cvenotes_input").val("");
  $("#addcvedialog").dialog('open');
}

function addkernel() {
  closedialogs();
  $("#kerneltoadd").val("");
  $("#addkerneldialog").dialog('open');
}

function closedialogs() {
  $("#addcvedialog").dialog('close');
  $("#addkerneldialog").dialog('close');
}

$(document).ready(function() {
  $("#addcvedialog").dialog({
    autoOpen: false,
    width: 'auto',
    modal: true,
    buttons: [
      {
        text: "Save!",
        id: "savecve",
        click: savecve
      },
    ]
  });

  $("#addkerneldialog").dialog({
    autoOpen: false,
    width: 'auto',
    modal: true,
    buttons: [
      {
        text: "Save!",
        id: "savekernel",
        click: savekernel
      }
    ]
  });
});

function savecve() {
  $("#savecve").button("disable");
  $("#addcveerror").empty().append("Saving...");
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
    $("#savecve").button("enable");
    if (data.error == "success") {
      $("#addcvedialog").dialog('close');
      location.reload();
    } else {
      $("#addcveerror").empty().append(data.error);
    }
  });
}

function savekernel() {
  $("#savekernel").button("disable");
  var kernel = $("#kerneltoadd").val();
  $.ajax({
    'type': 'POST',
    'url': '/addkernel',
    'contentType': 'application/json',
    'data': JSON.stringify({
            kernel: kernel,
    })
  }).done(function(data) {
    $("#savekernel").button("enable");
    if (data.error == "success") {
      $("#addkerneldialog").dialog('close');
      location.reload();
    } else {
      $("#addkernelerror").empty().append(data.error);
    }
  });
}

