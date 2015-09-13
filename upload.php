<?php
require 'app.php';

function torrent($field)
{
    global $torrent;
    if ($torrent)
        return html_escape($torrent[$field]);
    return '';
}

$from = get_int('from'); // id �������, ���������� ������� ������������
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

        <!-- ����� ����� ������� �� ����� �������, ������� ���������� ��� (����������� �� ����������� ����� �����) -->
        <link rel="stylesheet" href="http://st.kinozal.tv/pic/<?=get_int('style')?>.css?v=3.5" type="text/css">

        <!-- ����� ����� -->
        <link rel="stylesheet" href="css/app.css" type="text/css">

		<!-- ������� ��� ������ � DOM  -->
		<script src="js/upload_framework.js" type="text/javascript"></script>
		<!-- ������ � �������-������ -->
		<script src="js/torrent.js" type="text/javascript"></script>
		<!-- ��������� BB-���� -->
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

            <!-- ����� ���� -->
            <div class="mn3_menu">
                <ul class=men>
                    <li class="tp b">����������</li>
                    <li class="justify">������ 1.0</li>
                    <li class="justify">����� ������������ ���������� ������������ �������, �������� � ������ �������� from</li>
                </ul>
            </div>

            <!-- ����� -->
            <div class='mn3_content'>
                <form enctype="multipart/form-data" method="post" name="upt" id="upt">

                    <div class="bx1 upl">
                        <ul class="men up">
                            <li class="hdr">��������</li>
                            <li class="input"><input name="name" value="<?=torrent('name')?>" class="w100p"/></li>
                            <li class="hdr">�������-����</li>
                            <li><input type="file" name="file" class="w100p"/></li>
                            <li class="hdr">������ �� ������</li>
                            <li class="input">
                                <input name="imgl" value="<?=torrent('imgl')?>" class="w100p"/>
                                <div class="n">������ ������� - 200 ��������. ���������� ������ �� ����� �� <a href="http://forum.kinozal.tv/showthread.php?t=78697">��������� �����������</a>.</div>
                            </li>
                        </ul>
                    </div>


                    <?php if (!$torrent): ?>
                    <div class="bx1 upl">
                        <ul id="tlist">
                            <li class="up_tmplt">��� �������</li>
                        </ul>
                    </div>
                    <?php endif ?>

                    <div class="bx1 upl">
                        <ul>
                            <li class="up_tmplt" title="�� ������ ������������� ����� �������� ���������� � ����� ������">����� ����������</li>
                            <li class="up_tmpl bx1 sbab" id="m0" onmousedown="Upl.changeMode(0);" title="��������� ���� � �����������. �������� ����������� �������������.">������� �����</li>
                            <li class="up_tmpl up_tmpls bx1" id="m1" onmousedown="Upl.changeMode(1);" title="�� ������� �������� ��� ����������? �������� ���������� BB-������ �� ����!">����������� �����</li>
                        </ul>
                    </div>

                    <div class="bx1 upl">
                        <ul class="men up">
                            <li class="fhdr"><div class="sbab up_toggle" onclick="Upl.switchMode(0);">������� �����</div>��������������� ��������</li>
                            <li class="input"><div class="up_fields" id="f1"></div><textarea id="d1" name="desc1" rows="8" class="w100p"><?=torrent('d1')?></textarea></li>
                        </ul>
                    </div>

                    <div class="bx1 upl">
                        <ul class="men up">
                            <li class="fhdr"><div class="sbab up_toggle" onclick="Upl.switchMode(1);">������� �����</div>��������</li>
                            <li class="input"><div class="up_fields" id="f2"></div><textarea id="d2" name="desc2" rows="10" class="w100p"><?=torrent('d2')?></textarea></li>
                        </ul>
                    </div>

                    <div class="bx1 upl">
                        <ul class="men up">
                            <li class="fhdr"><div class="sbab up_toggle" onclick="Upl.switchMode(2);">������� �����</div>����������� ������</li>
                            <li class="input"><div class="up_fields" id="f3"></div><textarea id="d3" name="desc3" rows="8" class="w100p"><?=torrent('d3')?></textarea></li>
                        </ul>
                    </div>

                    <div class="bx1 upl">
                        <ul class="men up">
                            <li class="fhdr"><div class="sbab up_toggle" onclick="Upl.switchMode(3);">������� �����</div>����������, ��������, ����������, ���������</li>
                            <li class="input"><div class="up_fields" id="f4"></div><textarea id="d4" name="desc4" rows="31" class="w100p"><?=torrent('d4')?></textarea></li>
                        </ul>
                    </div>

                    <div class="bx1 upl">
                        <ul class="men up">
                            <li class="hdr">�����-������</li>
                            <li>
                                <select name="rgroup" class="w250" onchange="document.forms['upt'].elements['rbut'].value = this.value == '0' ? '' : ('/pic/groupex/' + this.value + '.gif');">
                                    <option value="0">�������� ����� ������</option>
                                    <?php
                                    $rgroups = db_query_rows('SELECT id, title FROM rgroups ORDER BY id');
                                    echo_options($rgroups, $torrent ? $torrent['rgroup'] : 0);
                                    ?>
                                </select>
                            </li>
                            <li class="hdr">������ �����-������</li>
                            <li class="input">
                                <input name="rbut" class="w100p" value="<?=torrent('rbut')?>">
                                <div class="n">������ �����-������ (88x31) ��� ��� ����� ������ ���� ��� �������, ���������� ������, <a href="http://forum.kinozal.tv/showthread.php?t=78697">������ ���������</a></div>
                            </li>
                        </ul>
                    </div>

                    <div class="bx1 upl">
                        <ul class="men up">
                            <li class="hdr">������</li>
                            <li>
                                <input type="hidden" name="type" id="type" value="0"/>

                                <select class="w250 up_hide" id="type1">
                                    <option value=0>�������� ������</option>
                                    <?php echo_options(db_query_rows('SELECT id, title FROM categories WHERE deleted=0 AND kinozal_section_id=1 ORDER BY position'), torrent('type')); ?>
                                </select>

                                <select class="w250 up_hide" id="type2">
                                    <option value=0>�������� ������</option>
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
                            <li class="hdr">��� �������</li>
                            <li>
                                <select name="ttype" class="w250 styled">
                                    <option value="0">������� �������</option>
                                    <?php
                                    $ttype = $torrent ? $torrent['ttype'] : 0;
                                    ?>
                                    <option value=3 <?php if ($ttype == 3) echo 'selected '; ?>style='color:#c13600'>�������� �������</option>
                                    <option value=2 <?php if ($ttype == 2) echo 'selected '; ?>style='color:#A0A7AD'>���������� �������</option>
                                    <option value=1 <?php if ($ttype == 1) echo 'selected '; ?>style='color:#DCAF35'>������� �������</option>
                                    <option value=4 <?php if ($ttype == 4) echo 'selected '; ?>style='color:#0096c1'>������� �������</option>
                                    <option value=5 <?php if ($ttype == 5) echo 'selected '; ?>style='color:#a83838'>������� ����</option>
                                </select>
                                <a href="http://forum.kinozal.tv/showpost.php?p=2715225" class=sba>������� ��������� ������� � ���������� ������</a>
                            </li>
                        </ul>
                     </div>

                     <div class="bx1" style="padding: 4px;">
                        <input type="button" value="������ �������" onclick="Upl.upload();"/>
                        <!-- <input type="button" value="����� ���������" onclick="Upl.reset();"/> TODO ����� ���������� ��� from-��������� -->
                        <input type="button" value="��������������� ��������" onclick="Upl.test();"/>
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