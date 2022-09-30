$('.contact-num').click(function(e) {
    var num = $(this).text();
    navigator.clipboard.writeText(num);
    alert("Copied " + num + " to clipboard!");
});