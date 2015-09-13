/*
	BB-движок
*/

function bbParse(text)
{
	var bbTag = new BBTag();
	bbTag.parse(null, text.split(''), 0);
	return bbTag;
}

function BBTag(tagArray, valueArray)
{
	this.children = [];
    // дочерние элементы могут быть трех типов:
    // 1) массив символов - строка текста, без переносов
    // 2) символ '\n' - пуста€ строка (можно было хранить пустой массив, но это дл€ оптимизации. —омнительно, кстати говор€.)
    // 3) объект BBTag

	if (tagArray)
    {
        //this.trimEnd(tag);
        this.openTag = tagArray.join(''); // оригинальное написание тега
        this.tag = arrayTrim(tagArray).join('').toLowerCase(); // без пробелов, в нижнем регистре, дл€ идентификации
    }
	if (valueArray)
	{
		//this.trimEnd(value);
		this.value = valueArray.join('');
	}
}

/**
 * ќбработка текста с ЅЅ-тегами
 * @param parent родительский тег
 * @param chars исходный текст в виде массива символов
 * @param index индекс, с которого начинаем обработку
 * @returns int индекс, на котором закончили обработку
 */
BBTag.prototype.parse = function (parent, chars, index)
{
	this.parent = parent;
	var state = 0; // 0 - читаем текст, 1 - считали начало тега [, 2 - считали начало закрытого тега /, 3 - считали =
	var tag = [];
	var value = [];
	var str = [];
    var bbTag;
	//var breakIndex = index;
	while (index < chars.length)
	{
		var ch = chars[index];
		if (ch != '\r')
			switch (state)
			{
				case 0:
					if (ch == '[')
					{
						if (str.length != 0)
						{
							this.pushChild(str);
							str = [];
						}
						state = 1;
						//breakIndex = index;
					}
					else if (ch == '\n')
					{
						if (str.length != 0)
						{
							this.pushChild(str);
							str = [];
						}
						this.pushN();
					}
					else
						this.pushChar(str, ch);
					break;
				case 1:
					if (ch == '\n')
					{
						str.push('[');
						this.pushChars(str, tag);
						tag = [];
						state = 0;
					}
					else if (ch == '[')
					{
						str.push('[');
						this.pushChars(str, tag);
						tag = [];
					}
					else if (ch == ']')
					{
						if (tag.length != 0)
						{
							bbTag = new BBTag(tag, null);
							index = bbTag.parse(this, chars, index + 1);
							if (this.closed)
								return index;
							//breakIndex = index + 1;
						}
						else
							str.push('[', ']');
						state = 0;
						tag = [];
					}
					else if (ch == '=')
					{
						if (tag.length != 0)
							state = 3;
						else
						{
							str.push('[', '=');
							state = 0;
						}
					}
					else if (tag.length == 0 && ch == '/')
						state = 2;
					else //if (ch != ' ')
						this.pushChar(tag, ch);
					break;
				case 2:
					if (ch == '\n')
					{
						str.push('[', '/');
						this.pushChars(str, tag);
						tag = [];
						state = 0;
					}
					else if (ch == '[')
					{
						str.push('[', '/');
						this.pushChars(str, tag);
						tag = [];
						state = 1;
					}
					else if (ch == ']' && tag.length != 0)
					{
						var closedBB = this.tryClose(arrayTrim(tag).join('').toLowerCase());
						if (closedBB)
						{
							if (str.length != 0)
								this.pushChild(str);
							var cl = this;
							while (cl != closedBB)
							{
								cl.closed = true;
								cl.parent.pushBad(cl);
								cl = cl.parent;
							}
							closedBB.parent.children.push(closedBB);
							closedBB.closed = true;
							closedBB.closeTag = tag.join('');
							return index;
						}
						//alert(tag.join('') + ' unable to close');
						tag.unshift('/');
						tag.unshift('[');
						tag.push(']');
						this.pushChars(str, tag);
						
						//var len = this.children.length;
						//var last;
						//if (len != 0 && (last = this.children[len - 1]) instanceof Array)
						//	this.pushChars(last, tag);
						//else
						//	this.children.push(tag);
						//alert(this.tag + '.children add ' + '[/' + tag.join('') + ']');
						tag.length = 0;
						state = 0;
					}
					else //if (ch != ' ')
						this.pushChar(tag, ch);
					break;
				case 3:
					if (ch == '\n')
					{
						str.push('[');
						this.pushChars(str, tag);
						tag = [];
						str.push('=');
						this.pushChars(str, value);
						value = [];
						state = 0;
					}
					else if (ch == '[')
					{
						str.push('[');
						this.pushChars(str, tag);
						tag = [];
						str.push('=');
						this.pushChars(str, value);
						value = [];
						state = 1;
					}
					else if (ch == ']')
					{
						bbTag = new BBTag(tag, value);
						index = bbTag.parse(this, chars, index + 1);
						if (this.closed)
							return index;
						//breakIndex = index + 1;
						state = 0;
						tag = [];
						value = [];
					}
					else
						this.pushChar(value, ch);
					break;
			}
		++index;
	}
	
	//return index;
	
	if (this.closed)
		return index;
	//alert('unclosed ' + this.tag);
	
	if (state == 1)
	{
		str.push('[');
		this.pushChars(str, tag);
	}
	else if (state == 2)
	{
		str.push('[', '/');
		this.pushChars(str, tag);
	}
	else if (state == 3)
	{
		str.push('[');
		this.pushChars(str, tag);
		str.push('=');
		this.pushChars(str, value);
	}
	if (str.length != 0)
		this.pushChild(str);
	
	if (this.tag)
		parent.pushBad(this);
};

