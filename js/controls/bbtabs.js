function BBTabs(title, opt, types, fixed)
{
	this.opt = opt || {};
	this.tag = this.opt.tag || 'pagesd';
	this.max = this.opt.max || 10;
	this.defTab = this.opt.defTab || 'ѕримечани€';
	this.types = types;
	this.fixed = fixed;
	
	this.items = []; // TODO: не добавл€ть в items фиксированные вкладки
	
	// visual
	this.body = UF.newDiv('up_bbtabs_body');
	
	// заголовок
	var dTitle = UF.newDiv('mn up_bblist_t');
	dTitle.appendChild(UF.newText(title));
	this.body.appendChild(dTitle);
	
	// описание
	if (this.opt.desc)
	{
		var dDesc = UF.newDiv('n');
		dDesc.innerHTML = this.opt.desc;
		this.body.appendChild(dDesc);
	}
	
	// заголовки вкладок
	this.tabs = UF.newEl('ul', 'up_bbtabs_tabs');
	this.tabs.owner = this;
	this.body.appendChild(this.tabs);
	
	// кнопка добавлени€ вкладки
	
	var addTab = UF.newEl('li', 'up_bbtabs_add');
	var plus = UF.newDiv('up_bbtabs_plus');
	plus.title = 'ƒобавить новую вкладку...';
	plus.onmousedown = function() // открытие меню
	{
		this.parentNode.className = 'mn up_bbtabs_add';
		this.nextSibling.nextSibling.style.display = this.nextSibling.style.display = 'block';
	};
	addTab.appendChild(plus);
	
	var menuback = UF.newDiv('up_menuback');
	menuback.onmousedown = function() // закрытие меню
	{
		this.parentNode.className = 'up_bbtabs_add';
		this.nextSibling.style.display = this.style.display = 'none';
	};
	addTab.appendChild(menuback);
	
	var menu = UF.newDiv('mn up_bbtabs_menu');
	var i, t;
	if (this.types)
		for (i = 0; i < this.types.length; ++i)
		{
			t = this.types[i];
			menu.appendChild(this.getMenuItem(t));
		}
	if (this.fixed)
		for (i = 0; i < this.fixed.length; ++i)
		{
			t = this.fixed[i];
			// добавл€ем фиксированную вкладку
			var item = { type: t };
			if (t.control)
			{
				item.title = { value: t.title };
				// item.content = this.getItemContent(item);
			}
			else
			{
				item.title = this.getItemTitle(t.title);
				item.text = this.getItemText(t.text);
			}
			var tab = this.getTab(item, true);
			this.tabs.appendChild(tab);
			
			var menuitem = this.getMenuItem(t, true);
			menuitem.tab = tab;
			menu.appendChild(menuitem);
		}
	menu.appendChild(this.getMenuItem(null));
	addTab.appendChild(menu);
	this.tabs.appendChild(addTab);
	
	// содержимое вкладок
	this.container = UF.newDiv('bx1 up_bbtabs_c');
	this.container.style.display = 'none'; // вне стил€
	this.body.appendChild(this.container);
	
	this.body.appendChild(UF.newDiv('up_clrl'));
	
	this.tabs.before = this.tabs.firstChild;
}

BBTabs.prototype.parseAt = function(bbTag, i, begin)
{
	var bTag = bbTag.children[i];
	if (bTag instanceof BBTag && bTag.tag == this.tag)
	{
		this.parseTab(bTag, begin);
		bbTag.children.splice(i, 1);
		bbTag.skipEmpty(i);
		return true;
	}
	return false;
};

BBTabs.prototype.parse = function(bbTag)
{
	var i = 0;
	while (bbTag.children.length > i)
		if (!this.parseAt(bbTag, i))
			++i;
	bbTag.skipEmpty(0);
	if (bbTag.children.length != 0) // если осталс€ необработанный текст, добавл€ем его в ѕримечани€
	{
		var newTag = new BBTag();
		newTag.tag = this.tag;
		newTag.value = this.defTab;
		newTag.children = bbTag.children;
		bbTag.children = [ newTag ];
		this.parseAt(bbTag, 0, true);
	}
	
	// выдел€ем первую вкладку
	if (this.items.length != 0)
		this.tabs.firstChild.sel();
};

