import {Element} from './modules/elements-builder.js';
import {throwFields} from './modules/throw-fields.js';

class AuthForm{
    statusElement = null;
    constructor(){
        let root = document.querySelector('#global #elements-root');
        if(!root)
            throw new Error('Cannot get root element');
        
        this.root = root;
    };

    setup(callback){
        const element = Element('div', {id: 'auth-form', class: 'form'}, [
            Element('div', {class: 'form-content', show: false}, [
                Element('span', {class: 'form-title', html: 'Chatter'}),
                Element('div', {class: 'form-controls'}, [
                    Element('input', {type: 'text', placeholder: 'Login', maxlength: 16, spellcheck: false}),
                    Element('input', {type: 'password', placeholder: 'Pin-code', maxlength: 16, spellcheck: false})
                ]),
                Element('a', {class: 'process-status', html: 'Press Enter to process'}),
                Element('link', {rel: 'stylesheet', href: '/client/assets/auth-form.css'})
            ])
        ]);

        const fields = Object();
        this.statusElement
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
                        } else
                            throwFields([fields.pincode]);
                    }).catch(e => { throw new Error(e); });
                }
            }
        }

        document.addEventListener('keydown', window.documentEvent);

        this.root.appendChild(element);
        if(callback) callback(element);
    }
}

export {AuthForm, Element};