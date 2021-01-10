const gameHelper = require('./game');

module.exports = {
    get:function(req,callback){
        switch(req.path){
            case "/game":
                gameHelper.get(req.session.id,function(gameTemp){
                    if(gameTemp){
                        callback({status:1,view:"game",
                                data:{
                                        start:gameTemp.start,
                                        duration:gameTemp.duration,
                                        previousCardPosition:JSON.stringify(req.session.actualCardPosition),
                                        previousCardID:JSON.stringify(req.session.actualCardID),
                                        cardReturned:JSON.stringify(gameTemp.cards)
                                    }
                            });
                    }
                    else{
                        /* création d'une partie */
                        req.session.actualCardID=null;
                        req.session.actualCardPosition=null;
                        gameHelper.create(req.session.id,function(gameCreated){
                            callback({status:1,view:"game",data:{start:gameCreated.start,duration:gameCreated.duration,previousCardPosition:JSON.stringify(null),previousCardID:JSON.stringify(null),cardReturned:JSON.stringify([])}});
                        });
                    }
                })
            break;
            case "/":
                callback({status:1,view:"home"});
            break;
            case "/data":
                if(req.body){
                    gameHelper.turnCard(req.session.id,req.session.actualCardID,parseInt(req.body.cardId),function(cardID,cardPosition,isWon){
                        /* on gère dans la session le fait d'avoir une carte retournée ou pas */
                        if(req.session.actualCardID){
                            req.session.actualCardPosition=null;
                            req.session.actualCardID = null;
                        }
                        else{
                            req.session.actualCardPosition=cardPosition;
                            req.session.actualCardID = cardID;
                        }
                        callback({status:0,data:{cardID:cardID,win:isWon}});
                    });
                }
                else{
                    callback({status:404});
                }
                
            break;
            case "/scores":
                gameHelper.getBestScores(function(scores){
                    callback({status:0,data:{scores:scores}});
                });
            break;
            default:
                callback({status:404});
            break;
        }
    }
};