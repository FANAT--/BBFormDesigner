<?php
require 'app.php';

function torrent($field)
{
    global $torrent;
    if ($torrent)
        return html_escape($torrent[$field]);
    return '';
}

$from = get_int('from'); // id раздачи, оформление которой используется
$torrent = false;
if ($from != 0)
{
    $torrent = db_query_row('SELECT t.title name, category type, c.kinozal_section_id section, type ttype, u.url imgl, predesc d1, description d2, tech d3, notes d4, rgroup, u2.url rbut FROM torrents t JOIN torrent_covers tc ON t.cover_id=tc.id JOIN urls u ON tc.url_id=u.id JOIN torrent_rbuts rb ON t.rbut_id=rb.id JOIN urls u2 ON rb.url_id=u2.id JOIN categories c ON t.category=c.id WHERE t.id=' . $from);
}

?><!DOCTYPE HTML>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=windows-1251">
		<title>upload.php</title>
		<link rel="shortcut icon" href="../favicon.ico" type="image/x-icon">

        <!-- Стиль формы основан на стиле трекера, поэтому подключаем его (обязательно ДО подключения стиля формы) -->
        <link rel="stylesheet" href="http://st.kinozal.tv/pic/<?=get_int('style')?>.css?v=3.5" type="text/css">

        <!-- стиль формы -->
        <link rel="stylesheet" href="css/app.css" type="text/css">

		<!-- функции для работы с DOM  -->
		<script src="js/upload_framework.js" type="text/javascript"></script>
		<!-- работа с торрент-файлом -->
		<script src="js/torrent.js" type="text/javascript"></script>
		<!-- обработка BB-кода -->
		<script src="js/bb.engine.js" type="text/javascript"></script>

		<!-- controls -->
		<script src="js/controls/anytext.js" type="text/javascript"></script>
		<script src="js/controls/text.js" type="text/javascript"></script>
		<script src="js/controls/combo.js" type="text/javascript"></script>
		<script src="js/controls/bbtext.js" type="text/javascript"></script>
		<script src="js/controls/bblist.js" type="text/javascript"></script>
		<script src="js/controls/bbtabs.js" type="text/javascript"></script>
		<script src="js/controls/set.js" type="text/javascript"></script>

		<!-- kinozal.tv templates -->
		<script src="js/templates.js" type="text/javascript"></script>
		<script src="js/upload.js" type="text/javascript"></script>
	</head>
    <body>
        <div class="bx2" style="margin: 127px 5px 200px 200px;">

            <!-- левое меню -->
            <div class="mn3_menu">
                <ul class=men>
                    <li class="tp b">Информация</li>
                    <li class="justify">Версия 1.0</li>
                    <li class="justify">Чтобы использовать оформление существующей раздачи, добавьте в запрос параметр from</li>
                </ul>
            </div>

            <!-- форма -->
            <div class='mn3_content'>
                <form enctype="multipart/form-data" method="post" name="upt" id="upt">

                    <div class="bx1 upl">
                        <ul class="men up">
                            <li class="hdr">Название</li>
                            <li class="input"><input name="name" value="<?=torrent('name')?>" class="w100p"/></li>
                            <li class="hdr">Торрент-файл</li>
                            <li><input type="file" name="file" class="w100p"/></li>
                            <li class="hdr">Ссылка на постер</li>
                            <li class="input">
                                <input name="imgl" value="<?=torrent('imgl')?>" class="w100p"/>
                                <div class="n">Ширина постера - 200 пикселей. Разместите постер на одном из <a href="http://forum.kinozal.tv/showthread.php?t=78697">хостингов изображений</a>.</div>
                            </li>
                        </ul>
                    </div>


                    <?php if (!$torrent): ?>
                    <div class="bx1 upl">
                        <ul id="tlist">
                            <li class="up_tmplt">Тип раздачи</li>
                        </ul>
                    </div>
                    <?php endif ?>

                    <div class="bx1 upl">
                        <ul>
                            <li class="up_tmplt" title="Вы можете переключаться между режимами оформления в любой момент">Режим оформления</li>
                            <li class="up_tmpl bx1 sbab" id="m0" onmousedown="Upl.changeMode(0);" title="Отдельные поля с подсказками. Подойдет большинству пользователей.">Обычный режим</li>
                            <li class="up_tmpl up_tmpls bx1" id="m1" onmousedown="Upl.changeMode(1);" title="Не хватает простора для творчества? Возьмите управление BB-кодами на себя!">Продвинутый режим</li>
                        </ul>
                    </div>

                    <div class="bx1 upl">
                        <ul class="men up">
                            <li class="fhdr"><div class="sbab up_toggle" onclick="Upl.switchMode(0);">Сменить режим</div>Предварительное описание</li>
                            <li class="input"><div class="up_fields" id="f1"></div><textarea id="d1" name="desc1" rows="8" class="w100p"><?=torrent('d1')?></textarea></li>
                        </ul>
                    </div>

                    <div class="bx1 upl">
                        <ul class="men up">
                            <li class="fhdr"><div class="sbab up_toggle" onclick="Upl.switchMode(1);">Сменить режим</div>Описание</li>
                            <li class="input"><div class="up_fields" id="f2"></div><textarea id="d2" name="desc2" rows="10" class="w100p"><?=torrent('d2')?></textarea></li>
                        </ul>
                    </div>

                    <div class="bx1 upl">
                        <ul class="men up">
                            <li class="fhdr"><div class="sbab up_toggle" onclick="Upl.switchMode(2);">Сменить режим</div>Технические данные</li>
                            <li class="input"><div class="up_fields" id="f3"></div><textarea id="d3" name="desc3" rows="8" class="w100p"><?=torrent('d3')?></textarea></li>
                        </ul>
                    </div>

                    <div class="bx1 upl">
                        <ul class="men up">
                            <li class="fhdr"><div class="sbab up_toggle" onclick="Upl.switchMode(3);">Сменить режим</div>Оформление, закладки, примечания, скриншоты</li>
                            <li class="input"><div class="up_fields" id="f4"></div><textarea id="d4" name="desc4" rows="31" class="w100p"><?=torrent('d4')?></textarea></li>
                        </ul>
                    </div>

                    <div class="bx1 upl">
                        <ul class="men up">
                            <li class="hdr">Релиз-группа</li>
                            <li>
                                <select name="rgroup" class="w250" onchange="document.forms['upt'].elements['rbut'].value = this.value == '0' ? '' : ('/pic/groupex/' + this.value + '.gif');">
                                    <option value="0">Выберите релиз группу</option>
                                    <?php
                                    $rgroups = db_query_rows('SELECT id, title FROM rgroups ORDER BY id');
                                    echo_options($rgroups, $torrent ? $torrent['rgroup'] : 0);
                                    ?>
                                </select>
                            </li>
                            <li class="hdr">Кнопка релиз-группы</li>
                            <li class="input">
                                <input name="rbut" class="w100p" value="<?=torrent('rbut')?>">
                                <div class="n">Кнопка релиз-группы (88x31) или имя релиз группы если нет баннера, разместить баннер, <a href="http://forum.kinozal.tv/showthread.php?t=78697">список хостингов</a></div>
                            </li>
                        </ul>
                    </div>

                    <div class="bx1 upl">
                        <ul class="men up">
                            <li class="hdr">Раздел</li>
                            <li>
                                <input type="hidden" name="type" id="type" value="0"/>

                                <select class="w250 up_hide" id="type1">
                                    <option value=0>Выберите раздел</option>
                                    <?php echo_options(db_query_rows('SELECT id, title FROM categories WHERE deleted=0 AND kinozal_section_id=1 ORDER BY position'), torrent('type')); ?>
                                </select>

                                <select class="w250 up_hide" id="type2">
                                    <option value=0>Выберите раздел</option>
                                    <?php echo_options(db_query_rows('SELECT id, title FROM categories WHERE deleted=0 AND kinozal_section_id=2 ORDER BY position'), torrent('type')); ?>
                                </select>

                                <select class="w250 up_hide" id="type3">
                                    <?php echo_options(db_query_rows('SELECT id, title FROM categories WHERE deleted=0 AND kinozal_section_id=3 ORDER BY position'), torrent('type')); ?>
                                </select>

                                <select class="w250 up_hide" id="type4">
                                    <?php echo_options(db_query_rows('SELECT id, title FROM categories WHERE deleted=0 AND kinozal_section_id=4 ORDER BY position'), torrent('type')); ?>
                                </select>

                                <select class="w250 up_hide" id="type5">
                                    <?php echo_options(db_query_rows('SELECT id, title FROM categories WHERE deleted=0 AND kinozal_section_id=5 ORDER BY position'), torrent('type')); ?>
                                </select>

                                <select class="w250 up_hide" id="type6">
                                    <?php echo_options(db_query_rows('SELECT id, title FROM categories WHERE deleted=0 AND kinozal_section_id=6 ORDER BY position'), torrent('type')); ?>
                                </select>

                                <select class="w250 up_hide" id="type7">
                                    <?php echo_options(db_query_rows('SELECT id, title FROM categories WHERE deleted=0 AND kinozal_section_id=7 ORDER BY position'), torrent('type')); ?>
                                </select>

                            </li>
                            <li class="hdr">Тип раздачи</li>
                            <li>
                                <select name="ttype" class="w250 styled">
                                    <option value="0">Обычная раздача</option>
                                    <?php
                                    $ttype = $torrent ? $torrent['ttype'] : 0;
                                    ?>
                                    <option value=3 <?php if ($ttype == 3) echo 'selected '; ?>style='color:#c13600'>Тестовая раздача</option>
                                    <option value=2 <?php if ($ttype == 2) echo 'selected '; ?>style='color:#A0A7AD'>Серебряная раздача</option>
                                    <option value=1 <?php if ($ttype == 1) echo 'selected '; ?>style='color:#DCAF35'>Золотая раздача</option>
                                    <option value=4 <?php if ($ttype == 4) echo 'selected '; ?>style='color:#0096c1'>Скрытая раздача</option>
                                    <option value=5 <?php if ($ttype == 5) echo 'selected '; ?>style='color:#a83838'>Новинки кино</option>
                                </select>
                                <a href="http://forum.kinozal.tv/showpost.php?p=2715225" class=sba>Правила включения золотых и серебряных раздач</a>
                            </li>
                        </ul>
                     </div>

                     <div class="bx1" style="padding: 4px;">
                        <input type="button" value="Залить раздачу" onclick="Upl.upload();"/>
                        <!-- <input type="button" value="Сброс изменений" onclick="Upl.reset();"/> TODO можно показывать при from-параметре -->
                        <input type="button" value="Предварительный просмотр" onclick="Upl.test();"/>
                     </div>
                </form>

                <script type="text/javascript">
<?php if (!$torrent): ?>
                    Upl.showTemplates();
                    Upl.setTemplate(1);
<?php else: ?>
                    Upl.editMode(1);
                    Upl.setTemplate(<?=torrent('section')?>);
<?php endif ?>
                    Upl.changeMode(0);
                </script>

            </div>
        </div>
    </body>
</html>