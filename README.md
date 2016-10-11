# Self test on nodejs kad package

## Setup env
    docker pull mongo
    docker pull index.alauda.cn/tutum/mongodb:3.0
    docker run -d --net host -e MONGODB_PASS="pass" mongodb
    
    docker pull rabbitmq
    docker pull index.alauda.cn/library/rabbitmq
    docker run -d --net host rabbitmq

## Setup MongoDB
    use __storj-complex-example
    db.createUser({"user": "renter", "pwd": "pass", "roles": ["dbOwner", {"role": "dbAdmin", "db": "admin"}]}); 
    
    use __storj-bridge-develop
    db.createUser({"user": "bridge", "pwd": "pass", "roles": ["dbOwner", {"role": "dbAdmin", "db": "admin"}]}); 

## change core
    async.retry({times: 5, interval: 5000}, self._enterOverlay.bind(self), onJoinComplete);
    // self._enterOverlay(onJoinComplete);
    
## payment
    129tV17x1BTGPV5f19dHxRx9uHJoZdAu5U