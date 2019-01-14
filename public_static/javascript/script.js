$(document).ready(function () {

    var editor = ace.edit("csv-data");
    editor.getSession().setMode("ace/mode/javascript");
    editor.getSession().setUseWorker(false);
    editor.setOptions({
        fontSize: "10pt"
    });

    $('#airdrop-form').submit(function (e) {
        e.preventDefault();
        $.post('/submit-airdrop',
            {
                csv: editor.getValue(),
                batch_size: $('#batch-size').val(),
                gas_price: $('#gas-price').val()
            },
            function (response) {
                $('#submit').attr('disabled', false);
                if(response.status)
                {
                    let result = 'Success allocate ('+response.result.successed.length+'): \n'+response.result.successed.join('\n') +
                        '\nFailed allocate ('+response.result.failed.length+'): \n'+response.result.failed.join('\n') +
                        '\nAlready allocate ('+response.result.alreadyAllocated.length+'): \n'+response.result.alreadyAllocated.join('\n');
                    $('#console').append(result);
                }
                else
                {
                    $('#console').append(response.message);
                }
                $('#console').scrollTop = $('#console').scrollHeight;
            }
        );

        $('#submit').attr('disabled', true);
        $('#console').text('Airdropping...\n');
    });
});
