/* Mise à jour de la barre de progression */
let stop = false;
function updateProgress(){  
    let progress = document.getElementById("time");
    let actualTime = new Date().getTime();
    let elapsedTime = (actualTime-start)*100/(duration);
    if(elapsedTime>=100){
        progress.value = 100;
        alert("C'est fini ! Essayez à nouveau :)");
        window.location = "/";
    }
    else{
        if(progress){
            progress.value = elapsedTime;
        }
        /* mise à jour de la progressbar toutes les 50 millisecondes*/
        if(!stop){
            setTimeout(updateProgress,50);
        }
    }
}

/* Initialisation des événements de la page */
document.addEventListener("DOMContentLoaded",initPage);
function initPage(){
    let cardsHTML = document.getElementsByTagName("card");
    for(let counter = 0;counter < cardsHTML.length; counter++){
        cardsHTML[counter].onclick = returnCard;
    }

    for(let counter = 0;counter < cardReturned.length; counter++){
        let cardHTML = document.getElementById(cardReturned[counter].position);
        displayCard(cardHTML,cardReturned[counter].id);
    }

    updateProgress();
}

/* Sélection d'une carte */
var returningCard = false;
function returnCard(cardTemp){
    if(!returningCard && cardTemp.target.id!=previousPosition && !cardTemp.target.isTurned){
        returningCard=true;
        cardTemp.target.isTurned = true;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                let resJSON = JSON.parse(xhr.response);
                console.log(resJSON);
                if(resJSON.win){
                    stop=true;
                    alert("Bravo !");
                    window.location = "/";
                }
                if(resJSON.cardID){
                    let cardID = resJSON.cardID;
                    displayCard(cardTemp.target,cardID);
                    if(previousPosition){
                        manageDuet(cardID,cardTemp.target);
                    }
                    else{
                        previousPosition=cardTemp.target.id;
                        previousCardID=cardID;

                        returningCard=false;
                    }
                }
                else{
                    returningCard=false;
                }
            }
        }
        xhr.open("POST", "data", true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
            cardId: cardTemp.target.id
        }));
    }
}

/* Affichage de la carte */
function displayCard(element,id){
    let index=(-((element.offsetHeight-4)*100)/document.body.offsetHeight)*(id-1);
    element.style["background-image"] = "url('img/cards.png')";
    element.style["background-position-x"] ="center";
    element.style["background-position-y"] =index+"vh";
}

/* Vérification d'une paire */
function manageDuet(cardID,actualCard){
    /* Vérification si les cartes sont identiques */
    if(previousCardID == cardID){
        previousPosition=null;
        previousCardID=null;

        returningCard=false;
    }
    else{
        setTimeout(function(){
            let previousCard = document.getElementById(previousPosition);
            previousCard.style.background = null;
            actualCard.style.background = null;

            previousCard.isTurned=false;
            actualCard.isTurned=false;

            previousPosition=null;
            previousCardID=null;

            returningCard=false;
        },1000);
    }
}