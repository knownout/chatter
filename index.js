let http = require('http');

let express = require('express');
const app = express();
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());

    app.use(require('cors')());
    app.use(express.static('.'));

app.get('/*', (request, response) => {
    console.log(request.statusCode);
    response.send('true');
});

const httpServer = http.createServer(app);
httpServer.listen(3000);

console.log('Listening: [http] on port 3000');