BBTabs.prototype.parseTab = function(bTag, begin) // bTag - содержимое между [pagesd]..[/pagesd], begin - добавл€ть ли вкладку в начало
{
	bTag.skipEmpty(0);
	var c = bTag.children.length;
	while (c != 0 && bTag.children[c - 1] == '\n') { --c; }
	bTag.children.length = c;

	var item;
	
	var type = this.search(bTag, this.types) || this.search(bTag, this.fixed);
	if (type)
	{
		if (type.menuitem.tab) // фиксированна€
			item = type.menuitem.tab.item;
		else
			item = { type: type, title: type.control ? { value: type.title } : this.getItemTitle(type.title) };
	}
	else
		item = {};
		
	if (item.type)
		item.type.menuitem.style.display = 'none';
		
	if (!item.type || !item.type.control) // простой текст
	{
		if (!item.title)
			item.title = this.getItemTitle(bTag.value);
		item.text = this.getItemText(bTag.childrenToString());
	}
	else  // типизированна€ вкладка
	{
		item.type.control.parseAll(bTag);
		
		//for (var i = 0; i < item.type.controls.length; ++i)
		//	item.type.controls[i].parse(bTag);
		item.content = this.getItemContent(item);
	}
	
	if (begin)
		this.items.unshift(item);
	else
		this.items.push(item);
	
	if (type && type.menuitem.tab)
		type.menuitem.tab.style.display = 'block';
	else if (begin)
		this.tabs.insertBefore(this.getTab(item), this.tabs.firstChild);
	else
		this.tabs.insertBefore(this.getTab(item), this.tabs.before);
		
	if (this.items.length == this.max)
		this.tabs.lastChild.style.display = 'none';
};

BBTabs.prototype.search = function(bTag, types)
{
	if (!types)
		return null;
	var val = bTag.value.toLowerCase();
	for (var i = 0; i < types.length; ++i)
		if (types[i].title.toLowerCase() == val)
			return types[i];
	return null;
};

BBTabs.prototype.getItemTitle = function(text)
{
	var title = UF.newEl('input', 'up');
	title.value = strTrim(text);
	title.maxLength = 50;
	//title.onmouseup = title.focus;
	return title;
};

BBTabs.prototype.getItemText = function(text)
{
	var c = UF.newDiv('up_bbtabs_ctxt');
	var txt = UF.newEl('textarea', 'up_bbtabs_txt');
	txt.rows = 12;
	if (text)
		txt.value = strTrim(text);
	c.appendChild(txt);
	return c;
};

BBTabs.prototype.getItemContent = function(item, setText)
{
	var content = UF.newDiv('up_bbtabs_cc');
	var control = item.type.control;
	if (setText && item.type.text)
	{
		var bbTag = bbParse(item.type.text);
		control.parse(bbTag);
		//for (var i = 0, count = controls.length; i < count; ++i)
		//	controls[i].parse(bbTag);
	}
	content.appendChild(control.get());
	//for (var i = 0, count = controls.length; i < count; ++i)
	//	content.appendChild(controls[i].get());
	return content;
};

BBTabs.prototype.get = function()
{
	return this.body;
};

BBTabs.prototype.getMenuItem = function(type, fixed)
{
	var menuitem = UF.newDiv(type ? 'mn2 up_bbtabs_mi t' : 'up_bbtabs_mi');
	menuitem.owner = this;
	menuitem.type = type;
	menuitem.appendChild(UF.newText(type ? type.title : 'Ќова€ вкладка...'));
	menuitem.onmousedown = fixed ? this.addFixedTab : this.addTab;
	if (type)
		type.menuitem = menuitem;
	return menuitem;
};

