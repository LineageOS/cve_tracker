function openLinks(cve, cve_id, cvss_score, editable) {
  $("#cvelinks").text("Loading...");
  $("#cvenotes").text("Loading...");

  $("#cvecomparelink").attr("href", "/status/" + cve);
  $("#cveinfodialog").attr("cve_id", cve_id);
  $("#cveinfodialog").attr("cve", cve);
  $("#cveinfodialog").dialog('close');
  $("#cveinfodialog").dialog('option', 'title', cve).dialog('open');
  if (cvss_score > 0) {
      var scorespan = "<span id='cvss_score' class='s" + Math.floor(cvss_score) + "'>" + cvss_score.toString() + "</span>";
      $("#ui-id-1").append(scorespan);
  }

  getLinks(cve_id, editable);
  getNotes(cve_id);
}

function getLinks(cve_id, canEdit) {
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
      var buttons = "";
      if (canEdit) {
        buttons = " <a onclick='editlink(this);' class='small button'>Edit<a>"
          + "<a onclick='deletelink(this);' class='small button delete'>Delete<a>"
      }
      var row = "<span id='" + v._id.$oid + "' link='" + v.link + "' desc='" + v.desc + "'>"
        + "<a href='" + v.link + "' class='cvelink' target='_blank'>" + shorten(v.link, 80) + "</a> - "
        + v.desc + buttons + "</span><hr>";
      $("#cvelinks").append(row);
    });
  });
}

function getNotes(cve_id) {
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
    if (!data[0].notes) data[0].notes = 'No notes';
    $("#cvenotes").text(data[0].notes);
  });
}

$(document).ready(function() {
  $("#cvenotes").attr("contenteditable", false);
  $("#cveinfodialog").dialog({autoOpen: false, width: 'auto' });
});

function shorten(text, maxLength) {
  var ret = text;
  if (ret.length > maxLength) {
    ret = ret.substr(0, maxLength - 3) + "...";
  }
  return ret;
}
