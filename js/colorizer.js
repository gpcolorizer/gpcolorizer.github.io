function getRGBText(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    let r = parseInt(result[1], 16),
        g = parseInt(result[2], 16),
        b = parseInt(result[3], 16);
    return `rgb(${r}, ${g}, ${b})`;
}

function regexEscape(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function insideOf(startSymbol, endSymbol, inclusive = false) {
    [startSymbol, endSymbol] = [startSymbol, endSymbol].map(regexEscape);
    let prefix = inclusive ? startSymbol : `(?<=${startSymbol})`;
    let suffix = inclusive ? endSymbol : `(?=${endSymbol})`;
    return new RegExp(`${prefix}(.*?)${suffix}`, 'gs');
}

function outsideOf(startSymbol, endSymbol) {
    return new RegExp(`(?<=^|${regexEscape(endSymbol)})(.*?)(?=\$|${regexEscape(startSymbol)})`, 'gs');
}

function addPreamble(text) {
    return '[B]add[/B] [S]remove[/S] [B](comment)[/B]\n' + text;
}

// If bold tags are put inside of color tags, this will cause us to overwrite existing colors with our own
// colors, which we don't want to do.
function fixColorTags(text) {
    return text.replace(/\[COLOR=(.{0,18})\]\[B\](.*?)\[\/B\]\[\/COLOR\]/gs, '[B][COLOR=$1]$2[/COLOR][/B]');
}

function colorAdditions(text, color) {
    let rgb = getRGBText(color);
    return text.replace(insideOf('[B]', '[/B]'), boldText =>
        boldText.replace(outsideOf('[COLOR=', '[/COLOR]'), nonColoredText =>
            nonColoredText.replace(outsideOf('(', ')'), `[COLOR=${rgb}]$1[/COLOR]`)));
}

function colorRemovals(text, color, keepStrikethrough) {
    let rgb = getRGBText(color);
    let replaceWith = keepStrikethrough
        ? `[B][COLOR=${rgb}][S]$1[/S][/COLOR][/B]`
        : `[B][COLOR=${rgb}]$1[/COLOR][/B]`;
    return text.replace(insideOf('[S]', '[/S]', true), replaceWith);
}

function colorComments(text, color, keepParens) {
    let rgb = getRGBText(color);
    let replaceWith = keepParens
        ? `[COLOR=${rgb}]($1)[/COLOR]`
        : `[COLOR=${rgb}]$1[/COLOR]`;
    return text.replace(insideOf('[B]', '[/B]'), boldText =>
        boldText.replace(outsideOf('[COLOR=', '[/COLOR]'), nonColoredText =>
            nonColoredText.replace(insideOf('(', ')', true), replaceWith)));
}

function colorize(text, options) {
    if (options.addPreamble) {
        text = addPreamble(text);
    }
    text = fixColorTags(text);
    text = colorAdditions(text, options.addColor);
    text = colorRemovals(text, options.removeColor, options.keepStrikethrough);
    text = colorComments(text, options.commentColor, options.keepParens);
    return text;
}
