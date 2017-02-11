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
  $("#yesdeletelink").prop('disabled', false);
  $("#nodeletelink").prop('disabled', false);
  $("#confirmdeletelink").dialog('option', 'title', "Confirm delete?").dialog('open');
}

function editlink(elem) {
  closedialogs();
  $("#editlink").attr('link_id', elem.parentElement.id);
  $("#linktoedit").val(elem.parentElement.attributes.link.value);
  $("#linkeditdesc").val(elem.parentElement.attributes.desc.value);
  $("#editlink").dialog('option', 'title', "Edit").dialog('open');
}

function editnotes() {
  $('#cvenotes').val($('#notes').html().replace(/<br>/g, "\n"));
  $('#editnotes').dialog('option', 'title', 'Edit CVE notes').dialog('open');
}

function addlink() {
  closedialogs();
  $("#addlink").dialog('option', 'title', "Enter new link").dialog('open');
}

function deletecve() {
  closedialogs();
  $("#yesdeletecve").prop('disabled', false);
  $("#nodeletecve").prop('disabled', false);
  $("#confirmdeletecve").dialog('option', 'title', "Confirm delete?").dialog('open');
}

$(document).ready(function() {
  $("#addlink").dialog({ autoOpen: false, width: 'auto' });
  $("#editlink").dialog({ autoOpen: false, width: 'auto' });
  $("#editnotes").dialog({ autoOpen: false, width: 'auto' });
  $("#confirmdeletecve").dialog({ autoOpen: false, width: 'auto' });
  $("#confirmdeletelink").dialog({ autoOpen: false, width: 'auto' });

  $('#nodeletecve').on('click', function() {
    $("#confirmdeletecve").dialog('close');
  });

  $('#yesdeletecve').on('click', function() {
    $("#yesdeletecve").prop('disabled', true);
    $("#nodeletecve").prop('disabled', true);
    window.location = "/deletecve/" + $("#confirmdeletecve").attr("cve_name")
  });

  $('#nodeletelink').on('click', function() {
    $("#confirmdeletelink").dialog('close');
  });

  $('#yesdeletelink').on('click', function() {
    $("#yesdeletelink").prop('disabled', true);
    $("#nodeletelink").prop('disabled', true);

    link_id = $("#confirmdeletelink").attr("link_id")

    $.ajax({
      'type': 'POST',
      'url': '/deletelink',
      'contentType': 'application/json',
      'data': JSON.stringify({
               link_id: link_id,
              })
    }).done(function(data) {
      if (data.error == "success") {
        $("#linklist > ul > li#" + link_id).remove()
        $("#confirmdeletelink").dialog('close');
      } else {
        $("#addlinkerror").empty().append(data.error);
      }
    });
  });

  $('#savenoteslink').on('click', function() {
    var cve_id = $('#editnotes').attr('cve_id');
    var notes = $('#cvenotes').val().replace("\n", "<br>");;
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
        $('#notes').html(notes);
        $('#editnotes').dialog('close');
      } else {
        $("#editnoteserror").empty().append(data.error);
      }
    });
  });


  $('#confirmeditlink').on('click', function() {
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
  });

  $('#confirmaddlink').on('click', function() {
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

  });

});
