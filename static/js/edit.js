$(document).ready(function() {
  $("#cveinfodialog").on('dialogbeforeclose', function(event, ui) {
    $("#editnotesdialog").dialog('close');
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

  $("#addlink").dialog({
    autoOpen: false,
    width: 'auto',
    buttons: [
      {
        text: "Add!",
        id: "confirmaddlink",
        click: confirmaddlink
      }
    ]
  });

  $("#editlink").dialog({
    autoOpen: false,
    width: 'auto',
    buttons: [
      {
        text: "Save!",
        id: "confirmeditlink",
        click: confirmeditlink
      }
    ]
  });

  $("#confirmdeletelink").dialog({
    autoOpen: false,
    width: 'auto',
    modal: true,
    buttons: [
      {
        text: "Yes!",
        id: "yesdeletelink",
        click: confirmdeletelink
      },
      {
        text: "NOOOOO!",
        id: "nodeletelink",
        click: function() {
          $(this).dialog('close');
        }
      }
    ]
  });

  $("#confirmdeletecve").dialog({
    autoOpen: false,
    width: 'auto',
    modal: true,
    buttons: [
      {
        text: "Yes!",
        id: "yesdeletecve",
        click: function() {
          $("#yesdeletecve").button('disable');
          $("#nodeletecve").button('disable');
          window.location = "/deletecve/" + $(this).attr("cve_name")
        }
      },
      {
        text: "NOOOOO!",
        id: "nodeletecve",
        click: function() {
          $(this).dialog('close');
        }
      }
    ]
  });
});

function editorsavenotes() {
  var editable = $("#cvenotes").attr("contenteditable");
  if (editable == "true") {
    savenotes();
  } else {
    $("#cvenotes").attr("contenteditable", "true");
    $("#cvenotes").focus();
    $("#btn_notes").text("Save!");
  }
}

function savenotes() {
  var cve_id = $('#cveinfodialog').attr('cve_id');
  var notes = $('#cvenotes').text();
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
      if (!notes) notes = 'No notes';
      $("#cvenotes").attr("contenteditable", "false");
      $("#cvenotes").text(notes);
      $("#btn_notes").text("Edit");
    } else {
        $("#editnoteserror").empty().append(data.error);
    }
  });
}

function addlink() {
  var cve_id = $("#cveinfodialog").attr("cve_id");
  $("#addlink").attr("cve_id", cve_id);
  $("#addlink").dialog('open');
}

function confirmaddlink() {
  var link_url = $("#linktoadd").val();
  var link_desc = $("#linkdesc").val();
  $.ajax({
    'type': 'POST',
    'url': '/addlink',
	'contentType': 'application/json',
	'data': JSON.stringify({
            cve_id: $("#addlink").attr("cve_id"),
            link_url: link_url,
            link_desc: link_desc,
    })
  }).done(function(data) {
    if (data.error == "success") {
      var cve_id = $("#cveinfodialog").attr("cve_id");
      getLinks(cve_id, true);
      $("#addlink").dialog('close');
    } else {
      $("#addlinkerror").empty().append(data.error);
    }
  });
}

function editlink(elem) {
  $("#editlink").attr('link_id', elem.parentElement.id);
  $("#linktoedit").val(elem.parentElement.attributes.link.value);
  var desc = elem.parentElement.attributes.desc.value;
  if (desc == "No description") desc = "";
  $("#linkeditdesc").val(desc);
  $("#editlink").dialog('open');
}

function confirmeditlink() {
  var link_url = $("#linktoedit").val();
  var link_desc = $("#linkeditdesc").val();
  var link_id = $("#editlink").attr("link_id");
  $.ajax({
    'type': 'POST',
    'url': '/editlink',
    'contentType': 'application/json',
    'data': JSON.stringify({
             link_id: link_id,
             link_url: link_url,
             link_desc: link_desc,
    })
  }).done(function(data) {
    if (data.error == "success") {
      var cve_id = $("#cveinfodialog").attr("cve_id");
      getLinks(cve_id, true);
      $("#editlink").dialog('close');
    } else {
      $("#editlinkerror").empty().append(data.error);
    }
  });
}

function deletelink(elem) {
  $("#confirmdeletelink").attr("link_id", elem.parentElement.id);
  $("#yesdeletelink").button('enable');
  $("#nodeletelink").button('enable');
  $("#confirmdeletelink").dialog('open');
}

function confirmdeletelink() {
  $("#yesdeletelink").button("disable");
  $("#nodeletelink").button("disable");

  var link_id = $("#confirmdeletelink").attr("link_id")

  $.ajax({
    'type': 'POST',
    'url': '/deletelink',
    'contentType': 'application/json',
    'data': JSON.stringify({
             link_id: link_id,
    })
  }).done(function(data) {
    $("#yesdeletelink").button("enable");
    $("#nodeletelink").button("enable");
    if (data.error == "success") {
      var cve_id = $("#cveinfodialog").attr("cve_id");
      getLinks(cve_id, true);
      $("#confirmdeletelink").dialog('close');
    } else {
      $("#addlinkerror").empty().append(data.error);
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

function deletecve() {
  $("#yesdeletecve").button('enable');
  $("#nodeletecve").button('enable');
  var cve = $("#cveinfodialog").attr("cve");
  $("#confirmdeletecve").attr("cve_name", cve);
  $("#confirmdeletecve").dialog('open');
}
