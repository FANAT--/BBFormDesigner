function BBList(title, tag, max, valueTitle, textTitle, opt)
{
	this.title = title;
	this.tag = tag;
	this.max = max;
	this.opt = opt || { };
	if (!this.opt.columns)
		this.opt.columns = 1;
	if (!this.opt.add)
		this.opt.add = 'Добавить';

	this.items = [];
	
	// visual
	this.body = UF.newDiv(this.opt.nosh ? 'up_bblist_nosh' : 'up_bblist');
	//this.body.className = 'bx1';
	
	// заголовок
	var dTitle = UF.newDiv('mn up_bblist_t');
	if (this.opt.toggle)
	{
		var dSwitch = UF.newDiv('sbab up_toggle');
		dSwitch.appendChild(UF.newText('Сменить вид'));
		dSwitch.owner = this;
		dSwitch.onclick = this.toggle;
		dTitle.appendChild(dSwitch);
	}
	dTitle.appendChild(UF.newText(this.title));
	this.body.appendChild(dTitle);
	
	// описание
	if (this.opt.desc)
	{
		var dDesc = UF.newDiv('n');
		dDesc.innerHTML = this.opt.desc;
		this.body.appendChild(dDesc);
	}
	
	// шапка контейнера
	this.cvTitle = UF.newDiv('up_bblist_it');
	this.cvTitle.style.display = 'none';
	var cvD = UF.newDiv('up_bblist_ival');
	cvD.appendChild(UF.newText(valueTitle));
	this.cvTitle.appendChild(cvD);
	this.body.appendChild(this.cvTitle);
	
	this.ctTitle = UF.newDiv('up_bblist_it');
	this.ctTitle.style.display = 'none';
	var ctD = UF.newDiv('up_bblist_itxt');
	ctD.appendChild(UF.newText(textTitle));
	this.ctTitle.appendChild(ctD);
	this.body.appendChild(this.ctTitle);
	
	this.body.appendChild(UF.newDiv('up_clrl'));
	
	// контейнер для элементов
	var cnt = UF.newEl('table', 'up_bblist_cnt');
	this.container = UF.newEl('tbody');
	cnt.appendChild(this.container);
	this.body.appendChild(cnt);
	
	this.add = UF.newDiv('up_bblist_a');
	
	// кнопка Добавить
	var addNew = UF.newEl('span');
	addNew.owner = this;
	addNew.onclick = function() { this.owner.addItem(); };
	addNew.appendChild(UF.newText(this.opt.add));
	this.add.appendChild(addNew);
	
	if (this.opt.adv) // рекомендуемые
		for (var i = 0, l = this.opt.adv.length; i < l; ++i)
		{
			var adv = UF.newEl('span', 'r');
			adv.owner = this;
			adv.onclick = function() { this.style.display = 'none'; this.owner.addItem(this); };
			adv.title = 'Добавить элемент "' + this.opt.adv[i] + '"';
			adv.appendChild(UF.newText(this.opt.adv[i]));
			this.add.appendChild(UF.newText(' '));
			this.add.appendChild(adv);
		}
		
	this.body.appendChild(this.add);
	
	// поле для провиднутого режима
	if (this.opt.toggle)
	{
		this.text = UF.newDiv('up_bblist_inp');
		var taInput = UF.newEl('textarea', 'up');
		taInput.rows = 5;
		this.text.appendChild(taInput);
		this.body.appendChild(this.text);
		
		this.toggleElements = [ this.cvTitle, this.ctTitle, cnt, this.add ];
		this.toggleMode = this.opt.toggleMode || 0;
	}
}

