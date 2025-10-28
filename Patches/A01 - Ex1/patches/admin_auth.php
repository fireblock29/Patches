<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
function require_admin() {
    if (!isset($_SESSION['dvwa']['username']) || $_SESSION['dvwa']['username'] !== 'admin') {
        http_response_code(403);
        exit('Forbidden: admin access required.');
    }
}
