<?php
/*
 * Функции для работы с БД
 */

function db_query($query, $args = null)
{
    global $mssql;
    if (!isset($mssql)) {
        $mssql = sqlsrv_connect('(local)', array('Database' => 'Kinozal', 'CharacterSet' => SQLSRV_ENC_CHAR));
        if ($mssql === false) {
            $err = sqlsrv_errors();
            echo html_escape($err[0]['message']);
            exit();
        }
    }
    $reader = sqlsrv_query($mssql, $query, $args);
    if ($reader === false)
    {
        echo '<pre>Ошибка при выполнении запроса', "\n", htmlspecialchars($query), "\n\n";
        $err = sqlsrv_errors();
        echo html_escape(substr($err[0]['message'], 54));
        echo '</pre>';
        exit();
    }
    return $reader;
}

function db_fetch($reader)
{
    return sqlsrv_fetch_array($reader, SQLSRV_FETCH_ASSOC);
}

/**
 * Возвращает первую строку в запросе, либо false, если запрос вернул 0 строк
 * @param string $query
 * @param array $args
 * @return array|false
 */
function db_query_row($query, $args = null)
{
    return sqlsrv_fetch_array(db_query($query, $args), SQLSRV_FETCH_ASSOC);
}

/**
 * Возвращает результат запроса в виде массива
 * @param string $query
 * @param array $args
 * @return array
 */
function db_query_rows($query, $args = null)
{
    $rows = array();
    $reader = db_query($query);
    while ($row = sqlsrv_fetch_array($reader, SQLSRV_FETCH_ASSOC))
        $rows[] = $row;
    return $rows;
}

/*
function db_next_result(&$result)
{
    return sqlsrv_next_result($result);
}

function db_escape($value, $quotes = true)
{
    if (!is_string($value))
        return $value;
    if ($quotes)
        return 'N\'' . str_replace('\'', '\'\'', $value) . '\'';
    else
        return str_replace('\'', '\'\'', $value);
}

function db_escape_like($value)
{
    return str_replace(array('\'', '[', '_', '%'), array('\'\'', '[[]', '[_]', '[%]'), $value);
}

function db_insert($table, $values, $identity = true)
{
    foreach ($values as $key => &$value)
    {
        if (is_array($value))
            $value = $value[0];
        else
            $value = db_escape($value);
    }
    $query = 'INSERT INTO ' . $table . ' (' . implode(', ', array_keys($values)) . ') VALUES (' . implode(', ', array_values($values)) . ')';
    if ($identity)
        $query .= ' SELECT SCOPE_IDENTITY() id';
    $result = db_query($query);
    if ($identity)
    {
        db_next_result($result);
        $id = db_fetch($result);
        return $id['id'];
    }
}
*/
