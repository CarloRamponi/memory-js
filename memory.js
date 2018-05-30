var COLORS = [
  "#ffd600",
  "#d50000",
  "#2962ff",
  "#2e7d32",
  "#3e2723",
  "#00bfa5",
  "#ff9100",
  "#aa00ff"
];

COLORS = shuffle(COLORS);

var cards;
var numeroCarte = 0;
var turn = false;
var prev = -1;
var score = 0;
var tries = 0;
var animationDuration = 500;

$("#selectDiff").change(
  function() {
    numeroCarte = $(this).val();
    updateClassifica();
  }
);

$("#giocaButton").click(function () {

  if(numeroCarte === 0){
    $("#alertDifficolta").show(animationDuration);
  } else {
    $("#giocaForm").hide();
    $("#alertDifficolta").hide(animationDuration);
    $("#restartForm").show();

    //creo l'array delle carte e lo mescolo
    cards = new Array(numeroCarte);
    for(let i = 0; i < numeroCarte; i++){
      cards[i] = new Object();
    }

    for(let i = 0; i < numeroCarte; i+=2){
      cards[i].color = i/2;
      cards[i+1].color = i/2;
    }

    cards = shuffle(cards);

    for(let i = 0; i < numeroCarte; i++){
      cards[i].revealed = false;
    }

    //decido la grandezza delle carte in base a quante carte ci devono essere
    var html = "";
    if(numeroCarte < 8)
      var width = (100 - (numeroCarte)) / numeroCarte;
    else
      var width = (100 - (numeroCarte / 2)) / (numeroCarte / 2);

    //creo le carte
    for(var i = 0; i < numeroCarte; i++){
      html += '<a class="card" id="card'+i+'" data-cardnum="'+i+'" style=" width : '+width+'%; padding-top: '+width+'%;"></a>';
    }

    $("#cards").html(html);

    //creo il listener per il mouseover che funziona solo se la carta non è girata
    $(".card").hover(function(event) {
      var index = $(this).attr('data-cardnum');
      if(!cards[index].revealed){
        $(this).css({'background-color': (event.type === "mouseenter") ? "#005572" : "#1482a1"});
      }
    });

    $(".card").click(function () {

      var index = $(this).attr('data-cardnum');

      if(!cards[index].revealed) {

        reveal(index);

        //se turn è false si sta girando la prima carta, altrimenti la seconda
        if(!turn){
          prev = index;
        } else {
          //controllo se le due carte girate sono dello stesso colore
          if(cards[index].color === cards[prev].color){
            score++;
            var card1 = index;
            var card2 = prev;
            setTimeout(function () {
                vanish(card1, card2);
                updateScore();
            }, 700);
          } else {
            //giro le carte
            var card1 = index;
            var card2 = prev;
            setTimeout(function () {
              unreveal(card1);
              unreveal(card2);
            }, 700);
          }
          tries++;
          updateTries();
        }

        turn = !turn;

      }

    });

    $("#giocoDiv").show(animationDuration);

  }

});

updateClassifica();
setInterval(updateClassifica, 3000);

function vanish(card1, card2){
  $("#card"+card1).fadeTo(700, 0);
  $("#card"+card2).fadeTo(700, 0);
}

function updateClassifica() {

  if(numeroCarte) {
    var data = {
      req : 'getClassifica',
      difficolta : numeroCarte
    }
  } else {
    var data = {
      req : 'getClassifica'
    }
  }

  $.ajax({
    url: "api.php",
    type: "GET",
    data: data,
    success: function(result) {

        if(result.response === false){
          $('#classifica').html('Ancora niente nella classifica');
        } else {

          var strOutput = '<table class="table table-striped"><tr><th>#</th><th>Nome</th><th>Punteggio</th><th>Difficoltà</th></tr>';

          var num = 1;
          var prevDiff = 0;

          for (var i=0; i < result.response.length; i++) {

              if(prevDiff != result.response[i].difficolta && i){
                num = 1;
                strOutput += '</table><br><table class="table table-striped"><tr><th>#</th><th>Nome</th><th>Punteggio</th><th>Difficoltà</th></tr>';
              }

              strOutput += '<tr><th>' + num + '</th><td>' + result.response[i].nome + "</td>" + "<td>" + result.response[i].punteggio + "</td>";
              switch (result.response[i].difficolta) {
                case 2:
                  var diff = "Babbo";
                  break;
                case 4:
                  var diff = "Facilissimo";
                  break;
                case 8:
                  var diff = "Facile";
                  break;
                case 12:
                  var diff = "Medio";
                  break;
                case 16:
                  var diff = "Difficile";
                  break;
              }
              strOutput += "<td>" + diff + "</td></tr>";

              prevDiff = result.response[i].difficolta;
              num++;
          }

          strOutput += '</table>';

          $('#classifica').html(strOutput);

        }
    }
  });
}

function updateScore() {
  $("#score").text(score);
  if(score == numeroCarte/2){

    //Scrollo fino alla classifica
    // $('html, body').animate({
    //     scrollTop: $("#classificaTitle").offset().top
    // }, 1000);

    //Nascondo il div del gioco
    setTimeout(function(){
      $("#giocoDiv").hide(700);
    }, 700);

    //Chiedo all'utente il suo nome
    setTimeout(function () {
      var nome = prompt("Hai vinto!\nMosse: "+tries+"\nInserisci il tuo nome per apparire nella classifica : ", "");
      if(nome !== null && nome.trim() !== ""){

        $.ajax({
          url: "api.php",
          type: "GET",
          data: { req : 'addRecord', nome: nome, diff : numeroCarte, punteggio: tries },
          success: function(result) {

              if(!result.response){
                $("#recordNonBattutoAlert").show(animationDuration);
              } else {
                $("#recordBattutoAlert").show(animationDuration);
              }
            }
          });
      }
    }, 1400);
  }
}

function updateTries() {
  $("#tries").text(tries);
}

function unreveal(index) {

  $("#card"+index).css({
    'cursor' : 'pointer'
  }).animate({
    'background-color' : '#1482a1'
  }, 500);

  cards[index].revealed = false;

}

function reveal(index) {

  $("#card"+index).css({
    'cursor' : 'initial',
  }).animate({
    'background-color' : COLORS[cards[index].color],
  }, 500);

  cards[index].revealed = true;

}

function shuffle(array) {

  for (let counter = array.length; counter > 0;) {
      let index = Math.floor(Math.random() * counter);
      counter--;
      let temp = array[counter];
      array[counter] = array[index];
      array[index] = temp;
  }

  return array;
}
