(function() {
	function addCVE(button, dialog, access) {
		button.disabled = true;
		access.error.innerHTML = 'Adding...';
		var cveId = access.name.value;
		var cveNotes = access.details.value;

		$.ajax({
			type: 'POST',
			url: '/addcve',
			contentType: 'application/json',
			data: JSON.stringify({
				cve_id: cveId,
				cve_notes: cveNotes
			})
		}).done(function(data) {
			if (data.error == 'success') {
				access.error.innerHTML = '';
			} else {
				access.error.innerHTML = data.error;
			}
			button.disabled = false;
		});
	}

	var addCVEDialog = new Dialog({
		element: document.querySelector('#add-cve-dialog'),
		drag: '.title',
		actions: [{
			callback: 'close',
			selector: '.actions .cancel'
		}, {
			callback: addCVE,
			selector: '.actions .add'
		}],
		access: {
			name: '.name',
			details: '.details',
			error: '.error'
		}
	});

	var openAddCVEDialog = document.querySelector('#open-add-cve-dialog');
	openAddCVEDialog.addEventListener('click', addCVEDialog.open);

	function addKernel(button, dialog, access) {
		button.disabled = true;
		var kernel = access.repo.value;

		$.ajax({
			type: 'POST',
			url: '/addkernel',
			contentType: 'application/json',
			data: JSON.stringify({
				kernel: kernel
			})
		}).done(function(data) {
			if (data.error == "success") {
				location.reload();
			} else {
				access.error.innerHTML = data.error;
			}
			button.disabled = false;
		});
	}

	var addKernelDialog = new Dialog({
		element: document.querySelector('#add-kernel-dialog'),
		drag: '.title',
		actions: [{
			callback: 'close',
			selector: '.actions .cancel'
		}, {
			callback: addKernel,
			selector: '.actions .add'
		}],
		access: {
			repo: '.repo',
			error: '.error'
		}
	});

	var openAddKernelDialog = document.querySelector('#open-add-kernel-dialog');
	openAddKernelDialog.addEventListener('click', addKernelDialog.open);
})();
