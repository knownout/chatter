import {authForm} from './scripts/auth-form.js';

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
    }
}
window.addEventListener('load', () => {
    authForm(
        () => console.log('Auth form setup done')
    );
});

export {settings};