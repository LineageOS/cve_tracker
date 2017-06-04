function update(c, s) {
  cve_id = c.attr('cve_id');
  kernel_id = c.attr('kernel_id');

  $.ajax({
    'type': 'POST',
    'url': '/update',
    'contentType': 'application/json',
    'data': JSON.stringify({
             kernel_id: kernel_id,
             status_id: s,
             cve_id: cve_id,
            })
  })
  .done(function(data) {
    console.log(data);
    if (data.error == "success") {
      c.attr('status_id', s);
      updateCVEStatus(c);
      progressBar.set(data.progress);
    }
  });
}

var items = [].slice.call(document.querySelector('#status_ids').children).map(function(child) {
  return {
    value: child.id.slice(7),
    class: child.id,
    content: child.innerHTML
  };
});
var statusContext = new Context({
  selector: '.status-context-menu',
  trigger: 'click',
  callback: function(from, value) {
    update($(from), value);
  },
  items: items
});
