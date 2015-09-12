function Combo(title, items, opt)
{
	this.title = title;
	this.items = items;
	this.opt = opt;
	if (!this.opt)
		this.opt = { width: '100%', listwidth: '100%', sep: ',', join: ', ' };
	else
	{
		if (!this.opt.width)
			this.opt.width = '100%';
		if (!this.opt.listwidth)
			this.opt.listwidth = '100%';
		if (!this.opt.sep)
			this.opt.sep = ',';
		if (!this.opt.join)
			this.opt.join = ', ';
	}
	
	this.body = UF.newDiv();

    var titleTag;
    titleTag = UF.newDiv();
	if (!this.opt.incont)
        titleTag.className = 'up_text_title';
    titleTag.appendChild(UF.newText(this.title));
	this.body.appendChild(titleTag);
	
	// if (this.opt.desc)
	// {
		// var d = UF.newDiv('n');
		// d.innerHTML = this.opt.desc;
		// if (!this.opt.incont)
			// d.style.marginLeft = '142px';
		// this.body.appendChild(d);
	// }
	
	if (this.opt.multi)
		for (var i = 0; i < this.items.length; ++i)
			this.items[i] = { t: this.items[i], ch: 0 };
			
	this.addLine();
}

Combo.prototype.parseAt = function(bbTag, i)
{
	if (this.isParsed)
		return false;
	var bTag = bbTag.children[i];
	if (!(bTag instanceof BBTag) || bTag.tag != 'b' || bTag.children.length != 1)
		return false;
	var child;
	child = bTag.children[0];
	if (!(child instanceof Array) || arrayTrim(child).join('').toLowerCase() != this.title.toLowerCase())
		return false;
		
	if (bbTag.children.length > i + 1)
	{
		child = bbTag.children[i + 1];
		if (child instanceof Array)
			this.setText(child);
		else if (child instanceof BBTag)
			return false;
		bbTag.children.splice(i, 2);
		bbTag.skipEmpty(i);
		return this.isParsed = true;
	}
	else if (bbTag.children.length == i + 1)
	{
		bbTag.children.splice(i, 1);
		return this.isParsed = true;
	}
	return false;
};

Combo.prototype.parse = function(bbTag)
{
	var i = 0;
	while (i < bbTag.children.length)
	{
		if (this.parseAt(bbTag, i))
			return;
		++i;
	}
};

Combo.prototype.setText = function(textAr)
{
	var text = arrayTrim(textAr).join('');
	if (this.opt.multi)
	{
		var values = text.split(this.opt.sep);
		var menuItems = this.input.previousSibling.childNodes;
		for (var i = 0, l = values.length; i < l; ++i)
		{
			var value = (values[i] = strTrim(values[i])).toLowerCase();
			var index = -1;
			for (var k = 0, m = this.items.length; k < m; ++k)
				if (this.items[k].t.toLowerCase() == value)
				{
					index = k;
					break;
				}
			if (index != -1)
			{
				menuItems[index].firstChild.checked = true;
				this.items[index].ch = true;
			}
		}
		this.input.value = values.join(this.opt.join);
	}
	else
		this.input.value = text;
};

Combo.prototype.get = function()
{
	return this.body;
};

Combo.prototype.addLine = function()
{
	var i = UF.newDiv(this.opt.incont ? 'up_text_c' : 'up_text');
	
	// фон меню
	var menuback = UF.newDiv('up_menuback');
	menuback.onmousedown = this.close;
	i.appendChild(menuback);
	
	// меню
	var menu = UF.newDiv('up_combo_menu');
	menu.style.width = this.opt.listwidth;
	if (this.opt.noscroll)
		menu.style.maxHeight = '100%';
	
	for (var k = 0; k < this.items.length; ++k)
	{
		var item = UF.newDiv('bx1 up_combo_item');
		if (this.opt.multi)
		{
			item.className += ' up_combo_mitem';
			var ch = UF.newEl('input');
			ch.type = 'checkbox';
			ch.onclick = this.check;
			item.num = k;
			item.onmousedown = this.click;
			item.appendChild(ch);
			var itemTitle = UF.newDiv('up_combo_item_t');
			itemTitle.appendChild(UF.newText(this.items[k].t));
			item.appendChild(itemTitle);
		}
		else
		{
			item.onmousedown = this.select;
			item.appendChild(UF.newText(this.items[k]));
		}
		menu.appendChild(item);
	}
	i.appendChild(menu);
	
	this.input = UF.newEl('input', 'up_combo');
	this.input.style.width = this.opt.width;
	//if (!this.opt.edit)
	//{
	//	this.input.className += '_l';
	//	this.input.readOnly = true;
	//}
	this.input.onfocus = this.open;
	this.input.oninput = function () { this.previousSibling.previousSibling.onmousedown(); };
	i.appendChild(this.input);
	
	if (this.opt.desc)
	{
		var d = UF.newDiv('n');
		d.innerHTML = this.opt.desc;
		//if (!this.opt.incont)
		//	d.style.marginLeft = '142px';
		i.appendChild(d);
	}
	
	//if (this.opt.desc)
	//	this.body.insertBefore(i, this.body.lastChild);
	//else
	this.body.appendChild(i);
	if (this.opt.multi)
		i.control = this;
};

Combo.prototype.open = function()
{
	this.className = 'up_combo up_combo_dd';
	this.previousSibling.style.display = this.previousSibling.previousSibling.style.display = 'block';
};

Combo.prototype.close = function()
{
	this.style.display = this.nextSibling.style.display = 'none';
	this.nextSibling.nextSibling.className = 'up_combo';
};

Combo.prototype.select = function()
{
	var m = this.parentNode.previousSibling;
	m.onmousedown();
	m = this.parentNode.nextSibling;
	//m.focus();
	//m.value = this.firstChild.textContent;
	m.value = this.innerHTML;
};

Combo.prototype.click = function(e)
{
	e = e || window.event;
	if ((e.target || e.srcElement) == this.firstChild)
		return;
	var ch = this.firstChild;
	ch.checked = !ch.checked;
	ch.onclick();
};

Combo.prototype.check = function()
{
	var comboitem = this.parentNode;
	var control = comboitem.parentNode.parentNode.control;
	control.items[comboitem.num].ch = this.checked; // = !ch.checked;
	control.update();
};

Combo.prototype.update = function()
{
	var out = [];
	for (var i = 0; i < this.items.length; ++i)
		if (this.items[i].ch)
			out.push(this.opt.nocap == 1 || out.length == 0 ? this.items[i].t : this.items[i].t.toLowerCase());
	this.input.value = out.join(this.opt.join);
};

Combo.prototype.isEmpty = function()
{
	return strEmpty(this.input.value);
};

Combo.prototype.clear = function()
{
	this.input.value = '';
	this.isParsed = false;
	if (this.opt.multi)
		for (var i = 0; i < this.items.length; ++i)
			this.items[i].ch = false;
};

Combo.prototype.toString = function()
{
	return ([ '[b]', this.title, '[/b] ', this.toItem() ]).join('');
};

Combo.prototype.toItem = function()
{
	return strTrim(this.input.value);
};
