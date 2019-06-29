function verifyResult(result, request, collection, callback){
    function insertData(login, password){
        collection.insertOne({ login: login, password: password, status: 'default' }, (fail, insertResult) => {
            if(!fail){
                callback({
                    authResult: true,
                    id: insertResult.ops[0]._id.toString(),
                    passHash: password,
                    newUser: true
                });
            } else {
                callback({
                    authResult: false,
                    reason: 'Database failure',
                    systemFail: true
                });
            }
        });
    }

    switch(result.length){
        case 1:
            result = result[0];
            if(
                request.body.password.toString()
                    === result.password.toString()
            ){
                let toReturn = {
                    authResult: true,
                    id: result._id.toString()
                };

                if(!request.body.nohash)
                    toReturn.passHash = request.body.password;

                callback(toReturn);
            } else {
                callback({
                    authResult: false,
                    reason: 'Invalid login data'
                });
            }
        break;
        case 0:
            if(request.body.nohash){
                callback({
                    authResult: false,
                    reason: 'Account not exists',
                });
            } else insertData(request.body.login, request.body.password);
        break;
        default:
            if(request.body.nohash){
                callback({
                    authResult: false,
                    reason: 'Many accouts with this name found, contact to admins',
                    systemFail: true
                });
            } else {
                collection.deleteMany({ login: request.body.login }, fail => {
                    if(!fail) insertData(request.body.login, request.body.password);
                    else callback({
                        authResult: false,
                        reason: 'Database failure',
                        systemFail: true
                    });
                });
            }
        break;
    }
}

module.exports = verifyResult;