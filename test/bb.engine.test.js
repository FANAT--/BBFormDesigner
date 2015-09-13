/**
 * Created by FANAT on 13.09.2015.
 */

describe('bb.engine tests', function(){

    it('isSpace', function()
    {
        expect(isSpace(' ')).toBeTruthy();
        expect(isSpace('\t')).toBeTruthy();
        expect(isSpace('\n')).toBeTruthy();
        expect(isSpace('_')).toBeFalsy();
    });

    it('strEmpty', function()
    {
        expect(strEmpty(null)).toBeTruthy();
        expect(strEmpty('')).toBeTruthy();
        expect(strEmpty(' ')).toBeTruthy();
        expect(strEmpty('\t  \n  \n ')).toBeTruthy();
        expect(strEmpty('     qwerty   ')).toBeFalsy();
    });

    it('arrayTrim', function()
    {
        var ar1 = ['a'];
        var ar2 = arrayTrim(ar1);
        expect(ar2).toEqual(ar1);
        expect(ar2).not.toBe(ar1);

        expect(arrayTrim([])).toEqual([]);
        expect(arrayTrim(null)).toBeNull();
        expect(arrayTrim([ 'a', 'b', ' ', 'c', ' ', ' ' ])).toEqual(['a', 'b', ' ', 'c']);
        expect(arrayTrim([ 'a', 'b', ' ', 'c' ])).toEqual(['a', 'b', ' ', 'c']);
        expect(arrayTrim([ ' ', 'a', 'b', ' ', 'c', '\t' ])).toEqual(['a', 'b', ' ', 'c']);
    });

    it('bbParse', function()
    {
        var bbTag = bbParse('[b]field:[/b] value');
        expect(bbTag.children.length).toBe(2);

        var bTag = bbTag.children[0];
        expect(bTag.tag).toBe('b');
        expect(bTag.value).toBe(undefined);
        expect(bTag.children.length).toBe(1);
        expect(bTag.children[0]).toEqual(['f', 'i', 'e', 'l', 'd', ':']);

        expect(bbTag.children[1]).toEqual([' ', 'v', 'a', 'l', 'u', 'e']);
    });

    it('bbParse remove extra spaces', function()
    {
        function expectBB(text, expected) { expect(bbParse(text).toString()).toBe(expected); }

        expectBB('some   text', 'some text');
        expectBB('  some text', ' some text');
        expectBB('some text  ', 'some text ');
        expectBB('[b]   [/b]', '[b] [/b]');
    });

    it('bbParse errors', function()
    {
        function expectBB(text)
        {
            expect(bbParse(text).toString()).toBe(text);
        }

        expectBB('[');
        expectBB('[]');
        expectBB('[a]');
        expectBB('[/a]');
        expectBB('[a][b]');
        expectBB('[/a][/b]');
        expectBB('[a][/b]');
        expectBB('[/a][b]');
        expectBB('[a][b][/a]');
        expectBB('[a][/b][/a]');
        expectBB('[a][b][c][/b][/a]');
        expectBB('[a][b][/c][/b][/a]');
        expectBB('[a][b][c][d][/c][/b][/a]');
        expectBB('[a]-[b]-[c]-[/d]-[/c]-[/b]-[/a]');
        expectBB('[a][b][c][/b][d][e][/d][/a]');
        expectBB('[a][b][c][/b][d][e][/d][/f]');
        expectBB('[a][b][/a][/b]');
        expectBB('[a]-');
        expectBB('[a][b][c][/a]');
        expectBB('[a][/b][/c][/a]');
        expectBB('[ unknoWn ][/unknown]');
    });

});