const WebSocket = require('ws').Server;
function setSocket(server){
    const webSocketServer = new WebSocket({ server: server });
    var clientToken = null;

    function messageGlobal(message){
        for(let client in global.authClients){
            if(!('webSocket' in client))
                delete global.authClients[client];
            else {
                global.authClients[client].webSocket.send(
                    JSON.stringify(message)
                );
            }
        }
    }

    webSocketServer.on('connection', webSocket => {
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
                                    messageGlobal({
                                        type: 'data-transfer',
                                        contain: {
                                            select: 'global-message',
                                            set: message.contain.set
                                        }
                                    });
                                }
                            break;
                        }
                    }
                break;
            }

            console.log(message);
        });

        webSocket.on('close', () => {

        });
    });
}

module.exports = setSocket;