BBList.prototype.parseAt = function(bbTag, i, u)
{
	var item;
	var bTag = bbTag.children[i];
	if (bTag instanceof BBTag && bTag.tag == this.tag)
	{
		item = this.newItem(u);
		item.value.value = strTrim(bTag.value) || '';
		
		var advIndex = this.opt.adv ? this.opt.adv.indexOf(item.value.value) : -1;
		if (advIndex != -1) // это рекомендованный элемент. Скрываем соответствующую ссылку
		{
			item.show = this.add.childNodes[(advIndex + 1) * 2];
			item.show.style.display = 'none';
		}
		
		if (bTag.children.length > 0)
		{
			bTag.skipEmpty(0);
			var child = bTag.children[0];
			if (child instanceof Array)
				item.text.value = arrayTrim(child).join('');
			else if (child instanceof BBTag)
				item.text.value = child.tag == this.opt.innerTag ? child.childrenToString() : child.toString();
		}
		bbTag.children.splice(i, 1);
		bbTag.skipEmpty(i);
		return true;
	}
	else if (bTag instanceof BBTag && bTag.tag == this.opt.innerTag)
	{
		item = this.newItem(u);
		bTag.skipEmpty(0);
		if (bTag.children.length > 0)
			item.text.value = bTag.childrenToString();
		bbTag.children.splice(i, 1);
		bbTag.skipEmpty(i);
		return true;
	}
	return false;
};

BBList.prototype.parse = function(bbTag, noToggle)
{
	var i = 0;
	while (bbTag.children.length > i)
		if (!this.parseAt(bbTag, i, !noToggle))
			++i;
	if (!noToggle && this.toggleMode) // переключаемся на продвинутый вид
		this.toggleToAdvanced();
};

BBList.prototype.parseAll = function(bbTag)
{
	var text = bbTag.childrenToString();
	this.parse(bbTag, true);
	if (strTrim(bbTag.childrenToString()).length != 0)
		this.toggleToAdvanced(text);
	else if (this.items.length != 0)
		this.setTitlesDisplay(true);
};

BBList.prototype.setTitlesDisplay = function(d)
{
	this.ctTitle.style.display = this.cvTitle.style.display = d ? 'block' : 'none';
};

BBList.prototype.addItem = function(dom)
{
	if (this.items.length == this.max)
		return;
	var item = this.newItem(true);
	if (dom)
	{
		item.show = dom;
		item.value.value = dom.innerHTML;
		item.text.focus();
	}
	else
		item.value.focus();
};

BBList.prototype.newItem = function(user)
{
	if (user && this.items.length == 0)
		this.setTitlesDisplay(true);
	var item = this.getItem();
	this.items.push(item);
	this.addDOMItem(item);
	return item;
};

BBList.prototype.getItem = function()
{
	return { value: UF.newEl('input', 'up'), text: UF.newEl('input', 'up') };
};

BBList.prototype.addDOMItem = function(item)
{
	var row = UF.newEl('tr');
	
	var c0 = UF.newEl('td', 'up_bblist_c0');
	row.appendChild(c0);
	
	var span = UF.newEl('span', 'bulet');
	span.appendChild(UF.newText(' '));
	c0.appendChild(span);
	
	var dv = UF.newEl('td', 'up_bblist_val');
	dv.appendChild(item.value);
	row.appendChild(dv);
	
	var dt = UF.newEl('td', 'up_bblist_txt');
	dt.appendChild(item.text);
	row.appendChild(dt);
	
	var c1 = UF.newEl('td', 'up_bblist_c1');
	var dDel = UF.newDiv('up_bblist_del');
	dDel.onclick = this.removeItem;
	dDel.owner = this;
	dDel.item = item;
	c1.appendChild(dDel);
	row.appendChild(c1);
	
	this.container.appendChild(row);
	
	if (this.items.length == this.max)
		this.add.style.display = 'none';
};

BBList.prototype.get = function()
{
	return this.body;
};

BBList.prototype.toggle = function()
{
	if (this.owner.toggleMode)
		this.owner.toggleToSimple();
	else
		this.owner.toggleToAdvanced();
};

