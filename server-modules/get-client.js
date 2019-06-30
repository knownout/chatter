let express = require('express');
const app = express();
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());

    app.use(require('cors')());
    app.use(express.static('.'));

app.get('/*', (request, response) => {
    response.sendFile(
        'index.html',
        {
            root: __dirname + '/../client'
        }
    );
});

module.exports = app;