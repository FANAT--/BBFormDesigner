<?php
header('Content-type: text/plain; charset=windows1251');

$path = $_SERVER['SERVER_NAME'] . $_SERVER['REQUEST_URI'];
echo 'Upload page: ', $path, 'upload.php[?from=<id>]';
echo "\n";
echo 'Edit page: ', $path, 'edit.php[?id=<id>]';