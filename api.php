<?php

include_once "connessione.php";

if(isset($_GET['req'])) {

    $req = $_GET['req'];

    switch ($req) {
        case "getClassifica":

            if (isset($_GET['difficolta'])){
              $difficolta = $_GET['difficolta'];
              $query = "SELECT * FROM classifica WHERE diff = ? ORDER BY punteggio ASC";
            } else {
              $query = "SELECT * FROM classifica ORDER BY diff DESC, punteggio ASC";
            }

            $prep = $conn->prepare($query);
            $prep->bind_param('i', $difficolta);
            $prep->execute();
            $ris = $prep->get_result();

            if ($ris->num_rows == 0)
              $arr = array('request' => $req, 'response' => false);
            else {
              $classifica = array();
              while($row = $ris->fetch_array(MYSQLI_ASSOC)){
                array_push($classifica, array('nome' => $row['nome'], 'difficolta' => $row['diff'], 'punteggio' => $row['punteggio']));
              }
              $arr = array('request' => $req, 'response' => $classifica);
            }

            header('Content-Type: application/json');
            echo json_encode($arr);

            break;

        case "addRecord":

            if (isset($_GET['nome']) && isset($_GET['diff']) && isset($_GET['punteggio'])){
              $nome = $_GET['nome'];
              $difficolta = $_GET['diff'];
              $punteggio = $_GET['punteggio'];
            }
            else
                die("Parametro/i mancante/i");

            $prep = $conn->prepare("SELECT * FROM classifica WHERE nome = ? AND diff = ?");
            $prep->bind_param('si', $nome, $difficolta);
            $prep->execute();
            $ris = $prep->get_result();

            if ($ris->num_rows != 0){
              $row = $ris->fetch_array(MYSQLI_ASSOC);
              if($row['punteggio'] <= $punteggio){ //record non effettuato
                $arr = array('request' => $req, 'response' => false);
              } else {  //aggiorno il record
                $prep = $conn->prepare("UPDATE classifica SET punteggio = ? WHERE nome = ? AND diff = ?");
                $prep->bind_param('isi', $punteggio, $nome, $difficolta);
                $prep->execute();
                $ris = $prep->get_result();
                $arr = array('request' => $req, 'response' => true);
              }
            } else { //inserisco il record
              $prep = $conn->prepare("INSERT INTO classifica (nome, diff, punteggio) VALUES (?, ?, ?)");
              $prep->bind_param('sii', $nome, $difficolta, $punteggio);
              $prep->execute();
              $ris = $prep->get_result();
              $arr = array('request' => $req, 'response' => true);
            }

            header('Content-Type: application/json');
            echo json_encode($arr);

            break;
        }

} else {
    die("Richiesta errata");
}
