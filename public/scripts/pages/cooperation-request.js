$(function () {
    var requestBtn = $('#requestBtn');

    // fileManager.bindFileProcess(fileInput,
    //     function() {
    //         if (!$('input[name=pn_name]').val()) {
    //             alert('뒤지실?')
    //             return false;
    //         }
    //     },
    //     function(data) {
    //         console.log(data);
    //
    //         $('#fileData').remove();
    //         var fileResultView = $('<input type="text" value="' + data.files[0].name + '" readonly="readonly" />');
    //         var fileHiddenInput = $('<input type="hidden" name="pn_price_list" value="' + data.result.data.value + '" />');
    //
    //         $('#fileInputWrapper').append(fileResultView);
    //         $('#fileInputWrapper').append(fileHiddenInput);
    //     }
    // );

    var regexPhone = /^01([0|1|6|7|8|9]?)-?([0-9]{3,4})-?([0-9]{4})$/;

    requestBtn.on('click', function() {
        var $form = $('#cooperationRequestForm'),
            data = $form.serializeJson();

        if (!data.pn_name) {
            swal({
                title: '업체명을 입력해 주시기 바랍니다.',
                type: 'warning'
            }, function () {

            });
        } else if (!data.pn_tel_no) {
            swal({
                title: '연락처를 입력해 주시기 바랍니다.',
                type: 'warning'
            }, function () {

            })
        } else if ( regexPhone.test(data.pn_tel_no) === false ) {
            swal({
                title: '올바른 연락처를 입력해 주시기 바랍니다.',
                type: 'warning'
            }, function () {

            })
        }

        fileUpload({
            formData: data,
            callback: function(uploadData) {
                if(uploadData) {
                    data.pn_price_list = uploadData.data.value;
                }
                var requestCooperationPromise = http.post('/api/manage/partner', data);
                requestCooperationPromise
                    .finally(function () {

                    })
                    .then(function (data) {
                        console.log(data);
                        if (data.isError !== false ) {
                            swal({
                                title: data.msg,
                                type: 'error'
                            })
                        }

                        swal({
                            title: '협력업체 신청이 완료되었습니다.\n자세한 내용은 유선으로 연락 드리겠습니다.',
                            type: 'success'
                        }, function() {
                            $(':input','#cooperationRequestForm')
                                .not(':button, :submit, :reset, :hidden')
                                .val('')
                                .removeAttr('checked')
                                .removeAttr('selected');
                        });
                    })
                    ['catch'](function (error) {
                    swal({
                        title: error.value,
                        type: 'error'
                    });
                });
            }
        });
    });

    var fileUpload = function(options) {
        var data = new FormData(),
            fileData = $('#fileData'),
            formData = options.formData;

        if (fileData[0].files.length === 0) {
            options.callback()
            return;
        }

        data.append('filedata', fileData[0].files[0]);
        data.append('file_upload_path', '/partner/' + formData.pn_name + '/');

        $.ajax({
            url: '/api/file/upload',
            processData: false,
            contentType: false,
            data: data,
            type: 'POST',
            success: function(result){
                if (result.code !== 200 ) {
                    swal({
                        title: '파일 업로드 중 에러가 발생하였습니다.\n다시 시도해 주시기 바랍니다.',
                        type: 'warning'
                    }, function () {

                    });
                }

                if (options.callback) {
                    options.callback(result);
                }
            }
        });
    }

    $('#cooperationRequestForm').on('submit', function(e) {
        e.preventDefault();
    })
});