BBTag.prototype.tryClose = function(tag) // tag - строка в нижнем регистре без пробелов в начале и в конце
{
	// если закрывающий тег соответствует нашему, просто закрываем
    // иначе пытаемс€ закрыть родител€
	if (this.tag == tag)
		return this;
	if (this.parent)
		return this.parent.tryClose(tag);
	return false;
};

/**
 * ƒописывает незакрытый тег как дочерний элемент
 * @param bbTag
 */
BBTag.prototype.pushBad = function(bbTag)
{
	var bb = [ '[', bbTag.openTag ];
	if (bbTag.value != null)
		bb.push('=', bbTag.value);
	bb.push(']');
	bb = bb.join('').split('');
	this.pushChild(bb);
	for (var i = 0; i < bbTag.children.length; ++i)
	{
		var child = bbTag.children[i];
		if (child instanceof Array)
			this.pushChild(child);
		else if (child == '\n')
			this.pushN();
		else
			this.children.push(child);
	}
};

/**
 * ƒобавл€ет символ в массив
 * @param textArray
 * @param char
 */
BBTag.prototype.pushChar = function(textArray, char)
{
	if (isSpace(char))
	{
		//if (ar.length == 0) // не добавл€ем пробел вначале
		//	return;
		if (textArray.length != 0 && isSpace(textArray[textArray.length - 1])) // не добавл€ем пробел после пробела
			return;
	}
	textArray.push(char);
};

/**
 * ƒобавл€ет элементы второго массива в первый массив
 * @param textArray1
 * @param textArray2
 */
BBTag.prototype.pushChars = function(textArray1, textArray2)
{
	textArray1.push.apply(textArray1, textArray2);
};

/**
 * ƒобавл€ет массив символов (строка без переносов) как дочерний элемент
 * @param textArray
 */
BBTag.prototype.pushChild = function(textArray)
{
	var len = this.children.length;
	if (len != 0)
	{
		var last = this.children[len - 1];
		if (last instanceof Array) // последний дочерний элемент - массив символов, так что дописываем к нему
		{
			this.pushChars(last, textArray);
			return;
		}
		if (last == '\n')
			this.trimStart(textArray);
	}
	if (textArray.length != 0)
		this.children.push(textArray);
};

/**
 * ƒобавл€ет \n как дочерний элемент (пуста€ строка)
 */
BBTag.prototype.pushN = function()
{
	var len = this.children.length;
	if (len != 0)
	{
		var last = this.children[len - 1];
		if (last instanceof Array)
			this.trimEnd(last);
		if (last.length == 0)
		{
			this.children[len - 1] = '\n';
			return;
		}
	}
	this.children.push('\n');
};

BBTag.prototype.trimStart = function(textArray)
{
    if (textArray.length == 0)
        return;
    if (isSpace(textArray[0]))
        textArray.shift();
};

BBTag.prototype.trimEnd = function(textArray)
{
	if (textArray.length == 0)
		return;
	if (isSpace(textArray[textArray.length - 1]))
		--textArray.length;
};

/**
 * ”дал€ет все пустые строки в дочерних элементах, начина€ с index
 * @param index
 */
BBTag.prototype.skipEmpty = function(index)
{
    // TODO переделать на один вызов splice
    while (index < this.children.length && this.children[index] === '\n')
        this.children.splice(index, 1);
};

BBTag.prototype.toString = function()
{
	var out = [];
	if (this.tag != null)
	{
		out.push('[', this.openTag);
		if (this.value != null)
			out.push('=', this.value);
		out.push(']');
	}
    this.appendChildrenTo(out);
	if (this.tag != null)
		out.push('[/', this.closeTag, ']');
	return out.join('');
};

BBTag.prototype.childrenToString = function()
{
	var out = [];
	this.appendChildrenTo(out);
	return out.join('');
};

BBTag.prototype.appendChildrenTo = function(outArray)
{
    for (var i = 0; i < this.children.length; i++)
    {
        var child = this.children[i];
        if (child instanceof BBTag)
            outArray.push(child.toString());
        else if (child instanceof Array)
            outArray.push(child.join(''));
        else // \n
            outArray.push(child);
    }
};

/**
 * ¬озвращает массив без пробельных символов в начале и в конце
 * @param textArray
 * @returns {*}
 */
function arrayTrim(textArray)
{
	if (!(textArray instanceof Array))
        return null;
	var start = 0;
	var ch = textArray[start];
	while (isSpace(ch))
	{
		++start;
		if (textArray.length == start)
			return [];
		ch = textArray[start];
	}
	var end = textArray.length - 1;
	ch = textArray[end];
	while (isSpace(ch))
		ch = textArray[--end];
	return textArray.slice(start, end + 1);
}

var strTrim = String.prototype.trim
	? function(s) { return !s ? s : s.trim(); }
	: function(s)
	{
		if (!s || !isSpace(s[0]) && !isSpace(s[s.length - 1]))
			return s;
		return arrayTrim(s.split('')).join('');
	};

function isSpace(char)
{
    return char === ' ' || char === '\t' || char === '\n';
}

/*
function arrayEmpty(s)
{
	if (!(s instanceof Array))
		return false;
	var i = 0;
	while (s.length > i)
	{
		var ch = s[i];
		if (ch != ' ' && ch != '\t')
			return false;
		++i;
	}
	return true;
}
*/

function strEmpty(s)
{
	if (!s)
		return true;
	var i = 0;
	while (s.length > i)
	{
		if (!isSpace(s[i]))
			return false;
		++i;
	}
	return true;
}

if (!Array.prototype.indexOf)
	Array.prototype.indexOf = function(obj) {
		for (var i = 0, j = this.length; i < j; ++i)
			if (this[i] === obj)
				return i;
		return -1;
	};
