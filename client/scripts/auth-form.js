import {Element} from './modules/elements-builder.js';
import {throwFields} from './modules/throw-fields.js';
import {formFactory} from './modules/form-factory.js';
import {message} from './message-box.js';

const statusMessages = {
    default: 'Minimum 4 symbols required<br>Press Enter to process',
    processing: 'Processing ...<br>&nbsp;',
    error: 'Internal software error<br>&nbsp;'
};

var statusElement = null;
function authForm(callback){
    formFactory('auth', [
        Element('span', {class: 'form-title', html: 'Chatter'}),
        Element('div', {class: 'form-controls'}, [
            Element('input', {type: 'text', placeholder: 'Login', maxlength: 16, spellcheck: false}),
            Element('input', {type: 'password', placeholder: 'Pin-code', maxlength: 16, spellcheck: false})
        ]),
        Element('a', {class: 'process-status', html: statusMessages.default}),
        Element('link', {rel: 'stylesheet', href: '/client/assets/auth-form.css'}),
        Element('link', {rel: 'stylesheet', href: '/client/assets/form-default.css'}),
    ], element => {
        const fields = Object();
        statusElement
            = element.querySelector('.process-status');

        [fields.login, fields.pincode]
            = element.querySelectorAll('.form-controls input');

        
        function formField(field){
            let value = field.value || field.innerHTML;
                value = value.trim();

            if(
                !value || value.length < 4 ||
                value.replace(/\s/g, '').length < 1
            ) return false;

            return value;
        }

        window.documentEvent = function(event){
            if(event.keyCode == '13'){
                let loginParameters
                    = [
                        formField(fields.login),
                        formField(fields.pincode)
                    ];

                loginParameters 
                    = loginParameters.filter(e => e != false);

                if(loginParameters.length == 2){
                    if(statusElement)
                        statusElement.innerHTML = statusMessages.processing;

                    fetch('/chatter-auth', {
                        method: 'post',
                        headers: { 'Content-Type': 'application/json' },
                        mode: 'cors',
                        body: JSON.stringify({
                            login: loginParameters[0],
                            pincode: loginParameters[1]
                        })
                    }).then(response => response.json())
                    .then(result => {                        
                        if(result.authResult){
                            window.client = Object({
                                login: loginParameters[0],
                                token: result.contain.id
                            });

                            if(result.contain.passHash){
                                localStorage.setItem('authData', JSON.stringify({
                                    login: loginParameters[0],
                                    pincode: result.contain.passHash
                                }));
                            }
                        } else {
                            throwFields([fields.pincode]);
                            message(result.contain.message);
                        }

                        if(statusElement)
                            statusElement.innerHTML = statusMessages.default;
                    }).catch(e => {
                        if(statusElement)
                            statusElement.innerHTML = statusMessages.error;

                        message('Internal software error. <br>Try reloading page', true);
                        throwFields(Object.values(fields), true);
                        throw new Error(e);
                    });
                } else {
                    for(let field of Object.values(fields)){
                        if(!formField(field)) throwFields([field], true);
                    }
                }
            }
        }

        document.addEventListener('keydown', window.documentEvent);
        if(callback) callback();
    });
}

export {authForm, Element};