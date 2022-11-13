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
    var supply_type = $(this).find('option:selected').attr('value');
    $('#select-supplier option[value!=""]').remove();

    // Enables supplier selection based on chosen supply type
    $('#select-supplier').removeAttr('disabled');
    for(let i = 0; i < supplyData.length; i++) {
        if(supplyData[i].supply_type.includes(supply_type)) {
            var supplierOption = $('<option></option>');
            supplierOption.text(supplyData[i].name);
            supplierOption.attr('value', i);

            if(supplyData[i].exotic)
                supplierOption.addClass('exotic-supplier');

            $('#select-supplier').append(supplierOption);
        }
    }
});

// Checks if a supplier was chosen
$('#select-supplier').change(function() {
    //Gets supplier data based on chosen supplier 'value' attribute (index)
    var supplyIndex = parseInt($(this).find('option:selected').attr('value'));
    $('#sname').attr('value', supplyData[supplyIndex].name);
    $('#snumber').attr('value', supplyData[supplyIndex].number);
    $('#saddress').attr('value', supplyData[supplyIndex].address);
});

// Checks if "Copy Number to Clipboard" button was clicked
$('#copy-number').click(function() {
    var num = $('#supplier-number').text();
    navigator.clipboard.writeText(num);
    alert("Copied " + num + " to clipboard!");
});

/* End of Suppliers' Contact */




/* For fullpage view of images*/
$('.request-images img, .thread-message img').click(function() {
    $('#fullpage').css('background-image', 'url(' + $(this).attr('src') + ')');
    $('#fullpage').css('display', 'block');

    $('#img-name').html($(this).attr('alt'));
    $('#img-url').html($(this).attr('src'));
});

$('#fullpage button').click(function() {
    $('#fullpage').css('display', 'none');
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
    $('nav div').addClass('show-nav');
});

$('#close-icon').click(function() {
    $('nav div').removeClass('show-nav');
});
/* End of hamburger navbar */