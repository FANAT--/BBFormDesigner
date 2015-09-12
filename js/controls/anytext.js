function AnyText()
{
	//this.input = UF.newEl('input', 'up');
	this.title = 'AnyText';
}

AnyText.prototype.parseAt = function(bbTag, i)
{
	if (this.isParsed)
		return false;
	var bTag = bbTag.children[i];
	if (!(bTag instanceof BBTag) || bTag.tag != 'b' || bTag.children.length != 1)
		return false;
	var child = bTag.children[0];
	if (!(child instanceof Array))
		return false;
	this.title = arrayTrim(child).join('');
	if (bbTag.children.length > i + 1) // однострочный текст, берем одну строку после текущего элемента
	{
		child = bbTag.children[i + 1];
		if (child instanceof Array)
		{
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

AnyText.prototype.parse = function(bbTag)
{
	var i = 0;
	while (i < bbTag.children.length)
	{
		if (this.parseAt(bbTag, i))
			return;
		++i;
	}
};

AnyText.prototype.setText = function(textAr)
{
	this.input = UF.newEl(textAr.length > 100 ? 'textarea' : 'input', 'up');
	this.input.value = arrayTrim(textAr).join('');
};

AnyText.prototype.get = function(el)
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
	
	if (this.input)
	{
		var i = UF.newDiv(el ? 'up_text' : 'up_text_c');
		i.appendChild(this.input);
		body.appendChild(i);
	}
	return body;
};

AnyText.prototype.isEmpty = function()
{
	return this.input && strEmpty(this.input.value);
};

AnyText.prototype.clear = function()
{
	if (this.input)
		this.input.value = '';
	this.isParsed = false;
};

AnyText.prototype.toString = function()
{
	return (['[b]', this.title, '[/b] ', this.toItem()]).join('');
};

AnyText.prototype.toItem = function()
{
	return this.input ? strTrim(this.input.value) : '';
};
