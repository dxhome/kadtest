# Self test on nodejs kad package

## Setup MongoDB
    use __storj-complex-example
    db.createUser({"user": "renter", "pwd": "pass", "roles": ["dbOwner", {"role": "dbAdmin", "db": "admin"}]}); 
    
    use __storj-bridge-develop
    db.createUser({"user": "bridge", "pwd": "pass", "roles": ["dbOwner", {"role": "dbAdmin", "db": "admin"}]}); 

## change core
    async.retry({times: 5, interval: 5000}, self._enterOverlay.bind(self), onJoinComplete);
    // self._enterOverlay(onJoinComplete);