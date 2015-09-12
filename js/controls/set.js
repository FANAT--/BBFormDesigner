function Set(controls)
{
	this.controls = controls;
	this.items = [];
	this.body = UF.newDiv();
}

Set.prototype.parse = function(bbTag)
{
	// для каждого элемента в bbTag
	//   для каждого контрола в controls
	//     если контрол пропарсил элемент, добавить его в список.
	//     иначе, пропарсить его для AnyText(..)
	//
	var defaultControl = null;
	var parsed = [];
	var indexes = [];
	var i = 0, j, c;
	while (i < bbTag.children.length)
	{
		var item = null;
		for (j = 0; j < this.controls.length; ++j)
		{
			c = this.controls[j];
			if (c.parseAt(bbTag, i))
			{
				item = c;
				if (parsed.indexOf(c) == -1)
				{
					indexes.push(this.items.length);
					parsed.push(c);
				}
				break;
			}
		}
		if (!item) // парсим для AnyText
		{
			if (!defaultControl)
				defaultControl = new AnyText;
			if (defaultControl.parseAt(bbTag, i))
			{
				item = defaultControl;
				defaultControl = null;
			}
		}
		if (item) // элемент обработан
		{
			if (this.items.indexOf(item) == -1)
				this.items.push(item);
		}
		else
			++i;
	}
	
	// восстанавливаем порядок полей
	j = 0;
	var offset = 0;
	for (i = 0; i < this.controls.length; ++i)
	{
		c = this.controls[i];
		if (parsed.indexOf(c) != -1)
		{
			if (this.items[indexes[j] + offset] != c)
				this.items[indexes[j] + offset] = c;
			++j;
		}
		else
		{
			this.items.splice(j != 0 ? (indexes[j - 1] || 0) + 1 + offset : (indexes[j] || 0) + offset, 0, c);
			++offset;
		}
	}
};

Set.prototype.get = function()
{
	for (var i = 0; i < this.items.length; ++i)
		this.body.appendChild(this.items[i].get());
	return this.body;
};

Set.prototype.isEmpty = function()
{
	return this.items.length == 0;
};

Set.prototype.clear = function()
{
	var i = this.items.length;
	while (i != 0)
	{
		if (this.body.lastChild)
			this.body.removeChild(this.body.lastChild);
		this.items[--i].clear();
	}
	this.items.length = 0;
};

Set.prototype.toString = function()
{
	var out = [];
	for (var i = 0; i < this.items.length; ++i)
	{
		var item = this.items[i];
		if (!item.isEmpty())
			out.push(item.toString());
	}
	return out.join('\n');
};
