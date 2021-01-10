const dataHelper = require('./data'); /// Module destiné au CRUD
const Card = require('./card'); /// Classe des cartes

module.exports = {
    create:function(sessionId,callback){
        let gameTemp = new Game();
        gameTemp.session = sessionId;
        gameTemp.init(function(){
            callback(gameTemp);
        });
    },
    get:function(sessionId,callback){
        dataHelper.get("game","id,date,duration,timespent,status,session,score","session='"+sessionId+"' AND status=true",null,function(result){
            switch(result.rowCount){
                case 1:
                    /* récupération du départ de la partie */
                    let gameTemp = new Game(result.rows[0]);
                    let actualTime = new Date().getTime();
                    
                    if(actualTime-gameTemp.start>=gameTemp.duration){
                        gameTemp.timespent=gameTemp.duration;
                        gameTemp.end(function(){
                            callback(gameTemp);
                        });
                    }
                    else{
                        Card.getTurnedCards(gameTemp.id,function(cardsArray){
                            gameTemp.cards = cardsArray;
                            callback(gameTemp);
                        });
                    }
                break;
                case 0:
                    /* pas de partie en cours */
                    callback();
                break;
                default:
                    console.log("problème de logique dans la base de données au niveau des parties actives");
                break;
            }
        });
    },
    turnCard:function(sessionId,previousCardID,cardPosition,callback){
        dataHelper.get("game","id,score,date","session='"+sessionId+"' AND status=true",null,function(result){
            if(result.rowCount==1){
                Card.turn(result.rows[0].id,previousCardID,cardPosition,function(cardID){
                    if(cardID==previousCardID){
                        let gameTemp = new Game(result.rows[0]);
                        gameTemp.score+=1;
                        if(gameTemp.score==14){
                            gameTemp.timespent = new Date().getTime()-gameTemp.start;
                            gameTemp.end(function(){
                                callback(cardID,cardPosition,true);
                            });
                        }
                        else{
                            gameTemp.updateScore(function(){
                                callback(cardID,cardPosition);
                            });
                        }
                    }
                    else{
                        callback(cardID,cardPosition);
                    }
                });
            }
            else{
                callback();
            }
        });
    },
    getBestScores:function(callback){
        dataHelper.get("game","timespent","score=14 AND status=false"," ORDER BY timespent ASC",function(result){
            callback(result.rows);
        });
    }
};


/************************** */
/***********  GAME  ********/
/*
    id = identifiant de la partie
    session = session de l'utilisateur
    start = début de la partie
    duration = durée de la partie maximale
    timespent = durée de la partie (mise à jour en cas de victoire ou de défaite)
    status = statut de la partie (encours ou non)
    cards = cartes de la partie (type et position)
*/
class Game{
    /* création d'un objet Game */
    constructor(gameLightBDD){
        if(gameLightBDD){
            /* convertion de l'objet en BDD en objet en JS */
            this.id=gameLightBDD.id;
            this.start=parseInt(gameLightBDD.date);
            this.duration=parseInt(gameLightBDD.duration);
            this.timespent=parseInt(gameLightBDD.timespent);
            this.score=parseInt(gameLightBDD.score);
            this.status=gameLightBDD.status;
            this.cards = [];
        }
        else{
            /* paramétrage par défaut */
            this.start=new Date().getTime();
            this.duration=120000; // temps imparti par défaut (2 minutes)
            this.timespent=0;
            this.status=true;
            this.score=0;
            this.cards = [];
        }
    };

    /* Initialisation d'une partie en BDD */
    init(callback){
        let fieldsString = "(id,session,date,duration,timespent,status,score)"; /// champs à insérer
        let valuesString = "(nextval('game_id'),'"+this.session+"',"+this.start+","+this.duration+",0,true,0)"; /// valeurs associées
        dataHelper.insert("game",fieldsString,valuesString,"id",function(gameID){
            /* initialisation des cartes */
            Card.initCards(gameID,function(){
                callback();
            });
        });
    };

    /* Mise à jour du score */
    updateScore(callback){
        dataHelper.update("game","score="+this.score,"id="+this.id,null,callback);
    }

    /* Enregistrement de la fin de la partie */
    end(callback){
        dataHelper.update("game","score="+this.score+",status=false,timespent="+this.timespent,"id="+this.id,"id",function(gameID){
            /* Suppression des cartes de la partie en BDD */
            Card.delete(gameID,callback);
        });
    };
}
/************************** */
/************************** */