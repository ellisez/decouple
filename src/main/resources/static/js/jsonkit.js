//格式化代码函数,已经用原生方式写好了不需要改动,直接引用就好
var formatJson = function (json, options) {
    var reg = null,
        formatted = '',
        pad = 0,
        PADDING = '    ';
    options = options || {};
    options.newlineAfterColonIfBeforeBraceOrBracket = (options.newlineAfterColonIfBeforeBraceOrBracket === true) ? true : false;
    options.spaceAfterColon = (options.spaceAfterColon === false) ? false : true;
    if (typeof json !== 'string') {
        json = JSON.stringify(json);
    } else {
        json = JSON.parse(json);
        json = JSON.stringify(json);
    }
    reg = /([\{\}])/g;
    json = json.replace(reg, '\n$1\n');
    reg = /([\[\]])/g;
    json = json.replace(reg, '\n$1\n');
    reg = /(\,)/g;
    json = json.replace(reg, '$1\n');
    reg = /(\n\n)/g;
    json = json.replace(reg, '\n');
    reg = /\n\,/g;
    json = json.replace(reg, ',');
    if (!options.newlineAfterColonIfBeforeBraceOrBracket) {
        reg = /\:\n\{/g;
        json = json.replace(reg, ':{');
        reg = /\:\n\[/g;
        json = json.replace(reg, ':[');
    }
    if (options.spaceAfterColon) {
        reg = /\:/g;
        json = json.replace(reg, ':');
    }
    (json.split('\n')).forEach(function (node, index) {
        //console.log(node);
        var i = 0,
            indent = 0,
            padding = '';

        if (node.match(/\{$/) || node.match(/\[$/)) {
            indent = 1;
        } else if (node.match(/\}/) || node.match(/\]/)) {
            if (pad !== 0) {
                pad -= 1;
            }
        } else {
            indent = 0;
        }

        for (i = 0; i < pad; i++) {
            padding += PADDING;
        }

        formatted += padding + node + '\n';
        pad += indent;
    });
    return formatted;
};

//着色
window.TAB = "    ";
function IsArray(obj) {
    return obj &&
        typeof obj === 'object' &&  typeof obj.length === 'number' && !(obj.propertyIsEnumerable('length'));
}
function JSONColor(opt) {
    var CanvasId=opt.CanvasId;
    var text=opt.text;
    var ErrorId=opt.ErrorId;

    var Canvas = document.getElementById(CanvasId);
    var Error = document.getElementById(ErrorId);
    try {
        Canvas.innerHTML = '<pre>'+text+'</pre>';

        var json = text.replace(/\u00A0/g, "$1");//过滤特殊字符

        var obj = json;
        if (json != "") {
            obj = JSON.parse(json);
        }
        var html = JSONColorObject(obj, 0, false, false, false);
        Canvas.innerHTML = "<PRE class='CodeContainer'>" + html + "</PRE>";
        if (ErrorId) {
            Error.className = 'Good';
            Error.innerHTML = '格式正确';
        }
    } catch(e) {
        //console.error(e);
        if (ErrorId) {
            Error.className = 'Bad';
            Error.innerHTML = e.message;
        } else {
            alert("json语法错误，不能格式化。错误信息:\n" + e.message);
        }
    }
}
function JSONColorObject(obj, indent, addComma, isArray, isPropertyContent) {
    var html = "";
    var comma = (addComma) ? "<span class='Comma'>,</span> ": "";
    var type = typeof obj;
    if (IsArray(obj)) {
        if (obj.length == 0) {
            html += GetRow(indent, "<span class='ArrayBrace'>[ ]</span>" + comma, isPropertyContent);
        } else {
            html += GetRow(indent, "<span class='ArrayBrace'>[</span>", isPropertyContent);
            for (var i = 0; i < obj.length; i++) {
                html += JSONColorObject(obj[i], indent + 1, i < (obj.length - 1), true, false);
            }
            html += GetRow(indent, "<span class='ArrayBrace'>]</span>" + comma);
        }
    } else {
        if (type == "object" && obj == null) {
            html += FormatLiteral("null", "", comma, indent, isArray, "Null");
        } else {
            if (type == "object") {
                var numProps = 0;
                for (var prop in obj) {
                    numProps++;
                }
                if (numProps == 0) {
                    html += GetRow(indent, "<span class='ObjectBrace'>{ }</span>" + comma, isPropertyContent)
                } else {
                    html += GetRow(indent, "<span class='ObjectBrace'>{</span>", isPropertyContent);
                    var j = 0;
                    for (var prop in obj) {
                        html += GetRow(indent + 1, '<span class="PropertyName">"' + prop + '"</span>: ' + JSONColorObject(obj[prop], indent + 1, ++j < numProps, false, true))
                    }
                    html += GetRow(indent, "<span class='ObjectBrace'>}</span>" + comma);
                }
            } else {
                if (type == "number") {
                    html += FormatLiteral(obj, "", comma, indent, isArray, "Number");
                } else {
                    if (type == "boolean") {
                        html += FormatLiteral(obj, "", comma, indent, isArray, "Boolean");
                    } else {
                        if (type == "function") {
                            obj = FormatFunction(indent, obj);
                            html += FormatLiteral(obj, "", comma, indent, isArray, "Function");
                        } else {
                            if (type == "undefined") {
                                html += FormatLiteral("undefined", "", comma, indent, isArray, "Null");
                            } else {
                                html += FormatLiteral(obj, '"', comma, indent, isArray, "String");
                            }
                        }
                    }
                }
            }
        }
    }
    return html;
};

function FormatLiteral(literal, quote, comma, indent, isArray, style) {
    if (typeof literal == "string") {
        literal = literal.split("<").join("&lt;").split(">").join("&gt;");
    }
    var str = "<span class='" + style + "'>" + quote + literal + quote + comma + "</span>";
    if (isArray) {
        str = GetRow(indent, str);
    }
    return str;
}
function FormatFunction(indent, obj) {
    var tabs = "";
    for (var i = 0; i < indent; i++) {
        tabs += window.TAB;
    }
    var funcStrArray = obj.toString().split("\n");
    var str = "";
    for (var i = 0; i < funcStrArray.length; i++) {
        str += ((i == 0) ? "": tabs) + funcStrArray[i] + "\n";
    }
    return str;
}
function GetRow(indent, data, isPropertyContent) {
    var tabs = "";
    for (var i = 0; i < indent && !isPropertyContent; i++) {
        tabs += window.TAB;
    }
    if (data != null && data.length > 0 && data.charAt(data.length - 1) != "\n") {
        data = data + "\n";
    }
    return tabs + data;
};