BBList.prototype.toggleToSimple = function()
{
	this.toggleMode = 0;
	var bTag = bbParse(this.text.firstChild.value);
	this.parse(bTag, true);
	bTag.skipEmpty(0);
	var hide = strTrim(bTag.toString());
	if (hide && !Upl.skip(hide))
	{
		this.innerClear();
		this.toggleMode = 1;
		return;
	}
	this.text.style.display = 'none';
	this.text.firstChild.value = '';
	
	for (var i = 0; i < this.toggleElements.length; ++i)
		this.toggleElements[i].style.display = 'block';
	this.add.style.display = this.items.length < this.max ? 'block' : 'none';
	
	if (this.items.length == 0)
		this.setTitlesDisplay(false);
};

BBList.prototype.toggleToAdvanced = function(text)
{
	var ta = this.text.firstChild;
	ta.value = text || this.toString(false);
	ta.rows = Math.max(this.items.length, 5);
	this.innerClear();
	
	for (var i = 0; i < this.toggleElements.length; ++i)
		this.toggleElements[i].style.display = 'none';
	
	this.text.style.display = 'block';
	this.toggleMode = 1;
};

BBList.prototype.removeItem = function()
{
	var c = this.owner;
	var items = c.items;
	if (items.length == c.max)
		c.add.style.display = '';
	
	//var index = 0;
	//while (items[index] != this.item)
	//	++index;
	items.splice(items.indexOf(this.item), 1);
	if (c.items.length == 0)
		c.setTitlesDisplay(false);
	if (this.item.show)
	{
		this.item.show.style.display = '';
		this.item.show = undefined;
	}
	var tr = this.parentNode.parentNode;
	tr.parentNode.removeChild(tr);
};


BBList.prototype.isEmpty = function()
{
	if (this.toggleMode)
		return strEmpty(this.text.firstChild.value);
	else
		return this.items.length == 0;
};

BBList.prototype.clear = function()
{
	this.innerClear();
	if (this.toggleMode)
	{
		this.text.style.display = 'none';
		this.text.firstChild.value = '';
		for (var i = 0; i < this.toggleElements.length; ++i)
			this.toggleElements[i].style.display = 'block';
		this.toggleMode = this.opt.toggleMode || 0;
	}
};

BBList.prototype.innerClear = function()
{
	var len = this.items.length;
	while (len != 0)
	{
		var item = this.items[--len];
		if (item.show)
		{
			item.show.style.display = '';
			item.show = undefined;
		}
	}
	this.items.length = 0;
	this.setTitlesDisplay(false);
	len = this.container.childNodes.length;
	while (len != 0)
		this.container.removeChild(this.container.childNodes[--len]);
	if (!this.toggleMode)
		this.add.style.display = '';
};

BBList.prototype.toString = function(fromText)
{
    var text;
	if (fromText == undefined)
		fromText = this.toggleMode;
	if (fromText) // пытаемся переключиться на обычный режим, чтобы отформатировать текст
	{
		//alert('пытаемся переключиться на обычный режим, чтобы отформатировать текст');
		text = this.text.firstChild.value;
		var bTag = bbParse(text);
		this.parse(bTag, true);
		bTag.skipEmpty(0);
		if (strTrim(bTag.toString()).length != 0)
			return text;
	}
	
	//alert('собираем из items: ' + this.items.length);

	var out = [];
	var inner = [];
	var column = 0;
	for (var i = 0; i < this.items.length; i++)
	{
		var item = this.items[i];
		var value = strTrim(item.value.value);
		text = strTrim(item.text.value);
		if (value || text)
		{
			var innerItem = [];
			if (value || !this.opt.innerTag)
				innerItem.push('[', this.tag, '=', value, ']');
			if (this.opt.innerTag)
				innerItem.push('[', this.opt.innerTag, ']');
			innerItem.push(text);
			if (this.opt.innerTag)
				innerItem.push('[/', this.opt.innerTag, ']');
			if (value || !this.opt.innerTag)
				innerItem.push('[/', this.tag, ']');
			inner.push(innerItem.join(''));
			++column;
			if (column == this.opt.columns)
			{
				column = 0;
				out.push(inner.join(' '));
				inner.length = 0;
			}
		}
	}
	if (inner.length > 0)
		out.push(inner.join(' '));
	
	if (this.toggleMode)
		this.innerClear();
		
	return out.join('\n');
};
