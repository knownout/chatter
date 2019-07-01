const serverPort = 3000,
    timeOut = 5000;

let http = require('http'),
    MongoClient = require('mongodb')
        .MongoClient;

const formResult = require('./server-modules/result-verify.js');
const mongoClinet 
    = new MongoClient(
        'mongodb+srv://ko-chatter:U_8cX436sCiuaBe@cluster0-vpoz8.mongodb.net/test?retryWrites=true&w=majority',
        { useNewUrlParser: true }
    );
const webSocketSetup = require('./server-modules/web-socket.js');

global.authClients = Object();
mongoClinet.connect((fail, client) => {
    if(!fail){
        const db = client.db('chatter');
        let collection = db.collection('authData');

        const application 
            = require('./server-modules/get-client.js');

        application.post('/chatter-auth', (request, response) => {
            try{
                let content = request.body;
                if(content){
                    collection.find({ login: content.login }).toArray((fail, searchResult) => {
                        if(!fail){
                            formResult(searchResult, content, processResult => {
                                if(processResult.authResult){
                                    const insertClient = (callback) => {
                                        if(Object.keys(global.authClients).includes(processResult.contain.id.toString())){
                                            response.send(JSON.stringify({
                                                authResult: false,
                                                reason: 'This user already online'
                                            }));
                                        } else {
                                            global.authClients[processResult.contain.id] = Object({
                                                login: content.login
                                            });
    
                                            setTimeout(() => {
                                                try{
                                                    if(
                                                        !('webSocket' in authClients[
                                                            processResult.contain.id
                                                        ])
                                                    ){
                                                        delete authClients[processResult.contain.id];
                                                    }
                                                } catch {
                                                    delete authClients[processResult.contain.id];
                                                }
                                            }, timeOut);

                                            if(callback) callback();
                                        }
                                    };

                                    if(processResult.contain.newUser){
                                        collection.insertOne(
                                            { login: content.login, pincode: processResult.contain.passHash },
                                            (fail, insertResult) => 
                                        {
                                            if(!fail){
                                                processResult.contain.id = insertResult.ops[0]._id.toString();
                                                insertClient(() => response.send(JSON.stringify(processResult)));
                                            }
                                        });
                                    } else insertClient(() => response.send(JSON.stringify(processResult)));
                                }
                            });
                        }
                    });
                }
            } catch(e){
                console.log(e);
                response.send(JSON.stringify({
                    authResult: false,
                    reason: 'Login failure'
                }));

                return false;
            }
        });

        const httpServer 
            = http.createServer(application);
        
        webSocketSetup(httpServer);
        httpServer.listen(serverPort);
        console.log(`Listening: [http] on port ${serverPort}`);
    } else throw new Error(fail);
});