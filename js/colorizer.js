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
    function colorSingleBlock(_, p1, p2, p3) {
        // Within bold blocks, color everything outside of parentheses
        return p1 + p2.replace(/(^|\))(.+?)($|\()/gs, `$1[COLOR=${colorText}]$2[/COLOR]$3`) + p3;
    }
    return text.replace(/(\[B\])(.+?)(\[\/B\])/gs, colorSingleBlock);
}

function colorRemovals(text, color, keepStrikethrough) {
    let colorText = getRGBText(color);
    let replaceWith = keepStrikethrough
        ? `[B][COLOR=${colorText}][S]$1[/S][/COLOR][/B]`
        : `[B][COLOR=${colorText}]$1[/COLOR][/B]`;
    return text.replace(/\[S\](.+?)\[\/S\]/gs, replaceWith);
}

function colorComments(text, color, keepParens) {
    let colorText = getRGBText(color);
    function colorSingleBlock(_, p1, p2, p3) {
        // Within bold blocks, color everything inside of parentheses
        let replaceWith = keepParens
            ? `[COLOR=${colorText}]($1)[/COLOR]`
            : `[COLOR=${colorText}]$1[/COLOR]`;
        return p1 + p2.replace(/\((.*?)\)/gs, replaceWith) + p3;
    }
    return text.replace(/(\[B\])(.+?)(\[\/B\])/gs, colorSingleBlock);
}

function colorize(text, options) {
    if (options.addPreamble) {
        text = addPreamble(text);
    }
    text = colorAdditions(text, options.addColor);
    text = colorRemovals(text, options.removeColor, options.keepStrikethrough);
    text = colorComments(text, options.commentColor, options.keepParens);
    return text;
}
