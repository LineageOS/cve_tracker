function closedialogs() {
  $("#addlink").dialog('close');
  $("#editlink").dialog('close');
  $('#editnotes').dialog('close');
  $("#confirmdeletelink").dialog('close');
  $("#confirmdeletecve").dialog('close');
}

function deletelink(elem) {
  closedialogs();
  $("#confirmdeletelink").attr("link_id", elem.parentElement.id);
  $("#yesdeletelink").button('enable');
  $("#nodeletelink").button('enable');
  $("#confirmdeletelink").dialog('open');
}

function editlink(elem) {
  closedialogs();
  $("#editlink").attr('link_id', elem.parentElement.id);
  $("#linktoedit").val(elem.parentElement.attributes.link.value);
  $("#linkeditdesc").val(elem.parentElement.attributes.desc.value);
  $("#editlink").dialog('open');
}

function editnotes() {
  $('#cvenotes').val($('#notes').html());
  $('#editnotes').dialog('open');
}

function addlink() {
  closedialogs();
  $("#addlink").dialog('open');
}

function deletecve() {
  closedialogs();
  $("#yesdeletecve").button('enable');
  $("#nodeletecve").button('enable');
  $("#confirmdeletecve").dialog('open');
}

$(document).ready(function() {
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
        id: "cofirmeditlink",
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

  $("#editnotes").dialog({
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
      var url = link_url;
      var desc = link_desc;
      var id = data.link_id;
      var template = `<li link="${url}" desc="${desc}" id="${id}">
        <a class="link" href="${url}">${url}</a> -
        <span class="linkdesc">${desc}</span>
        <a class="small button delete" onclick='deletelink(this);'>Delete</a>
        <a class="small button" onclick='editlink(this);'>Edit</a>`;
      $("#linklist ul").append(template);
      $("#addlink").dialog('close');
    } else {
      $("#addlinkerror").empty().append(data.error);
    }
  });
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
      var li = $("#linklist #" + link_id);
      $(".linkdesc", li).text(link_desc);
      $(".link", li).attr("href", link_url).text(link_url);
      $("#editlink").dialog('close');
    } else {
      $("#editlinkerror").empty().append(data.error);
    }
  });
}

function savenotes() {
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
      $('#notes').text(notes);
      $('#editnotes').dialog('close');
    } else {
      $("#editnoteserror").empty().append(data.error);
    }
  });
}

function confirmdeletelink() {
  $("#yesdeletelink").button("disable");
  $("#nodeletelink").button("disable");

  link_id = $("#confirmdeletelink").attr("link_id")

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
      $("#linklist > ul > li#" + link_id).remove()
      $("#confirmdeletelink").dialog('close');
    } else {
      $("#addlinkerror").empty().append(data.error);
    }
  });
}
