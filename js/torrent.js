/*
	־בתוךע הכÿ נאבמעû ס עמננוםע-פאיכמל
*/

Torrent = function()
{
	var _listener;
	
	function _supported()
	{
		//return false;
		return window.File && window.FileReader && window.FileList;
	}
	
	function _setListener(file, listener)
	{
		file.addEventListener('change', _onFileChange, false);
		_listener = listener;
	}
	
	function _onFileChange(e)
	{
		var f = e.target.files[0];
		var reader = new FileReader();
		reader.onload = (function(torrent) { return function(e)
		{
			var size = getTorrentSize(e.target.result);
			if (size)
				_listener(size);
		}; })(f);
		reader.readAsArrayBuffer(f);
	}
	
	function _sizeToString(s)
	{
		if (s < 1024)
			return s + ' באיע';
		if (s < 1048576)
			return (s / 1024).toFixed() + ' Êֱ';
		if (s < 1073741824)
			return (s / 1048576).toFixed() + ' ֱּ';
		return (s / 1073741824).toFixed(2) + ' ֱֳ';
	}
	
	function getTorrentSize(torrent)
	{
		var byteArray = new Uint8Array(torrent);
		var torrentObject = bdecode(byteArray);
		if (!torrentObject || !torrentObject.info)
			return null;
		var length = 0;
		var files = torrentObject.info.files;
		if (files && files instanceof Array)
			for (var i = 0, file; file = files[i]; ++i)
				length += file.length;
		else
			length = torrentObject.info.length;
		torrentObject = null;
		if (length == 0)
			return null;
		return _sizeToString(length);
	}
	
	function bdecode(byteArray, byteIndex, isRawBytes) {
		if (byteIndex === undefined) {
			byteIndex = [0];
		}
		var item = String.fromCharCode(byteArray[byteIndex[0]++]);
		if(item == 'd') {
			var dic = {};
			item = String.fromCharCode(byteArray[byteIndex[0]++]);
			while(item != 'e') {
				byteIndex[0]--;
				var key = bdecode(byteArray, byteIndex);
				if (key == "pieces") {
					dic[key] = bdecode(byteArray, byteIndex, true);
				}
				else {
					dic[key] = bdecode(byteArray, byteIndex);
				}
				item = String.fromCharCode(byteArray[byteIndex[0]++]);
			}
			return dic;
		}
		if(item == 'l') {
			var list = [];
			item = String.fromCharCode(byteArray[byteIndex[0]++]);
			while(item != 'e') {
				byteIndex[0]--;
				list.push(bdecode(byteArray, byteIndex));
				item = String.fromCharCode(byteArray[byteIndex[0]++]);
			}
			return list;
		}
		if(item == 'i') {
			var num = '';
			item = String.fromCharCode(byteArray[byteIndex[0]++]);
			while(item != 'e') {
				num += item;
				item = String.fromCharCode(byteArray[byteIndex[0]++]);
			}
			return Number(num);
		}
		if(/\d/.test(item)) {
			var num = '';
			while(/\d/.test(item)) {
				num += item;
				item = String.fromCharCode(byteArray[byteIndex[0]++]);
			}
			num = Number(num);
			var line = '';
			if (isRawBytes) {
				byteIndex[0] += num;
				return "[" + num + "]";
			}
			else {
				while(num--) {
					line += escape(String.fromCharCode(byteArray[byteIndex[0]++]));
				}
				try {
					return decodeURIComponent(line);
				}
				catch(e) {
					return unescape(line) + " (?!)";
				}
			}
		}
		return null;
	}
	
	return {
		setListener: _setListener,
		supported: _supported
	};
}();