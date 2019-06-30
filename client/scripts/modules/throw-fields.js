import {settings} from '../../main-script.js';
function throwFields(fields){
    for(let field of fields){
        field.value = '';
        field.setAttribute('throw', '');
        setTimeout(
            () => field.removeAttribute('throw'),
            settings.duration.throw + 10
        );
    }
}

export {throwFields};