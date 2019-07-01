const WebSocket = require('ws').Server;
function setSocket(server){
    const webSocketServer = new WebSocket({ server: server });
    function messageGlobal(message){
        for(let client in global.authClients){
            if(!('webSocket' in authClients[client]))
                delete global.authClients[client];
            else {
                global.authClients[client].webSocket.send(
                    JSON.stringify(message)
                );
            }
        }
    }

    webSocketServer.on('connection', webSocket => {
        var clientToken = null;
        webSocket.on('message', message => {
            let clientKeys = Object.keys(global.authClients);

            message = JSON.parse(message);
            switch(message.type){
                case 'application-setup':
                    if(!('token' in message.contain)){
                        webSocket.send(JSON.stringify({
                            type: 'critical-error',
                            contain: {
                                code: 's',
                                message: 'Toekn not provided'
                            }
                        }));

                        webSocket.close();
                    } else {
                        clientToken = message.contain.token.toString();
                        if(!clientKeys.includes(clientToken)){
                            webSocket.send(JSON.stringify({
                                type: 'critical-error',
                                contain: {
                                    code: 'a',
                                    message: 'You need to log in first'
                                }
                            }));

                            webSocket.close();
                        } else {
                            global.authClients[clientToken].webSocket = webSocket;
                            webSocket.send(JSON.stringify({
                                type: 'result-return',
                                contain: {
                                    status: true
                                }
                            }))

                            messageGlobal({
                                type: 'data-transfer',
                                contain: {
                                    select: 'online-list',
                                    set: clientKeys.length
                                }
                            });
                        }
                    }
                break;
                case 'data-transfer':
                    if(
                        !message.contain.select ||
                        message.contain.select.length < 3
                    ){
                        webSocket.send(JSON.stringify({
                            type: 'small-error',
                            contain: {
                                code: 'c',
                                message: 'Cannot transfer data <br>without selector'
                            }
                        }));
                    } else {
                        switch(message.contain.select){
                            case 'global-message':
                                if(
                                    !message.contain.set ||
                                    message.contain.set.length < 1
                                ){
                                    webSocket.send(JSON.stringify({
                                        type: 'small-error',
                                        contain: {
                                            code: 'c',
                                            message: 'Cannot send empty message'
                                        }
                                    }));
                                } else {
                                    console.log(Object.keys(authClients));
                                    messageGlobal({
                                        type: 'data-transfer',
                                        contain: {
                                            select: 'global-message',
                                            set: message.contain.set,
                                            author: global.authClients[clientToken.toString()].login
                                        }
                                    });
                                }
                            break;
                        }
                    }
                break;
            }
        });

        webSocket.on('close', () => {
            if(clientToken){
                if(global.authClients[clientToken])
                    delete global.authClients[clientToken];
            }

            messageGlobal({
                type: 'data-transfer',
                contain: {
                    select: 'online-list',
                    set: Object.keys(global.authClients).length
                }
            });
        });
    });
}

module.exports = setSocket;