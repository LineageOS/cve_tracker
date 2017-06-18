(function() {
    Ripple(['#navbar .logo', '#navbar .items > *', 'button']);

    var footer = document.querySelector('#footer');
    var footerIsFixed = false;

    function toggleFixedFooter() {
        footer.classList.toggle('fixed');
        footerIsFixed = !footerIsFixed;
    }

    function checkFixedFooter() {
        var footerBoundingRect = footer.getBoundingClientRect();
        if (footerBoundingRect.bottom < window.innerHeight) {
            toggleFixedFooter();
        } else if (footerIsFixed){
            toggleFixedFooter();
            checkFixedFooter();
        }
    }
    window.addEventListener('resize', checkFixedFooter);
    checkFixedFooter();
})();
