const serverPort = 3000;
let http = require('http'),
    MongoClient = require('mongodb')
        .MongoClient,
    crypto = require('crypto');

const verifyResult = require('./server-modules/result-verify.js');
const mongoClinet 
    = new MongoClient(
        'mongodb+srv://ko-chatter:MeltingGirl@cluster0-vpoz8.mongodb.net/test?retryWrites=true&w=majority',
        { useNewUrlParser: true }
    );

function hash(string){ return crypto.createHash('md5').update(string).digest("hex"); }
const authClients = Object();
mongoClinet.connect((fail, client) => {
    if(!fail){
        const db = client.db('chatter');
        let collection = db.collection('authData');

        const application 
            = require('./server-modules/client.js');

        application.post('/chatter-auth', (request, response) => {
            try{
                let content = request.body;
                if(content){
                    collection.find({ login: content.login }).toArray((fail, searchResult) => {
                        if(!fail){
                            request.body.pincode 
                                = content.nohash ? content.pincode : hash(content.pincode);
                            verifyResult(searchResult, request, collection, processResult => {
                                if(processResult.authResult){
                                    authClients[processResult.id]
                                        = Object();
                                    authClients[processResult.id].login
                                        = request.body.login;

                                setTimeout(() => {
                                        if(authClients[processResult.id] && !('webSocket' in authClients[processResult.id])){
                                            delete authClients[processResult.id];

                                            for(let client in authClients){
                                                if('webSocket' in authClients[client]){
                                                    authClients[client].webSocket.send(
                                                        JSON.stringify({
                                                            type: 'dataMessage',
                                                            content: {
                                                                selector: 'users-online',
                                                                value: Object.keys(authClients).length
                                                            }
                                                        })
                                                    );
                                                }
                                            }
                                        }
                                    }, 5000);
                                }

                                response
                                    .send(JSON.stringify(processResult));
                            });
                        }
                    });
                }
            } catch(e){
                console.log(e);
                response.send(JSON.stringify({
                    authResult: false,
                    reason: 'Login failure'
                }))
            }
        });

        const httpServer 
            = http.createServer(application);
        
        httpServer.listen(serverPort);
        console.log(`Listening: [http] on port ${serverPort}`);
    } else throw new Error(fail);
});