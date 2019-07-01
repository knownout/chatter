import {authForm} from './scripts/auth-form.js';
import {chatForm} from './scripts/chat-form.js';
import {login} from './scripts/modules/login-module.js';
import {message} from './scripts/message-box.js';

window.active = null;
const settings = {
    // Animation duration settings
    duration: {
        throw: 320, // Auth form shake time
        message: 120, // Popup messages animation duration
        window: 250 // Forms animation duration
    },
    lifetime: {
        message: 3000 // Popup messages lifetime
    },

    domain: 'localhost:3000',
    network: 'http://',
    socket: 'ws://'
}
window.addEventListener('load', () => {
    if(localStorage.getItem('authData')){
        try{
            let authData = JSON.parse(localStorage.getItem('authData'));
            if(Object.keys(authData).every(e => ['pincode', 'login'].includes(e))){
                login({
                    login: authData.login,
                    pincode: authData.pincode,
                    nohash: true
                }, result => {
                    console.log(result);
                    if(result.authResult){
                        window.client = Object({
                            login: authData.login,
                            token: result.contain.id
                        });
                        chatForm();
                    }
                    else{
                        localStorage.removeItem('authData');
                        authForm(() => {
                            message(result.reason);
                        });
                    }
                });
            } else {
                localStorage.removeItem('authData');
                authForm();
            }
        } catch {
            localStorage.removeItem('authData');
            authForm(() => {
                message('Internal software error. <br>You need to re-login', true);
            });
        }
    } else authForm();
});

export {settings};