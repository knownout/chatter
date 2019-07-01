import {message} from '../message-box.js';
import {settings} from '../../main-script.js';

function login(parameters, callback, onfail){
    fetch(`${settings.network}${settings.domain}/chatter-auth`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
        body: JSON.stringify(parameters)
    }).then(response => response.json())
    .then(result => {                        
        if(callback)
            callback(result);
    }).catch(e => {
        if(onfail)
            onfail(e);

        message('Internal software error. <br>Try reloading page', true);
        throw new Error(e);
    });
}

export {login};