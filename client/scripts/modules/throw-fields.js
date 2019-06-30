import {settings} from '../../main-script.js';
function throwFields(fields, noclear = false){
    for(let field of fields){
        if(!noclear) field.value = '';
        field.setAttribute('throw', '');
        setTimeout(
            () => field.removeAttribute('throw'),
            settings.duration.throw + 10
        );
    }
}

export {throwFields};