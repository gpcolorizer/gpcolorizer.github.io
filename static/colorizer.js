function getRGBText(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    let r = parseInt(result[1], 16),
        g = parseInt(result[2], 16),
        b = parseInt(result[3], 16);
    return `rgb(${r}, ${g}, ${b})`;
}

function addPreamble(text) {
    return '[B]add[/B] [S]remove[/S] [B](comment)[/B]\n' + text;
}

function colorAdditions(text, color) {
    let colorText = getRGBText(color);
    return text.replace(/\[B\](.*?)\[\/B\]/gm, `[COLOR=${colorText}][B]$1[/B][/COLOR]`);
}

function colorRemovals(text, color) {
    let colorText = getRGBText(color);
    return text.replace(/\[S\](.*?)\[\/S\]/gm, `[COLOR=${colorText}][B][S]$1[/COLOR][/B][/S]`);
}

function colorComments(text, color, stripParens) {
    let colorText = getRGBText(color);
    function colorSingleBlock(match) {
        let replaceWith = stripParens
            ? `[COLOR=${colorText}]$1[/COLOR]`
            : `[COLOR=${colorText}]($1)[/COLOR]`;
        return match.replace(/\((.*?)\)/gm, replaceWith);
    }
    return text.replace(/\[B\].*?\[\/B\]/gm, colorSingleBlock);
}

function colorize(text, options) {
    if (options.addPreamble) {
        text = addPreamble(text);
    }
    text = colorComments(text, options.commentColor, options.stripParens);
    text = colorAdditions(text, options.addColor);
    text = colorRemovals(text, options.removeColor);
    return text;
}
