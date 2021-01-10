const dataHelper = require('./data'); /// Module destiné au CRUD

/************************** */
/***********  CARD  ********/
/*
    cardId = identifiant de la carte (image correspondante)
    position = position sur le plateau de jeu
    status = carte retournée ou pas
*/
class Card{
    constructor(cardId,position){
        this.cardId=cardId;
        this.position=position;
        this.status=false;
    }
}

module.exports = {
    initCards(gameID,callback){

        var cardsArray = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18];

        var result = [];

        // On retire 4 cartes qui ne seront pas utilisées dans le jeu
        removeRandomCard(cardsArray);
        removeRandomCard(cardsArray);
        removeRandomCard(cardsArray);
        removeRandomCard(cardsArray);
        
        //On double les valeurs du tableau pour créer les paires
        cardsArray = cardsArray.concat(cardsArray);

        // On parcours l'ensemble des cases en tirant au sort une carte
        for(var counter = 0;counter<28;counter++){
                var cardIndex = Math.floor(Math.random() * cardsArray.length); ///random pour tirer une carte au sort par son index
                result.push(new Card(cardsArray[cardIndex],counter+1));
                cardsArray.splice(cardIndex,1); ///on retire la carte du tableau
        }

        let fieldsString = "(id,position,gameid,status)"; ///champs à insérer
        let valuesString = "";
        for(var counter = 0;counter<result.length;counter++){ ///itération des cartes
            let actualCard = result[counter];
            if(counter>0){
                valuesString+=",";
            }
            valuesString+="("+actualCard.cardId+","+actualCard.position+","+gameID+",false)"; ///valeurs à insérer pour une carte
        }
        dataHelper.insert("card",fieldsString,valuesString,null,callback);
    },
    /* Touner une carte */
    turn(gameID,previousCardID,position,callback){
        /* Récupération de la carte */
        dataHelper.get("card","id","gameid="+gameID+" AND position="+position+" AND status=false",null,function(result){
            if(result.rowCount==1){
                let cardID = result.rows[0].id;
                if(previousCardID==null || previousCardID==cardID){
                    dataHelper.update("card","status=true","gameid="+gameID+" AND position="+position,null,function(){
                        callback(cardID);
                    });
                }
                else{
                    dataHelper.update("card","status=false","gameid="+gameID+" AND id="+previousCardID,null,function(){
                        callback(cardID);
                    });
                }
            }
            else{
                callback();
            }
        });
    },
    /* Récupération des cartes déjà tournées (si on rafraichit la page) */
    getTurnedCards(gameID,callback){
        dataHelper.get("card","position,id","gameid="+gameID+" AND status=true",null,function(result){
            callback(result.rows);
        });
    },

    delete(gameID,callback){
        dataHelper.delete("card","gameid="+gameID,callback);
    }
}

function removeRandomCard(cardsArray){
    return cardsArray.splice(Math.floor(Math.random() * cardsArray.length),1);
}