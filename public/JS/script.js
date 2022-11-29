/* For Suppliers' Contact */
var supplyData = [
    {
        supply_type: ['glass'],
        exotic: true,
        name: 'Aguila Glass',
        number: '09178845277',
    },
    {
        supply_type: ['parts'],
        exotic: true,
        name: 'Peter Pampanga',
        number: '09491176998',
    },
    {
        supply_type: ['parts'],
        exotic: false,
        name: 'DDT Autoparts',
        number: '09054122060',
    },
    {
        supply_type: ['paint'],
        exotic: true,
        name: 'Nicole - Five J Paint Center',
        number: '85622385',
    }
];

// Checks if a supply type was chosen
$('#select-supply-type').change(function() {
    $('#select-supplier option[value!=""]').remove();
    $('#supplier-form button').removeClass('disabled-button global-button-disabled');
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
    $('#more-photos').append('<div><input class="photo-sub" type="file" name="images" accept="image/*" required><img src="IMAGES/delete.png" alt="delete icon" class="delete-image"></div>');
    if($('#more-photos div').length == 5)
        $('#phadder').hide();
});

$('#more-photos').on('click', '.delete-image', function() {
    $(this).parent().remove();
    $('#phadder').show();
});

$('#edit-btn').click(function() {
    if(!$('.job-type').val()) {
        $('.error-msg').html('Please select a job type!');
    }
    else if(!$.trim($('#more-photos').html()).length) {
        $('.error-msg').html('Please add a photo!');
    }
    else if ($(':input[type=file]').length) {
        flag = true;
        $('.photo-sub').each(function() {
            if(!$(this).val())
                flag = false;
        })

        if(!flag){
            $('.error-msg').html('Please add a photo!');
        }
        else {
            $(event.currentTarget).closest('body').find('.create-edit-req').submit();
        }
    }
    else {
        $(event.currentTarget).closest('body').find('.create-edit-req').submit();
    }
});
/* End of add photos */


/* Register form validation */
$('form[action="/registeruser"] input[name="name"], form[action="/registeruser"] input[name="pass"]').on('input', function() {
    if($(this).val().endsWith(' ')) {
        $(this).val($(this).val().slice(0, -1));
        $('.error-msg').html('This field should not contain spaces!');
    }
    else
        $('.error-msg').html('');
});
/* End of register form validation */


/* Setting min of end date on generate report */
$('#report-input-container input[name="start"]').change(function() {
    $('#report-input-container input[name="end"]').attr('min', $(this).val());
})
/* End of generate report */



/* Color indicator on client ongoing request */
$('.active-user .status').css('color', function() {
    if($(this).html() == 'ONGOING')
        return '#FFBF00'
    return '#087830'
})
/* End of color indicator */



/* Edit balance on active requests */
$('.edit-balance-button').click(function() {
    $(this).siblings('.settle').hide();
    $(this).addClass('global-button-disabled disabled-button')
    $(this).parent().siblings('.active-host-card-bottom').find('.add-button').addClass('global-button-disabled disabled-button')
    $(this).parent().siblings('.active-host-card-bottom').find('.add-field').prop('disabled', true);
    $(this).parent().siblings('.active-host-card-bottom').find('.add-field').css('background-color', 'rgba(159,159,159, 0.3)')
    $(this).siblings('.edit-outstanding').show();
});

$('.cancel-edit-balance').click(function() {
    $(this).parent().hide();
    $(this).parent().siblings('.settle').show();
    $(this).parent().siblings('.edit-balance-button').removeClass('global-button-disabled disabled-button');
    $(this).parent().parent().siblings('.active-host-card-bottom').find('.add-button').removeClass('global-button-disabled disabled-button');
    $(this).parent().parent().siblings('.active-host-card-bottom').find('.add-field').prop('disabled', false);
    $(this).parent().parent().siblings('.active-host-card-bottom').find('.add-field').css('background-color', 'white')
});
/* End of edit balance */