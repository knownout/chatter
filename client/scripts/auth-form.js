import {Element} from './modules/elements-builder.js';
import {throwFields} from './modules/throw-fields.js';
import {formFactory} from './modules/form-factory.js';
import {message} from './message-box.js';
import {login} from './modules/login-module.js';

import {chatForm} from './chat-form.js';

const statusMessages = {
    default: 'Minimum 4 symbols required<br>Press Enter to process',
    processing: 'Processing ...<br>&nbsp;',
    error: 'Internal software error<br>&nbsp;'
};

var statusElement = null;
function authForm(callback){
    formFactory('auth', [
        Element('link', {rel: 'stylesheet', href: '/client/assets/auth-form.css'}),
        Element('link', {rel: 'stylesheet', href: '/client/assets/form-default.css'}),
        Element('span', {class: 'form-title', html: 'Chatter'}),
        Element('div', {class: 'form-controls'}, [
            Element('input', {type: 'text', placeholder: 'Login', maxlength: 16, spellcheck: false}),
            Element('input', {type: 'password', placeholder: 'Pin-code', maxlength: 16, spellcheck: false})
        ]),
        Element('a', {class: 'process-status', html: statusMessages.default}),
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
                let parameters
                    = [
                        formField(fields.login),
                        formField(fields.pincode)
                    ];

                parameters 
                    = parameters.filter(e => e != false);

                if(parameters.length == 2){
                    if(statusElement)
                        statusElement.innerHTML = statusMessages.processing;
                    login({
                        login: parameters[0],
                        pincode: parameters[1]
                    }, result => {
                        if(result.authResult){
                            window.client = Object({
                                login: parameters[0],
                                token: result.contain.id
                            });

                            if(result.contain.passHash){
                                localStorage.setItem('authData', JSON.stringify({
                                    login: parameters[0],
                                    pincode: result.contain.passHash
                                }));
                            }

                            chatForm(() => {
                                if(result.contain.newUser){
                                    message(`Account ${parameters[0]} successfully created`);
                                    setTimeout(() => message(`Welcome to chatter`), 1000);
                                }
                            });
                        } else {
                            throwFields([fields.pincode]);
                            message(result.reason);
                        }

                        if(statusElement)
                            statusElement.innerHTML = statusMessages.default;
                    }, () => {
                        if(statusElement)
                            statusElement.innerHTML = statusMessages.error;

                        throwFields(Object.values(fields), true);
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