BBTabs.prototype.switchTab = function()
{
	var tab = this.parentNode;
	var tabs = tab.parentNode;
	var oldTab = tabs.tab;
	if (oldTab == tab)
		return;
		
	if (oldTab)
		oldTab.setInactive();
		
	tabs.tab = tab;
	tab.setActive();
	
	var cont = tabs.owner.container;
	if (cont.firstChild)
		cont.removeChild(cont.firstChild);
	var c = tab.item.text || tab.item.content;
	if (!c)
		c = tab.item.content = tabs.owner.getItemContent(tab.item, true);
	cont.appendChild(c);
	if (cont.style.display == 'none')
		cont.style.display = 'block';
};

BBTabs.prototype.addTab = function()
{
	this.parentNode.parentNode.childNodes[1].onmousedown();

	// добавить новый элемент в items
	var item = {};
	if (this.type)
	{
		item.type = this.type;
		if (this.type.control)
		{
			item.title = { value: this.type.title };
			item.content = this.owner.getItemContent(item, true);
		}
		else
		{
			item.title = this.owner.getItemTitle(this.type.title);
			item.text = this.owner.getItemText(this.type.text);
		}
	}
	else
	{
		item.title = this.owner.getItemTitle('');
		item.text = this.owner.getItemText('');
	}
	// добавить в конец, но перед фиксированными элементами
	var items = this.owner.items;
	var insertTo = items.length;
	while (insertTo != 0)
	{
		var lastItem = items[insertTo - 1];
		if (lastItem.type && lastItem.type.menuitem.tab)
			--insertTo;
		else
			break;
	}
	this.owner.items.splice(insertTo, 0, item);
	//this.owner.items.push(item);
	
	// добавить новую вкладку
	var tab = this.owner.getTab(item);
	var tabs = this.parentNode.parentNode.parentNode;
	tabs.insertBefore(tab, tabs.before);
	
	// переключитьс€ на нее
	tab.sel();
	
	// скрыть элемент из меню
	if (this.type)
		this.style.display = 'none';
	
	if (this.owner.items.length == this.owner.max)
		tabs.lastChild.style.display = 'none';
};

BBTabs.prototype.addFixedTab = function()
{
	this.parentNode.parentNode.childNodes[1].onmousedown();

	// добавить новый элемент в items
	var item = this.tab.item;
	this.owner.items.push(item);
	
	// сбросить контент, чтобы он перестроилс€
	item.content = null;
	
	// показать вкладку
	this.tab.style.display = 'block';
	
	// переключитьс€ на нее
	this.tab.sel();
	
	// скрыть элемент из меню
	this.style.display = 'none';
	
	if (this.owner.items.length == this.owner.max)
		this.tab.parentNode.lastChild.style.display = 'none';
};

BBTabs.prototype.deleteTab = function()
{
	var item = this.parentNode.item;
	
	var tab = this.parentNode;
	var tabs = tab.parentNode;
	
	var activeTab = tab.nextSibling;
	while (activeTab && !(activeTab.item && activeTab.style.display != 'none'))
		activeTab = activeTab.nextSibling;
	if (!activeTab)
		activeTab = tab.previousSibling;
	while (activeTab && !(activeTab.item && activeTab.style.display != 'none'))
		activeTab = activeTab.previousSibling;
	
	if (activeTab) // переключаемс€ на нее
		activeTab.sel();
	else
	{
		tab.setInactive();
		tabs.tab = null;
	}
	
	if (tab.move)
		tabs.removeChild(tab);
	else
		tab.style.display = 'none';
	
	// добавить элемент меню (при необходимости) и удалить из items
	if (item.type)
	{
		if (item.type.control)
			item.type.control.clear();
			//for (var i = 0; i < item.type.controls.length; ++i)
			//	item.type.controls[i].clear();
		item.type.menuitem.style.display = 'block';
	}
	
	this.owner.items.splice(this.owner.items.indexOf(item), 1);
	
	if (this.owner.items.length == this.owner.max - 1)
		tabs.lastChild.style.display = 'block';
	if (this.owner.items.length == 0)
		this.owner.container.style.display = 'none';
	if (tab.move)
		this.owner = null;
};

