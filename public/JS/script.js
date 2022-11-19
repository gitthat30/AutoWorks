/* For Suppliers' Contact */
var supplyData = [
    {
        supply_type: ['glass', 'paint'],
        exotic: true,
        name: 'ABC supply',
        number: '09111111111',
        address: 'ABC add',
    },
    {
        supply_type: ['glass', 'parts', 'paint'],
        exotic: false,
        name: 'DEF supply',
        number: '09222222222',
        address: 'DEF add',
    },
    {
        supply_type: ['paint'],
        exotic: true,
        name: 'GHI supply',
        number: '09333333333',
        address: 'GHI add',
    },
    {
        supply_type: ['paint', 'parts', 'glass'],
        exotic: true,
        name: 'JKL supply',
        number: '09444444444',
        address: 'JKL add',
    }
];

// Checks if a supply type was chosen
$('#select-supply-type').change(function() {
    $('#select-supplier option[value!=""]').remove();
});

$('#supplier-form button').click(function(event) {
    event.preventDefault()
    var supply_type = $('#select-supply-type').find('option:selected').attr('value');
    $('#supplier-list-title').show();
    $('#supplier-list').show();
    $('#supplier-list').empty();

    $('#contact-title').hide();
    $('.supplier-details').hide();

    for(let i = 0; i < supplyData.length; i++) {
        if(supplyData[i].supply_type.includes(supply_type)) {
            var supplierOption = $('<div class="supplier-option" data-value="' + i +'"><p>' + supplyData[i].name + '</p><small><i>View Info <img src="../IMAGES/right-arrow.png"></i></small></div>');

            if(supplyData[i].exotic)
                supplierOption.addClass('exotic-supplier');

            $('#supplier-list').append(supplierOption);
        }
    }
});

$('#supplier-list').on('click', '.supplier-option', function() {
    var index = parseInt($(this).data('value'));
    console.log(index);
    $('#contact-title').show();
    $('.supplier-details').show();

    $('#supplier-name strong').html(supplyData[index].name);
    $('#supplier-number i').html(supplyData[index].number);
    $('#supplier-address').html(supplyData[index].address);
});

// Checks if "Copy Number to Clipboard" button was clicked
$('#supplier-number').click(async function() {
    var num = $('#supplier-number').text();
    await navigator.clipboard.writeText(num);
    alert("Copied " + num + " to clipboard!");
});

/* End of Suppliers' Contact */




/* For fullpage view of images*/
$('.request-images img, .thread-message img').click(function() {
    $('#fullpage').css('background-image', 'url(' + $(this).attr('src') + ')');
    $('#fullpage').css('display', 'block');

    $('#img-name').html($(this).attr('alt'));
    $('#img-url').html($(this).attr('src'));

    $('body').css('overflow', 'hidden');
});

$('#close-full-button').click(function() {
    $('#fullpage').css('display', 'none');
    $('body').css('overflow', 'visible');
});
/* End of fullpage view of images*/




/* For message thread file-upload */
// Checks if file was selected
$('#file').change(function() {
    var fileName = $(this).val().substring($(this).val().lastIndexOf('\\') + 1)

    if(fileName.length == 0) {
        $('.message-input textarea').val('');
        $('.message-input textarea').prop('disabled', false);
    }

    else {
        $('.message-input textarea').val(fileName);
        $('.message-input textarea').prop('disabled', true);
    }

});

// Checks if download button was clicked
$('#download-button').click(function() {
    var img_url = $('#img-url').html();
    var img_name = $('#img-name').html();

    $.ajax({
        type: 'POST',
        url: '/downloadFile',
        data: {img_url, img_name},
        success: function(result) {
            var downloadLink = $("<a download hidden></a>");
            downloadLink.attr('href', '../UPLOADED/' + result.filename);
            downloadLink.attr('id', 'download');
            $('#fullpage').append(downloadLink);
            $('#download').get(0).click();
            $('#download').remove();
        }
    });
});
/* End of message thread file-upload */



/* Hamburger navbar */
$('#menu-icon').click(function() {
    $('#nav-buttons').css('display', 'flex');
});

$('#close-icon').click(function() {
    $('#nav-buttons').removeAttr('style');
});
/* End of hamburger navbar */



/* Toggle hide/show password */
$('#password-container img').click(function() {
    var passInput = $('#password-container input');
    
    if(passInput.attr('type') == 'password') {
        passInput.attr('type', 'text');
        $(this).attr('src', 'IMAGES/eye-hide.png');
    }
    else {
        passInput.attr('type', 'password');
        $(this).attr('src', 'IMAGES/eye-show.png');
    }
});
/* End of toggle hide/show password */



/* Makes scrollbar down by default */
var thread = $('.thread');
thread.scrollTop(thread.prop('scrollHeight') - thread.height())
/* End of scrollbar */



/* Add photos */
if($('#more-photos div').length == 5)
    $('#phadder').hide();

$('#phadder').click(function() {
    $('#more-photos').append('<div><input type="file" name="images" accept="image/*" required><img src="IMAGES/delete.png" alt="delete icon" class="delete-image"></div>');
    if($('#more-photos div').length == 5)
        $('#phadder').hide();
});

$('#more-photos').on('click', '.delete-image', function() {
    $(this).parent().remove();
    $('#phadder').show();
});
/* End of add photos */