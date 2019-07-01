import {settings} from '../../main-script.js';
import {Element} from './elements-builder.js';

function formFactory(formid, childs, callback){
    let root = document.querySelector('#global #elements-root');
    if(!root)
        throw new Error('Cannot get root element');

    if(window.documentEvent)
        document.removeEventListener('keydown', window.documentEvent);

    if(window.active){
        window.active.querySelector('.form-content').setAttribute('show', false);
        window.active = null;
            setTimeout(() => formFactory(formid, childs, callback), settings.duration.window + 50);

        return false;
    }

    const element = Element('div', {id: `${formid}-form`, class: 'form'}, [
        Element('div', {class: 'form-content', show: false}, childs)
    ]);

    root.innerHTML = '';
    root.appendChild(element);

    window.active = element;

    setTimeout(() => {
        let formContent = element.querySelector('.form-content[show]');
            formContent.style.transition = '.25s ease all';

        setTimeout(() => {
            formContent
                .setAttribute('show', true);

            if(callback)
                callback(element);
        }, settings.duration.window + 50);
    }, 20);
}

export {formFactory};