BBTabs.prototype.getTab = function(item, fixed)
{
	var tab = UF.newEl('li', 'up_bbtabs_tab');
	tab.item = item;
	
	if (!fixed)
	{
		// стрелка влево
		var left = UF.newDiv('up_bbtabs_left');
		left.style.display = 'none';
		left.onclick = this.moveLeft;
		left.title = 'ѕереместить левее';
		tab.appendChild(left);
	}
	
	// заголовок вкладки
	var title = UF.newDiv('up_bbtabs_tabtitle');
	this.setTabTitleText(title, item.title.value);
	title.onmousedown = this.switchTab;
	tab.appendChild(title);
	// кнопка удалени€
	var del = UF.newDiv('up_bbtabs_del');
	del.title = '”далить вкладку';
	del.onclick = this.deleteTab;
	del.owner = this;
	del.style.display = 'none';
	tab.appendChild(del);
	
	if (!fixed)
	{
		// стрелка вправо
		var right = UF.newDiv('up_bbtabs_right');
		right.style.display = 'none';
		right.onclick = this.moveRight;
		right.title = 'ѕереместить правее';
		tab.appendChild(right);
		
		tab.move = true;
		/*
		tab.draggable = true;
		tab.dropzone = 'move';
		tab.ondragstart = function(e)
		{
			if (this.parentNode.tab != this) return false;
			e = e || window.event;
			e.dataTransfer.setData('Text', '');
			e.dataTransfer.effectAllowed = 'move';
		};
		tab.ondragover = function(e)
		{
			var tabs = this.parentNode;
			var activeTab = tabs.tab;
			if (activeTab == this) return false;
			e = e || window.event;
			e.preventDefault ? e.preventDefault() : e.returnValue = false;
			
			var offsetX = event.pageX - this.offsetLeft;
			
			if (offsetX > this.clientWidth / 2) // над правой половиной
			{
				if (this.nextSibling != activeTab)
				{
					tabs.removeChild(activeTab);
					tabs.insertBefore(activeTab, this.nextSibling);
					
					var items = tabs.owner.items;
					var itemIndex = items.indexOf(activeTab.item);
					items.splice(itemIndex, 1);
					itemIndex = items.indexOf(this.item);
					items.splice(itemIndex + 1, 0, activeTab.item);
				}
			}
			else // над левой половиной
			{
				if (this.previousSibling != activeTab)
				{
					tabs.removeChild(activeTab);
					tabs.insertBefore(activeTab, this);
					
					var items = tabs.owner.items;
					var itemIndex = items.indexOf(activeTab.item);
					items.splice(itemIndex, 1);
					itemIndex = items.indexOf(this.item);
					items.splice(itemIndex, 0, activeTab.item);
				}
			}
		};
		*/
	}
	
	if (fixed)
		tab.style.display = 'none';
	
	tab.sel = fixed ? function() { this.firstChild.onmousedown(); } : function() { this.childNodes[1].onmousedown(); };
	
	tab.setActive = this.setActive;
	tab.setInactive = this.setInactive;
	
	
	return tab;
};

BBTabs.prototype.moveLeft = function()
{
	var tab = this.parentNode;
	var before = tab.previousSibling;
	if (!before)
		return;
	var tabs = tab.parentNode;
	tabs.removeChild(tab);
	tabs.insertBefore(tab, before);
	
	var items = tabs.owner.items;
	var itemIndex = items.indexOf(tab.item);
	items.splice(itemIndex, 1);
	items.splice(itemIndex - 1, 0, tab.item);
};

BBTabs.prototype.moveRight = function()
{
	var tab = this.parentNode;
	if (!tab.nextSibling.move)
		return;
	var before = tab.nextSibling.nextSibling;
	var tabs = tab.parentNode;
	tabs.removeChild(tab);
	tabs.insertBefore(tab, before);
	
	var items = tabs.owner.items;
	var itemIndex = items.indexOf(tab.item);
	items.splice(itemIndex, 1);
	items.splice(itemIndex + 1, 0, tab.item);
};

