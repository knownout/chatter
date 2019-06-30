// Log at: [7]
import {AuthForm} from './scripts/auth-form.js';

const settings = {
    duration: {
        throw: 320
    }
}
window.addEventListener('load', () => {
    const authForm = new AuthForm();
    authForm.setup(
        () => console.log('Auth form setup done')
    );
});

export {settings};