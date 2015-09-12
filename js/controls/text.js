function Text(title, opt)
{
	this.title = title;
	this.opt = opt;
	if (!this.opt)
		this.opt = { type: 0, width: '100%' };
	else
	{
		if (!this.opt.type)
			this.opt.type = 0;
		if (!this.opt.width)
			this.opt.width = '100%';
	}
	
	if (this.opt.type == 1)
		this.opt.lines = 8;
	
	if (!this.opt.lines)
		this.input = UF.newEl('input', 'up');
	else
	{
		this.input = UF.newEl('textarea', 'up');
		this.input.rows = this.opt.lines;
	}
	this.input.style.width = this.opt.width;
	
	if (this.opt.id)
		this.input.id = this.opt.id;
		
	// var that = this;
	this.input.onfocus = function()
	{
		if (this.className == 'up def')
		{
			this.value = '';
			this.className = 'up';
		}
	};
}

Text.prototype.parseAt = function(bbTag, i)
{
	if (this.isParsed)
		return false;
	var bTag = bbTag.children[i];
	if (!(bTag instanceof BBTag) || bTag.tag != 'b' || bTag.children.length != 1)
		return false;
	var child = bTag.children[0];
	if (!(child instanceof Array) || arrayTrim(child).join('').toLowerCase() != this.title.toLowerCase())
		return false;
	if (this.opt.type == 1) // многострочный текст, берем все строки после текущего элемента
	{
		var j = i + 1;
		var ts = [];
		while (bbTag.children.length > j)
		{
			child = bbTag.children[j];
			if (child instanceof Array)
			{
				if (j == i + 1)
					BBTag.prototype.trimStart(child);
				ts.push.apply(ts, child);
			}
			else if (child instanceof BBTag)
				ts.push(child.toString());
			else
				ts.push(child);
			++j;
		}
		this.setText(ts.join(''));
		bbTag.children.splice(i, j - i);
		return this.isParsed = true;
	}
	else if (bbTag.children.length > i + 1) // однострочный текст, берем одну строку после текущего элемента
	{
		child = bbTag.children[i + 1];
		if (child instanceof Array)
		{
			if (this.input)
				this.setText(child);
		}
		else if (child instanceof BBTag)
			return false;
		bbTag.children.splice(i, 2);
		bbTag.skipEmpty(i);
		return this.isParsed = true;
	}
	else if (bbTag.children.length == i + 1) // однострочный текст, нет текста
	{
		bbTag.children.splice(i, 1);
		return this.isParsed = true;
	}
	return false;
};

Text.prototype.parse = function(bbTag)
{
	var i = 0;
	while (i < bbTag.children.length)
	{
		if (this.parseAt(bbTag, i))
			return;
		++i;
	}
};

Text.prototype.setText = function(strOrArray)
{
	this.input.value = strOrArray instanceof Array ? arrayTrim(strOrArray).join('') : strOrArray;
	this.input.className = this.input.value == this.opt.def ? 'up def' : 'up';
};

Text.prototype.get = function(el)
{
	if (!el)
		el = 'div';
	var body = UF.newEl(el, 'up_text_b');
	el = el == 'div';
	var title = UF.newDiv();
	if (el)
		title.className = 'up_text_title';
	title.appendChild(UF.newText(this.title));
	body.appendChild(title);
	
	var i = UF.newDiv(el ? 'up_text' : 'up_text_c');
	if (this.opt.type != 2)
		i.appendChild(this.input);
	else
	{
		//i.style.height = '18px';
		i.className = '';
		i.style.marginLeft = '135px';
	}
	
	if (this.opt.desc)
	{
		var d = UF.newDiv('n');
		d.innerHTML = this.opt.desc;
		i.appendChild(d);
	}
	body.appendChild(i);
	return body;
};

Text.prototype.isEmpty = function()
{
	if (this.opt.type == 2)
		return false;
	return strEmpty(this.input.value);
};

Text.prototype.clear = function()
{
	if (this.input)
		this.input.value = '';
	this.isParsed = false;
};

Text.prototype.toString = function()
{
	return (this.opt.type == 2 ? [ '[b]', this.title, '[/b]' ] : [ '[b]', this.title, '[/b] ', this.toItem() ]).join('');
};

Text.prototype.toItem = function()
{
	return strTrim(this.input.value);
};
