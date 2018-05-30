<?php

    $conn = new mysqli("localhost", "root", "12345678", "memory");

    if($conn->error){
        die("Errore nella connessione n. ".$conn->errno);
    }

?>
