/* Upload Framework - набор функций для работы с DOM */
UF = function()
{
    function _el(id)
    {
        return document.getElementById(id);
    }

	function _newEl(tagName, className)
    {
        var d = document.createElement(tagName);
        if (className)
            d.className = className;
        return d;
    }

	function _newDiv(className)
    {
        return _newEl('div', className);
    }

	function _newText(text)
    {
        return document.createTextNode(text);
    }

	return {
        el: _el,
        newEl: _newEl,
        newDiv: _newDiv,
        newText: _newText
    }
}();