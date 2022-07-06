// Source: https://github.com/Alhadis/Snippets/blob/master/js/polyfills/IE8-child-elements.js
if(!("previousElementSibling" in document.documentElement)){
    Object.defineProperty(Element.prototype, "previousElementSibling", {
        get: function(){
            var e = this.previousSibling;
            while(e && 1 !== e.nodeType)
                e = e.previousSibling;
            return e;
        }
    });
}
// Source: https://github.com/Alhadis/Snippets/blob/master/js/polyfills/IE8-child-elements.js
if(!("nextElementSibling" in document.documentElement)){
    Object.defineProperty(Element.prototype, "nextElementSibling", {
        get: function(){
            var e = this.nextSibling;
            while(e && 1 !== e.nodeType)
                e = e.nextSibling;
            return e;
        }
    });
}

function changeScriptingLanguage(combobox) {
    var lang = combobox.options[combobox.selectedIndex].value || "all";
    document.cookie = "lang=" + lang + "; max-age=" + (60 * 60 * 24 * 365);
    setScriptingLanguage(lang);
}

function updateDisplay(node, text, lang, candidates) {
    if (lang == "all" || lang == text) {
        node.style.display = "block";
        return true;
    } else if (lang != "") {
        for ( var i = 0; i < candidates.length; ++i ) {
            if ( candidates[i] == text ) {
                node.style.display = "none";
                return true;
            }
        }
    }
    return false;
}

function isProgramListing(node) {
    if ( !node )
        return false;
    var cls = node.getAttribute("class");
    if ( !cls )
        return false;
    return cls == "programlistingcontainer";
}

function updatePage(lang) {
    var candidates = ["JavaScript", "Perl", "Python", "Ruby", "Tcl"];
    var changes = 0;
    var plcs = getElementsByClass("programlistingcontainer");
    for (i in plcs) {
	var plc = plcs[i];
        if (!isProgramListing(plc.previousElementSibling) && !isProgramListing(plc.nextElementSibling))
            continue;
	var plls = getElementsByClass("programlistinglanguage", plc);
	for (j in plls) {
            changes++;
	    var pll = plls[j];
            if (updateDisplay(plc, getText(pll, 1), lang, candidates))
                break;
	}
    }
    var onesToShow = [];
    var onesToHide = [];
    if (lang == "all") {
        for (i in candidates) {
            onesToShow.push(candidates[i] + "-specific");
        }
    } else {
        onesToShow = [lang + "-specific"];
        for (i in candidates) {
            if (candidates[i] != lang)
                onesToHide.push(candidates[i] + "-specific");
        }
    }
    var sidebars = ["note", "warning", "important", "tip", "caution"];
    for (i in sidebars) 
        changes += updateSidebars(lang, sidebars[i], onesToShow,
                onesToHide);
}

function updateSidebars(lang, which, onesToShow, onesToHide) {
    var changes = 0;
    var sidebars = getElementsByClass(which);
    for (i in sidebars) {
        var sidebar = sidebars[i];
        for (j in onesToHide) {
            if (onesToHide[j] == sidebar["title"]) {
                sidebar.style.display = "none";
                changes++;
            }
        }
        for (j in onesToShow) {
            if (onesToShow[j] == sidebar["title"]) {
                sidebar.style.display = "block";
                changes++;
            }
        }
    }
    return changes;
}

function setScriptingLanguage(lang) {
    var combos = document.getElementsByName("scriptlangcombo");
    if ( !lang )
        lang = "Python";
    var cookies = document.cookie;
    var i = cookies.indexOf("lang=");
    if (i != -1) {
        var j = i + 5; // + length of "lang="
        var k = cookies.indexOf(";");
        if (k == -1)
            k = cookies.length;
        var value = cookies.substring(j, k);
        if (value == "JavaScript" || value == "Perl" ||
            value == "Python" || value == "Ruby" || value == "Tcl")
            lang = value;
    }
    for (var cb = 0; cb < combos.length; ++cb) {
        var combobox = combos[cb];
        if (!combobox.options)
            continue;
        for (var i = 0; i < combobox.options.length; i++) {
            if (combobox.options[i].value == lang) {
                combobox.selectedIndex = i;
                break;
            }
        }
    }
    updatePage(lang);
}

function getElementsByClass(classname, root) {
    if (!root)
	root = document;
    var children = root.getElementsByTagName("*");
    var elements = [];
    for (var i in children) {
	var element = children[i];
	if (isMember(element, classname))
	    elements.push(element);
    }
    return elements;

    function isMember(element, classname) {
	var classes = element.className;
	if (!classes)
	    return false;
	if (classes == classname)
	    return true;
	var ws = /\s+/;
	if (!ws.test(classes))
	    return false;
	var klasses = classes.split(ws);
	for (var i in klasses) {
	    if (klasses[i] == classname)
		return true;
	}
	return false;
    }
}

function getText(node, max) {
    var parts = [];
    getStrings(node, parts, max);
    return parts.join("");

    function getStrings(node, parts, max) {
	if (parts.length >= max)
	    return;
	if (node.nodeType == 3) // TEXT_NODE
	    parts.push(node.data);
	else if (node.nodeType == 1) { // ELEMENT_NODE
	    for (var child = node.firstChild; child != null;
		    child = child.nextSibling) {
		getStrings(child, parts, max);
		if (parts.length >= max)
		    return;
	    }
	}
    }
}
