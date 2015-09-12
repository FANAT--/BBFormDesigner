/*
	BB-движок
*/

function bbParse(text)
{
	var bbTag = new BBTag();
	bbTag.parse(null, text.split(''), 0);
	return bbTag;
}

function BBTag(tag, value)
{
	if (tag)
	{
		//this.trimEnd(tag);
		this.openTag = tag.join('');
		this.tag = arrayTrim(tag).join('').toLowerCase();
	}
	if (value)
	{
		//this.trimEnd(value);
		this.value = value.join('');
	}
	this.children = [];
}

BBTag.prototype.parse = function (parent, chars, index)
{
	this.parent = parent;
	var state = 0; // 0 - читаем текст, 1 - считали начало тега [, 2 - считали начало закрытого тега /, 3 - считали =
	var tag = [];
	var value = [];
	var str = [];
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
							var bbTag = new BBTag(tag, null);
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
						var bbTag = new BBTag(tag, value);
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
}

/*
 Тестирование обработки ошибок:
 + [
 + []
 + [a]
 + [/a]
 + [a][b]
 + [/a][/b]
 + [a][/b]
 + [/a][b]
 + [a][b][/a]
 + [a][/b][/a]
 + [a][b][c][/b][/a]
 + [a][b][/c][/b][/a]
 + [a][b][c][d][/c][/b][/a]
 + [a]-[b]-[c]-[/d]-[/c]-[/b]-[/a]
 + [a][b][c][/b][d][e][/d][/a]
 + [a][b][c][/b][d][e][/d][/f]
 + [a][b][/a][/b]
 + [a]-
 + [a][b][c][/a]
 + [a][/b][/c][/a]
*/

BBTag.prototype.tryClose = function(tag) // tag - строка в нижнем регистре без пробелов в начале и в конце
{
	//alert(this.tag  +' tryClose ' + tag);
	if (this.tag == tag)
		return this;
	if (this.parent)
		return this.parent.tryClose(tag);
	return false;
}

BBTag.prototype.pushBad = function(bbTag)
{
	//alert(this.tag + '.pushBad ' + bbTag);
	var bb = [ '[', bbTag.openTag ];
	if (bbTag.value != null)
		bb.push('=', bbTag.value);
	bb.push(']');
	bb = bb.join('').split('');
	// если последний в children - строка, можно дописать все в нее
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
	/*
	if (this.children.length != 0)
	{
		var lastChild = this.children[this.children.length - 1];
		if (lastChild instanceof Array)
		{
			BBTag.prototype.pushChars(lastChild, bb.join('').split(''));
			var i = 0;
			while (bbTag.children.len != i && bbTag.children[i] instanceof Array)
			{
				BBTag.prototype.pushChars(lastChild, bbTag.children[i]);
				++i;
			}
			bbTag.children = bbTag.children.slice(i);
			this.children.push.apply(this.children, bbTag.children);
			return;
		}
	}
	this.children.push(bb.join(''));
	this.children.push.apply(this.children, bbTag.children);
	*/
	//alert(this.tag + ' after pushBad\n' + this.toString());
}

BBTag.prototype.pushChar = function(ar, ch)
{
	if (isSpace(ch))
	{
		//if (ar.length == 0) // не добавляем пробел вначале
		//	return;
		if (ar.length != 0 && isSpace(ar[ar.length - 1])) // не добавляем пробел после пробела
			return;
	}
	ar.push(ch);
}

BBTag.prototype.pushChars = function(ar1, ar2)
{
	ar1.push.apply(ar1, ar2);
}

BBTag.prototype.pushChild = function(ar)
{
	var len = this.children.length;
	if (len != 0)
	{
		var last = this.children[len - 1];
		if (last instanceof Array)
		{
			this.pushChars(last, ar);
			return;
		}
		if (last == '\n')
			this.trimStart(ar);
	}
	if (ar.length != 0)
		this.children.push(ar);
}

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
}

BBTag.prototype.trimStart = function(ar)
{
	if (ar.length == 0)
		return;
	if (isSpace(ar[0]))
		ar.shift();
}

BBTag.prototype.trimEnd = function(ar)
{
	if (ar.length == 0)
		return;
	if (isSpace(ar[ar.length - 1]))
		--ar.length;
}

BBTag.prototype.skipEmpty = function(i)
{
	while (this.children.length > i && this.children[i] == '\n')
		this.children.splice(i, 1);
}

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
	out.push(this.childrenToString());
	if (this.tag != null)
		out.push('[/', this.closeTag, ']');
	return out.join('');
}

BBTag.prototype.childrenToString = function()
{
	var out = [];
	for (var i = 0; i < this.children.length; i++)
	{
		var child = this.children[i];
		if (child instanceof BBTag)
			out.push(child.toString());
		else if (child instanceof Array)
			out.push(child.join(''));
		else
			out.push(child);
	}
	return out.join('');
}

function arrayTrim(s)
{
	var start = 0;
	var ch = s[start];
	while (isSpace(ch))
	{
		++start;
		if (s.length == start)
			return [];
		ch = s[start];
	}
	var end = s.length - 1;
	ch = s[end];
	while (isSpace(ch))
		ch = s[--end];
	return s.slice(start, end + 1);
}

var strTrim = String.prototype.trim
	? function(s) { return !s ? s : s.trim(); }
	: function(s)
	{
		if (!s || !isSpace(s[0]) && !isSpace(s[s.length - 1]))
			return s;
		return arrayTrim(s.split('')).join('');
	}

function isSpace(ch)
{
	return ch == ' ' || ch == '\t' || ch == '\n';
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
