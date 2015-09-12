<?php

require_once 'db.php';

/**
 * ���������� ������ ��� ������ � html-��������
 * @param $value
 * @return string
 */
function html_escape($value)
{
    return is_string($value) ? htmlspecialchars($value, ENT_COMPAT, 'windows-1251') : $value;
}

/**
 * �������� �������� �������� �� GET-�������
 * @param string $name
 * @param int $default
 * @return int
 */
function get_int($name, $default = 0)
{
    return isset($_GET[$name]) ? (int)$_GET[$name] : $default;
}


/**
 * ������� ������ options ��� ���� select
 * @param array $items
 * @param int $selected
 */
function echo_options($items, $selected = 0)
{
    foreach ($items as $item)
    {
        // �� ���������� html_escape(), �.�. ������� � ������
        echo '<option value="', $item['id'], '"';
        if ($item['id'] === $selected)
            echo ' selected';
        echo '>', $item['title'], '</option>';
    }
}

header('Content-type: text/html; charset=windows-1251'); // ����� ����� ���
