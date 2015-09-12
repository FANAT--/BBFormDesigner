function BBText(title, tag, valueTitle, textTitle, opt)
{
	this.tag = tag;
	this.opt = opt;
	if (!this.opt)
		this.opt = { };
	if (!this.opt.val)
		this.opt.val = '{v}';
	if (!this.opt.regex)
		this.opt.regex = /.*/;
	
	this.value = UF.newEl('input', 'up');
	this.text = UF.newEl('input', 'up');
	
	// visual
	this.body = UF.newDiv('up_bbtext');
	
	// заголовок
	var dTitle = UF.newDiv('mn up_bbtext_t');
	
	this.check = UF.newEl('input');
	this.check.type = 'checkbox';
	this.check.onclick = function()
	{
		var el = this.parentNode;
		el.title = (this.checked ? '”брать' : 'ƒобавить') + ' блок "' + el.n + '"';
		el = el.parentNode;
		var d = this.checked ? '' : 'none';
		while (el = el.nextSibling)
			el.style.display = d;
	};
	//dTitle.appendChild(this.check);
	
	//var t = UF.newDiv('up_bbtext_title_t');
	//t.appendChild(UF.newText(title));
	//dTitle.appendChild(t);
	var label = UF.newEl('label', 'up_bbtext_title_l');
	label.appendChild(this.check);	
	var span = UF.newEl('span');
	span.appendChild(UF.newText(title));
	label.appendChild(span);
	
	label.n = title;
	
	dTitle.appendChild(label);
	
	this.body.appendChild(dTitle);
	
	// описание
	if (this.opt.desc)
	{
		var dDesc = UF.newDiv('n');
		dDesc.innerHTML = this.opt.desc;
		dDesc.style.display = 'none';
		this.body.appendChild(dDesc);
	}
	
	// заголовки полей
	var cvTitle = UF.newDiv('up_bblist_it');
	var cvD = UF.newDiv('up_bbtext_ival');
	cvD.appendChild(UF.newText(valueTitle));
	cvTitle.appendChild(cvD);
	this.body.appendChild(cvTitle);
	
	var ctTitle = UF.newDiv('up_bblist_it');
	var ctD = UF.newDiv('up_bbtext_itxt');
	ctD.appendChild(UF.newText(textTitle));
	ctTitle.appendChild(ctD);
	this.body.appendChild(ctTitle);
	
	// пол€
	var cVal = UF.newDiv('up_bblist_it');
	var cvD2 = UF.newDiv('up_bbtext_val');
	cvD2.appendChild(this.value);
	cVal.appendChild(cvD2);
	
	var cTxt = UF.newDiv('up_bblist_it');
	var ctD2 = UF.newDiv('up_bbtext_txt');
	ctD2.appendChild(this.text);
	cTxt.appendChild(ctD2);
	
	this.body.appendChild(cVal);
	this.body.appendChild(cTxt);
	
	this.body.appendChild(UF.newDiv('up_clrl'));
	
	cTxt.style.display = cVal.style.display = ctTitle.style.display = cvTitle.style.display = 'none';
}

BBText.prototype.parseAt = function(bbTag, i)
{
	if (this.isParsed)
		return false;
	var bTag = bbTag.children[i];
	if (!(bTag instanceof BBTag) || bTag.tag != this.tag)
		return false;
	
	var text = '';
	for (var j = 0; j < bTag.children.length; ++j)
	{
		var child = bTag.children[j];
		if (child instanceof BBTag)
			return false;
		if (child instanceof Array)
		{
			if (text == '')
				text = arrayTrim(child).join('');
			else
				return false;
		}
	}
	
	this.value.value = this.opt.val.replace('{v}', strTrim(bTag.value));
	this.text.value = text;
	
	// отобразить
	if (!this.check.checked)
	{
		this.check.checked = true;
		this.check.onclick();
	}
	
	bbTag.children.splice(i, 1);
	bbTag.skipEmpty(i);
	return this.isParsed = true;
};

BBText.prototype.parse = function(bbTag)
{
	var i = 0;
	while (i < bbTag.children.length)
	{
		if (this.parseAt(bbTag, i))
			return;
		++i;
	}
};

BBText.prototype.get = function()
{
	if (!this.check.checked)
	{
		this.value.value = this.opt.defVal || '';
		this.text.value = this.opt.defTxt || '';
	}
	return this.body;
};

BBText.prototype.isEmpty = function()
{
	return !this.check.checked || strEmpty(this.value.value) && strEmpty(this.text.value);
};

BBText.prototype.clear = function()
{
	this.value.value = this.text.value = '';
	if (this.check.checked)
	{
		this.check.checked = false;
		this.check.onclick();
	}
	this.isParsed = false;
};

BBText.prototype.toString = function()
{
	if (!this.check.checked) return '';
	var value = strTrim(this.value.value);
	var match = this.opt.regex.exec(value);
	if (match)
		value = match[1];
	return [ '[', this.tag, '=', value, ']', strTrim(this.text.value).replace(',', '.'), '[/', this.tag, ']' ].join('');
};
