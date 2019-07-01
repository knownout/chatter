import {Element} from './modules/elements-builder.js';
import {formFactory} from './modules/form-factory.js';
import {authForm} from './auth-form.js';
import {settings} from '../main-script.js';

function chatForm(callback){
    formFactory('chat', [
        Element('link', {rel: 'stylesheet', href: '/client/assets/chat-form.css'}),
        Element('link', {rel: 'stylesheet', href: '/client/assets/form-default.css'}),
        Element('header', {class: 'title-block'}, [
            Element('div', {id: 'current-user-login', 'top-title': 'Current name:', html: `<a>${window.client.login || 'Undefined'}</a>`}),
            Element('div', {id: 'online-counter', 'top-title': 'Online users:', html: '<a>-</a>'}),
            Element('button', {id: 'logout-button', html: 'Log out'})
        ]),
        Element('main', {id: 'chatter-messages'}),
        Element('footer', {class: 'controls-block'}, [
            Element('div', {contenteditable: true, placeholder: 'Write message here ...', empty: true}),
            Element('button', {html: '<i class="icon-feather"></i>', id: 'message-send'})
        ])
    ], element => {
        const elements = {
            input: element.querySelector('div[contenteditable="true"]'),
            logout: element.querySelector('button#logout-button'),
            online: element.querySelector('header #online-counter'),
            button: element.querySelector('button#message-send'),
            box: element.querySelector('main#chatter-messages')
        };

        function updateInput(event){
            elements.input.setAttribute('empty', elements.input.innerText.trim().length < 1);
            let height = elements.input.offsetHeight;
            element.style.setProperty('--footer-height', height + 15 + 'px');
        }

        elements.input.addEventListener('input', updateInput);
        const webSocket = new WebSocket(`${settings.socket}${settings.domain}`);

        window.connection = false;
        webSocket.addEventListener('open', () => {
            console.log('open');
            webSocket.addEventListener('message', message => {
                message = JSON.parse(message.data);
                console.log(message);

                if(!window.connection){
                    if(message.type == 'result-return'){
                        if(message.contain.status == true){
                            window.connection = true;
                            elements.input.addEventListener('keydown', event => {            
                                if(event.keyCode == 13 && !event.shiftKey){
                                    webSocket.send(JSON.stringify({
                                        type: 'data-transfer',
                                        contain: {
                                            select: 'global-message',
                                            set: event.target.innerText.trim()
                                        }
                                    }));

                                    event.target.innerHTML = '';
                                    event.preventDefault();

                                    updateInput();
                                }
                            });
                    
                            elements.logout.addEventListener('click', () => {
                                webSocket.close();

                                localStorage.removeItem('authData');
                                authForm();
                            });
                        }
                    }
                } else {
                    function format(){
                        let date = new Date();
                        let parts = 
                            [
                                date.getHours(),
                                date.getMinutes(),
                                date.getSeconds(),
                            ];

                        return parts.map(element => {
                            element = element.toString();
                            if(element.length < 2)
                                element = `0${element}`;

                            return element;
                        }).join(':');
                    }

                    switch(message.type){
                        case 'data-transfer':
                            switch(message.contain.select){
                                case 'online-list':
                                    elements.online.innerHTML = `<a>${message.contain.set}</a>`;
                                break;
                                case 'global-message':
                                    console.log(format());
                                    elements.box.appendChild(
                                        Element('div', {class: 'chatter-node', own: message.contain.author == window.client.login}, [
                                            Element('div', {class: 'node-title', html: `<a>${message.contain.author}</a><s>${format()}</s>`}),
                                            Element('p', {class: 'node-text', text: message.contain.set})
                                        ])
                                    );
                                break;
                            }
                        break;
                    }
                }
            });

            webSocket.addEventListener('close', () => {
                // on disconnect event
                console.log('out');
            });

            webSocket.addEventListener('error', () => {
                // disconnect event
                console.log('error');
            });

            webSocket.send(JSON.stringify({
                type: 'application-setup',
                contain:{
                    token: window.client.token || null
                }
            }));
        });

        if(callback)
            callback();
    });
}

export {chatForm};