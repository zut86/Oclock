/* Lancement du jeu */
function startGame(){
    window.location.href = "game";
}

/* Récupération des meilleurs scores */
function getBestScores(){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            let resJSON = JSON.parse(xhr.response);
            if(resJSON.scores.length>0){
                var ul = document.getElementById("temps");
                document.getElementById("scoreTitle").style.display="inline";
                for(let index in resJSON.scores){
                    var li = document.createElement("li");
                    var position = parseInt(index)+1;
                    let millisecondValue = resJSON.scores[index].timespent;
                    let minutesValue = Math.floor(millisecondValue/60000);
                    let secondsValue = Math.floor((millisecondValue-minutesValue*60000)/1000);
                    var score = minutesValue+"min "+secondsValue+"sec";
                    li.appendChild(document.createTextNode(position+" - "+score));
                    ul.appendChild(li);
                }
            }
        }
    }
    xhr.open("POST", "scores", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send();
}
getBestScores();