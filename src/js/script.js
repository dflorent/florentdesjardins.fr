var $ = require('jquery');
var moment = require('moment');
var attachFastClick = require('fastclick');
var validate = require('validate.js');

$(function() {
    // age calculation
    var age = moment().diff(moment('19870401', 'YYYYMMDD'), 'years');
    $('#age').append(age);

    // current year copyright
    $('#year').append(moment().format('Y'));

    // fastclick
    attachFastClick(document.body);

    // mobile navigation
    $('#nav-toggle').on('click', function(event) {
        event.preventDefault();
        $('#nav').toggle();
    });

    // active current nav item
    $('#nav').find('[data-item="' + window.location.pathname + '"]').addClass('nav__item--active');

    /**
     * Forms
     */
    var messages = {
        presence: "^Champ obligatoire",
        email: "^Email invalide"
    };

    var constraints = {
        recallform: {
            entry_910138129: {
                presence: { message: messages.presence }
            },
            entry_285240089: {
                presence: { message: messages.presence }
            }
        },
        contactform: {
            entry_1155244664: {
                presence: { message: messages.presence }
            },
            entry_1000000: {
              presence: { message: messages.presence },
              email: { message: messages.email }
            },
            entry_1000001: {
                presence: { message: messages.presence }
            }
        }
    };

    var inputs = 'input[name], textarea[name]';

    $('#contactform, #recallform').submit(function(e) {
        e.preventDefault();

        var form = $(this);
        var errors = validate($(this), constraints[form.attr('id')]);

        if (errors) {
            showErrors(form, errors);
        } else {
            $.ajax({
                url: form.attr('action'),
                data: form.serialize(),
                type: form.attr('method'),
                dataType: "xml",
                statusCode: {
                    0: function () {
                        showSuccess(form);
                    },
                    200: function () {
                        showSuccess(form);
                    }
                }
            });
        }
    });

    var showSuccess = function(form) {
        resetErrors();
        var output = [
            '<div class="mtm form-message form-message--success">',
            'Merci !',
            '</div>'
        ];
        form.replaceWith(output.join(''));
    };

    var showErrors = function(form, errors) {
        resetErrors();
        form.find(inputs).each(function(i, input) {
            if (errors[input.name]) {
                $(input).parent().append('<p class="form-error">' + errors[input.name] + '</p>');
            }
        });
    };

    var resetErrors = function() {
        $('.form-error').remove();
    };
});
