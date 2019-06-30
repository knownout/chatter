import {Element} from './modules/elements-builder.js';
import {settings} from '../main-script.js';

function message(message, warn = false){
    const hideMessage = element => {
        element.style.width = 0;
        element.style.height = 0;

        setTimeout(() => {
            element.remove();
        }, settings.duration.message + 20);
    }

    const root = document.querySelector('#global #messages-root');
    if(!root)
        throw new Error('Cannot find messages root');

    // Maximum messages per screen - 5
    if(root.childNodes.length > 4){
        hideMessage(root.firstChild);
        if(root.childNodes.length - 1 > 4)
            return false;
    }

    let element = Element('div', {class: 'message-node', html: `<p>${message}</p>`, warn: warn});
    root.appendChild(element);
    setTimeout(() => {
        let size = {
            width: element.querySelector('p').offsetWidth + 1,
            height: element.querySelector('p').offsetHeight
        };        

        element.style.width = 0;
        element.style.height = 0;

        setTimeout(() => {
            element.setAttribute('ready', '');
                element.style.width = size.width + 'px';
                element.style.height = size.height + 'px';

            let timeout = setTimeout(() => hideMessage(element), settings.lifetime.message);
            element.addEventListener('click', () => {
                clearTimeout(timeout);
                hideMessage(element);
            })
        }, 20);
    }, 20);
}

export {message};