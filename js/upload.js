Upl = function()
{
	var _add = 1; // 0 - редактирование, 1 - добавление
	var _mode = 1; // 0 - продвинутый, 1 - обычный
	var _fieldnames = ['predesc','desc','tech','notes']; // имена полей в form
	var _fieldtitles = ['Предварительное описание','Описание','Технические данные','Оформление, вкладки, примечания, скриншоты']; // заголовки полей в form
	var _fieldlimits = [900, 12000, 1200, 16000]; // максимальный размер каждого поля
	var _modes = [1, 1, 1, 1]; // текущие режимы каждого поля (0 - обычный, 1 - расширенный)
	var _template = 0; // выбранный тип раздачи (1 - Видео, 2 - Музыка, 3 - Игра, ... )
	
	function _editMode()	{ _add = 0; }
	
	function _showTemplates()
	{
		var ul = UF.el('tlist');
		for (var i = 0; i < form.length; ++i)
		{
			var li = UF.newEl('li', 'up_tmpl bx1 sbab');
			li.appendChild(UF.newText(form[i].title));
			li.tmpl = i + 1;
			li.onclick = function() { Upl.setTemplate(this.tmpl); };
			ul.appendChild(li);
			form[i].domTitle = li;
		}
		
		if (Torrent.supported()) // добавляем авторасчет размера торрент-файла
			Torrent.setListener(document.forms['upt'].elements['file'], onSizeChanged);
	}

    /**
     * Указывает тип раздачи (Видео, Музыка и т.п.), который нужно отобразить
     * @param t
     * @private
     */
	function _setTemplate(t) // с 1 и выше
	{
        if (t < 1 || t > form.length || t == _template) return;
        var d;
        if (_template != 0)
		{
			form[_template - 1].domTitle.className = 'up_tmpl bx1 sbab';
			//UF.el('t' + _template).className = 'up_tmpl bx1 sbab';
			UF.el('type' + _template).className = 'w250 up_hide';
			for (d = 0; d < _fieldnames.length; ++d)
			{
				if (_modes[d])
					continue;
				var ctrls = form[_template - 1][_fieldnames[d]].simple;

				if (_add) // при заливке просто очищаем поля
					_clear(ctrls);
				else // при редактировании генерируем из полей текст
					UF.el('d' + (d + 1)).value = _toString(ctrls);
				var fields = UF.el('f' + (d + 1));
				while (fields.hasChildNodes())
					fields.removeChild(fields.lastChild);
			}
		}
		_template = t;
		//UF.el('t' + t).className = 'bx1 up_tmpl up_tmpls';
		var dom = form[t - 1].domTitle;
		if (dom)
			dom.className = 'bx1 up_tmpl up_tmpls';
		UF.el('type' + t).className = 'w250';

		for (d = 0; d < _fieldnames.length; ++d)
		{
			if (_add)
				UF.el('d' + (d + 1)).value = form[t - 1][_fieldnames[d]].advanced; // выставляем текст продвинутого режима в текстовое поле
			if (!_modes[d]) // если поле находится в обычном режиме,
				_changemode(d, 0); // формируем поля из продвинутого.
		}
	}

	function _switchMode(d)
	{
		if (!_changemode(d, !_modes[d], 1)) return;
		if (_mode == -1)
		{
			if (_modes[0] && _modes[1] && _modes[2] && _modes[3])
			{
				_mode = 1;
				actModeBtn(1);
			}
			else if (!(_modes[0] || _modes[1] || _modes[2] || _modes[3]))
			{
				_mode = 0;
				actModeBtn(0);
			}
		}
		else if (_mode ^ _modes[d])
		{
			deactModeBtn(_mode);
			_mode = -1;
		}
	}

	function _changemode(d, m, u)
	{
		var controls = form[_template - 1][_fieldnames[d]].simple;
		var fields = UF.el('f' + (d + 1));
		var desc = UF.el('d' + (d + 1));
		
		if (m) // продвинутый
		{
			var text = _toString(controls);
			
			fields.style.display = 'none';
			while (fields.hasChildNodes())
			    fields.removeChild(fields.lastChild);
			
			//desc.rows = rows[d];
			desc.value = text;
			desc.style.display = 'block';
		}
		else // обычный
		{
			var bbTag = bbParse(desc.value);
			_parse(controls, bbTag);
			
			bbTag.skipEmpty(0);
			var hide = strTrim(bbTag.toString());
			
			if (hide && !(u && _skip(hide))) // остался необработанный текст
			{
				_clear(controls);
				return false;
			}
			_build(controls, fields);
			desc.style.display = 'none';
			fields.style.display = 'block';
			
			if (d == 2) // в Техданных обновляем размер
				_setSize();
		}
		_modes[d] = m;
		return true;
	}
	
	function _clear(c)
	{
		if (c instanceof Array)
			for (var i = 0; i < c.length; ++i)
				c[i].clear();
		else
			c.clear();
	}
	
	function _toString(c, noclr)
	{
		var text = [];
		if (c instanceof Array)
			for (var i = 0; i < c.length; ++i)
			{
				var ctrl = c[i];
				if (!ctrl.isEmpty())
					text.push(ctrl.toString());
				if (!noclr)
					ctrl.clear();
			}
		else if (!c.isEmpty())
		{
			text.push(c.toString());
			if (!noclr)
				c.clear();
		}
		return text.join('\n');
	}
	
	function _parse(c, bbTag)
	{
		if (c instanceof Array)
		{
			for (var i = 0; i < c.length; ++i)
				c[i].parse(bbTag);
		}
		else
			c.parse(bbTag);
	}
	
	function _build(c, p)
	{
		if (c instanceof Array)
			for (var i = 0; i < c.length; ++i)
				p.appendChild(c[i].get());
		else
			p.appendChild(c.get());
	}
	
	function _skip(t)
	{
		return confirm('При смене режима пропадет часть оформления:\n\n' + t + '\n\nВы действительно желаете переключиться на обычный режим?');
	}
	
	function _changeMode(m) // 0 - обычный, 1 - расширенный
	{
		if (m == _mode) return;
		if (_mode != -1)
			deactModeBtn(_mode);
		_mode = m;
		actModeBtn(m);
		for (var d = 0; d < 4; ++d)
			if (_modes[d] != _mode)
				_changemode(d, _mode);
	}
	
	function actModeBtn(m) // сделать кнопку активной
	{
		UF.el('m' + m).className = 'bx1 up_tmpl up_tmpls';
	}
	function deactModeBtn(m)
	{
		UF.el('m' + m).className = 'bx1 sbab up_tmpl';
	}
	
	function _reset()
	{
		if (!confirm('Вы действительно желаете сбросить внесенные изменения?')) return;
		document.forms['upt'].reset();
		for (var d = 0; d < _fieldnames.length; ++d)
			if (!_modes[d])
			{
				_clear(form[_template - 1][_fieldnames[d]].simple);
				if (!_changemode(d, 0))
				{
					_modes[d] = 1;
					UF.el('f' + (d + 1)).style.display = 'none';
					UF.el('d' + (d + 1)).style.display = 'block';
				}
			}
	}
	
	function msg(el, msg)
	{
		alert('Ошибка: ' + msg);
		var prev = el.parentNode.previousSibling;
		while (!prev.scrollIntoView)
			prev = prev.previousSibling;
		prev.scrollIntoView();
		el.focus();
		return false;
	}
	
	function char_end(n)
	{
		var r1 = n % 10;
		var r2 = n % 100;
		if (r1 == 1 && r2 != 11) return 'символ';
		if (r1 == 2 && r2 != 12 || r1 == 3 && r2 != 13 || r1 == 4 && r2 != 14) return 'символа';
		return 'символов';
	}
	
	function post(url, tar, torrent, preview)
	{
		var f = document.forms['upt'];
		var name = f.elements['name'];
		name.value = strTrim(name.value);
		
		if (!preview)
		{
			if (strEmpty(name.value)) return msg(name, 'Не указано название раздачи');
			if (name.value.length > 150) return msg(name, 'Название раздачи более 150 символов');
		}
		
		if (torrent)
		{
			var file = f.elements['file'];
			if (strEmpty(file.value)) return msg(file, 'Не указан торрент-файл');
			var i = file.value.lastIndexOf('.');
			if (i == -1 || file.value.substring(i + 1, file.value.length).toLowerCase() != 'torrent') return msg(file, 'Этот файл не торрент-файл');
		}
		
		//if (strEmpty((imgl = f.elements['imgl']).value)) return msg(imgl, 'Не указан постер');
        var d;
		for (d = 0; d < _fieldnames.length; ++d)
			if (!_modes[d])
				UF.el('d' + (d + 1)).value = _toString(form[_template - 1][_fieldnames[d]].simple, 1);
		
		for (d = 0; d < _fieldtitles.length; ++d)
		{
			var desc = f.elements['desc' + (d + 1)];
			if (d != 3 && strEmpty(desc.value))
				return msg(desc, 'Вы не внесли ' + _fieldtitles[d]);
			var overlimit = desc.value.length - _fieldlimits[d];
			if (overlimit > 0)
				return msg(desc, 'Вы на ' + overlimit  + ' ' + char_end(overlimit) + ' превысили допустимый лимит (' +  _fieldlimits[d] + ' символов) у поля «' + _fieldtitles[d] + '»');
		}
		
		//var type = f.elements['type']; //UF.el('type'); // пока уберем UF.el('type' + _template);
		var type = UF.el('type' + _template);
		
		if (!preview && type.value == 0) return msg(type, 'Не выбран раздел');
		
		UF.el('type').value = type.value;
		
		f.action = url;
		f.target = tar;
		f.submit();
	}
	
	function _upload() { post('takeupload.php', '_self', 1, 0); }
	
	function _test() { post('detailstest.php', '_blank', 0, 1); }
	
	function _edit() { post('takeedit.php', '_self', 0, 0); }
	
	var torrentSize;
	function onSizeChanged(size)
	{
		torrentSize = size;
		if (!_modes[2])
			_setSize();
	}
	
	function _setSize()
	{
		if (torrentSize)
		{
			var item = UF.el('size' + _template);
			if (item)
				item.value = torrentSize;
		}
	}
	
	return {
		showTemplates: _showTemplates,
		setTemplate: _setTemplate,
		switchMode: _switchMode,
		build: _build,
		skip: _skip,
		changeMode: _changeMode,
		upload: _upload,
		test: _test,
		edit: _edit,
		editMode: _editMode,
		reset: _reset
	}
}();