const crypto = require('crypto');
function hash(string){ return crypto.createHash('md5').update(string).digest("hex"); }

function formResult(searchResult, authData, callback){
    const template = {
        invaidData: {
            authResult: false,
            contain: {
                code: 'a',
                message: 'Invalid login details'
            }
        },
        newUser: {
            authResult: true,
            contain: {
                passHash: hash(authData.pincode),
                id: null,
                newUser: true
            }
        }
    };
    switch(searchResult.length){
        case 1:
            searchResult = searchResult[0];
            if(
                (('pincode' in searchResult)
                && ('login' in searchResult))
                && (('pincode' in authData)
                && ('login' in authData))
            ){
                let resultPincode 
                    = authData.nohash === true ? authData.pincode : hash(authData.pincode);
                
                if(
                    resultPincode.toString() === 
                        searchResult.pincode.toString()
                ){
                    callback({
                        authResult: true,
                        contain: {
                            passHash: resultPincode,
                            id: searchResult._id,
                            newUser: false
                        }
                    });
                } else
                    callback(template.invaidData);
            } else
                callback(template.invaidData);
        break;
        case 0:
            if(authData.nohash){
                callback({
                    authResult: false,
                    contain: {
                        code: 'a',
                        message: 'This account doesn\'t exist'
                    }
                });
            } else {
                callback(template.newUser);
            }
        break;
        default:
            if(authData.nohash){
                callback({
                    authResult: false,
                    contain: {
                        code: 'd',
                        message: 'More then one account<br>with same name found'
                    }
                });
            } else {

            }
        break;
    }
}

module.exports = formResult;