BBTabs.prototype.setActive = function()
{
	this.className = 'mn up_bbtabs_tab';

	var tBox = this.item.title;
	var divTitle = this.move ? this.childNodes[1] : this.firstChild;
	if (tBox.tagName == 'INPUT')
	{
		tBox.style.width = Math.max(divTitle.clientWidth + 10, 80) + 'px';
		divTitle.removeChild(divTitle.firstChild);
		divTitle.style.padding = '0px';
		divTitle.appendChild(tBox);
		//tBox.focus();
	}
	// показываем стрелки и кнопку удалени€
	this.lastChild.style.display = 'block';
	if (this.move)
		this.firstChild.style.display = this.childNodes[2].style.display = 'block';
};

BBTabs.prototype.setInactive = function()
{
	this.className = 'up_bbtabs_tab';
	
	var divTitle = this.move ? this.childNodes[1] : this.firstChild;
	if (divTitle.firstChild.tagName == 'INPUT')
	{
		var text = divTitle.firstChild.value;
		divTitle.removeChild(divTitle.firstChild);
		this.parentNode.owner.setTabTitleText(divTitle, text);
	}
	// скрываем стрелки и кнопку удалени€
	this.lastChild.style.display = 'none';
	if (this.move)
		this.firstChild.style.display = this.childNodes[2].style.display = 'none';
};

BBTabs.prototype.setTabTitleText = function(title, text)
{
	title.style.padding = '2px';
	title.appendChild(UF.newText(text || '[Ѕез заголовка]'));
};

BBTabs.prototype.isEmpty = function()
{
	return this.items.length == 0;
};

BBTabs.prototype.clear = function()
{
	this.clearTypes(this.types);
	if (this.fixed)
		this.clearTypes(this.fixed);

	while (this.tabs.firstChild.move)
		this.tabs.removeChild(this.tabs.firstChild);
	
	var fixedTab = this.tabs.firstChild;
	while (fixedTab.nextSibling)
	{
		fixedTab.style.display = 'none';
		fixedTab.setInactive();
		fixedTab = fixedTab.nextSibling;		
	}
	this.items.length = 0;
	var menuitems = this.tabs.lastChild.lastChild.childNodes;
	for (var i = 0, count = menuitems.length - 1; i < count; ++i)
	{
		var style = menuitems[i].style;
		if (style.display == 'none')
			style.display = 'block';
	}
	this.tabs.tab = null;
	if (this.container.hasChildNodes())
		this.container.removeChild(this.container.firstChild);
};

BBTabs.prototype.clearTypes = function(types)
{
	var count = types.length;
	while (count != 0)
	{
		var control = types[--count].control;
		if (control)
			control.clear();
		/*{
			var c = controls.length;
			while (c != 0)
				controls[--c].clear();
		}*/		
	}
};

BBTabs.prototype.toString = function()
{
	var out = [], i;
	for (i = 0; i < this.items.length; ++i)
	{
		var item = this.items[i];
		if (item.type && item.type.menuitem.tab)
			continue;
		this.pushToOut(out, item);
	}
	if (this.fixed)
		for (i = 0; i < this.fixed.length; ++i)
		{
			var tab = this.fixed[i].menuitem.tab;
			if (tab.style.display != 'none')
				this.pushToOut(out, tab.item);
		}
	return out.join('\n');
};

BBTabs.prototype.pushToOut = function(out, item)
{
	if (item.title.value)
	{
		var content = this.itemToString(item);
		var manyRows = content.indexOf('\n') != -1;
		var res = ['\n[', this.tag, '=', strTrim(item.title.value), ']'];
		if (manyRows)
			res.push('\n');
		res.push(content);
		if (manyRows)
			res.push('\n');
		res.push('[/', this.tag, ']');
		out.push(res.join(''));
	}
};

BBTabs.prototype.itemToString = function(item)
{
	if (item.text)
		return strTrim(item.text.firstChild.value);
	
	if (item.type.control.isEmpty())
		return '';
	else
		return item.type.control.toString();
		
	//for (var i = 0; i < item.type.controls.length; i++)
	//	if (!item.type.controls[i].isEmpty())
	//		text.push(item.type.controls[i].toString());
	//return text.join('\n');
};
