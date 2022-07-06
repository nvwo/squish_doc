function idIsVisible( id ) {
    return document.getElementById( id ).style.display == "block";
}

function setClassVisibility( className, visible ) {
    var elements = document.getElementsByClassName( className )
    for ( var i = 0; i < elements.length; i++ ) {
        var e = elements[i];
        if ( visible ) {
            e.style.display = "block";
        } else {
            e.style.display = "none";
        }
    }
}

function setTOCVisble(visible) {
    document.getElementById( "toc-container" ).style.display = visible ? "block" : "none";
    document.getElementById( "toc-open" ).style.display = visible ? "none" : "block";
    document.getElementById( "output" ).style.left = visible ? "25%" : "2em";
    document.getElementById( "output" ).style.borderLeft = visible ? "1px solid gray" : "0";
}

function setTOCDIVVisible() {
    document.getElementById( "toc-div" ).style.display = "block";
    document.getElementById( "search-div" ).style.display = "none";
    document.getElementById( "heading-table-of-contents" ).style.fontWeight = "700";
    document.getElementById( "heading-table-of-contents" ).style.cursor = "";
    document.getElementById( "heading-search" ).style.fontWeight = "";
}

function setSearchDIVVisible() {
    document.getElementById( "toc-div" ).style.display = "none";
    document.getElementById( "search-div" ).style.display = "block";
    document.getElementById( "heading-search" ).style.fontWeight = "700";
    document.getElementById( "heading-table-of-contents" ).style.fontWeight = "";
    document.getElementById( "heading-table-of-contents" ).style.cursor = "pointer";
    document.getElementById( "searchEdit" ).focus();
}

function keys( arr )
{
    var k = [];
    for ( n in arr ) {
        k.push( n );
    }
    return k;
}

function keysSortedIgnoreCase( arr )
{
    var k = keys( arr );
    sortArrayIgnoreCase( k );
    return k;
}

function setKeysToObjArray( objArray, keys )
{
    for ( i in keys ) {
        objArray[keys[i]] = "";
    }
}

function sortArrayIgnoreCase( arr )
{
    arr.sort(
        function (a, b)
        {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        }
    );
}

function toUrlByTitle( urls, titles )
{
    var r = {};
    for ( var i = 0; i < urls.length; ++i ) {
        var url = urls[i];
        var title;
        if ( url in titles ) {
            title = titles[url];
        } else {
            title = url;
        }
        r[title] = url;
    }
    return r;
}

function isAnyInStr( arrayWithSubstrings, toSearchIn ) {
    for ( i in arrayWithSubstrings ) {
        var s = arrayWithSubstrings[i];
        if ( toSearchIn.indexOf( s ) != -1 ) {
            return true;
        }
    }
    return false;
}

function getUrlsByType( searchWords, urls, allTitles )
{
    var functionUrls = [];
    var propertyUrls = [];
    var methodUrls = [];
    var extensionAPIUrls = [];
    var searchWordsInTitleUrls = [];
    var otherUrls = [];
    for ( url in urls ) {
        var title = allTitles[url];
        if ( title == undefined ) {
            title = url;
        }
        var titleUpperCase = title.toUpperCase();

        var isExtensionAPI = title.indexOf( "Squish." ) == 0
            || title.indexOf( "SquishHook." ) == 0
            || title.indexOf( "class-com.froglogic." ) == 0;

        var isFunction = url.indexOf( "-function" ) != -1;

        var isProperty = url.indexOf( "-property" ) != -1 &&
            url.indexOf( "-property" ) == ( url.length - "-property".length );

        var isMethod = title.indexOf( "HTML_" ) == 0
            || title.indexOf( "File." ) == 0
            || title.indexOf( "file." ) == 0
            || title.indexOf( "Socket." ) == 0
            || title.indexOf( "socket." ) == 0
            || title.indexOf( "SQL." ) == 0
            || title.indexOf( "SQLConnection." ) == 0
            || title.indexOf( "SQLResult." ) == 0
            || title.indexOf( "XML." ) == 0
            || title.indexOf( "XMLNode." ) == 0;

        var titleContainsSearchWords = isAnyInStr( searchWords, titleUpperCase );

        // It is possibly to have a URL that denotes an extension as
        // as well a function, for example the Squish.* web
        // extension API; therefore check if something is an
        // extension first; order of the rest is also relevant due
        // to similar cases
        if ( isExtensionAPI ) {
            extensionAPIUrls.push( url );
        } else if ( isProperty ) {
            propertyUrls.push( url );
        } else if ( isMethod ) {
            methodUrls.push( url );
        } else if ( isFunction ) {
            functionUrls.push( url );
        } else if ( titleContainsSearchWords ) {
            searchWordsInTitleUrls.push( url );
        } else {
            otherUrls.push( url );
        }
    }

    return [functionUrls, propertyUrls, methodUrls, extensionAPIUrls, searchWordsInTitleUrls, otherUrls];
}

function toResultListHTML( resultsTitle, urls, allTitles )
{
    if ( urls.length == 0 ) {
        return "";
    }

    var urlsByTitle = toUrlByTitle( urls, allTitles );
    var theseTitles = keysSortedIgnoreCase( urlsByTitle );
    var s = "<a name='functions'>" + resultsTitle + "</a>:<br/>";
    s += "<ol>";
    for ( var i = 0; i < theseTitles.length; ++i ) {
        var title = theseTitles[i];
        var url = urlsByTitle[title];
        s += "<li><a href='" + url + "' title='" + title + "'>" + title + "</a></li>";
    }
    s += "</ol>";
    return s;
};

function displaySearchResults( searchWordsUpperCase, matchingUrls )
{
    if ( matchingUrls.length == 0 ) {
        document.getElementById( "searchResults" ).innerHTML = "No matching pages found.";
        return;
    }

    var urlsByType = getUrlsByType( searchWordsUpperCase, matchingUrls, titles );
    var htmlCode = "";
    htmlCode += toResultListHTML( "Functions", urlsByType[0], titles );
    htmlCode += toResultListHTML( "Properties", urlsByType[1], titles );
    htmlCode += toResultListHTML( "Methods", urlsByType[2], titles );
    htmlCode += toResultListHTML( "Extension APIs", urlsByType[3], titles );
    htmlCode += toResultListHTML( "Title Matches", urlsByType[4], titles );
    htmlCode += toResultListHTML( "Other matches", urlsByType[5], titles );
    document.getElementById( "searchResults" ).innerHTML = htmlCode;
}

function updateSearch()
{
    if ( document.getElementById( "searchEdit" ).value.length == 0 ) {
        document.getElementById( "searchResults" ).innerText = "";
        return;
    }

    // Split search terms into list of uppercase words.
    var searchWordsUpperCase = document.getElementById( "searchEdit" ).value.toUpperCase().split(' ');

    // Use object to store URLs as keys/properties; automatically
    // gets rid of URL duplicate
    var matchingUrls = {};
    for ( var i = 0; i < searchWordsUpperCase.length; ++i ) {
        var word = searchWordsUpperCase[i].trim();

        // This can occur when entering two (or more) consecutive
        // space characters:
        if ( word.length == 0 ) {
            continue;
        }

        // Iterate over all words in the index:
        for ( wordInIdx in idx ) {
            // Perform substring match of word in the index:
            if ( wordInIdx.indexOf( word ) != -1 ) {
                // Add URLs containing a substring match to
                // matchingUrls
                setKeysToObjArray( matchingUrls, idx[wordInIdx] );
            }
        }
    }

    displaySearchResults( searchWordsUpperCase, matchingUrls );
}

function addRefLinks(toclist,refIds)
{
    var tocString = "";
    for (var i = 0; i < toclist.length && refIds.length > 0; ++i) {
        var node = toclist[i];
        for (var j = 0; j < refIds.length;) {
            if (node.id == refIds[j]) {
                tocString += "<a class='toc' href='" + node.href + "'>" + node.text + "</a><p class='toc-par'>";
                refIds.splice( j, 1 );
            } else {
                ++j;
            }
        }
        tocString += addRefLinks( node.children, refIds );
    }
    return tocString;
}

function updateTOC(tocPath)
{
    var tocString = "";
    var breadCrumbs = "";
    var cur = tocList;
    var nextPath = "";
    var paragraph = "";
    var refIds = [];

    if ( tocPath.length > 0 ) {
        breadCrumbs = "<a href='book-about.html' onClick='updateTOC([])'><u>Home</u></a>";
        for ( var i = 0; i < tocPath.length; ++i ) {
            var node = cur[tocPath[i]];
            nextPath += (i > 0 ? "," : "") + tocPath[i];
            paragraph += (i > 0 ? "." : "") + ( 1 + tocPath[i] );
            var s = "<a href='" + node.href + "' onClick='updateTOC([" + nextPath + "])' target='body'><u>" + node.text + "</u></a>";
            breadCrumbs += " > " + s;
            cur = node.children;
            refIds = refIds.concat(node.refs);
        }
        nextPath += ",";
        paragraph += ".";
    }
    document.getElementById( "toc-breadcrumbs" ).innerHTML = breadCrumbs;
    for ( var i = 0; i < cur.length; ++i ) {
        var node = cur[i];
        var s = "<a class='toc' href='" + node.href + "'";
        if ( node.children.length > 0 )
            s += " onClick='updateTOC([" + nextPath + i + "])'";
        s += ">" + paragraph + ( i + 1 ) + ". " + node.text + "</a><p class='toc-par'>";
        tocString += s;
    }
    var seeAlso = addRefLinks( tocList, refIds );
    if ( seeAlso != "" )
        tocString += "<p><span style='font-weight:700'>See also</span></p>" + seeAlso;
    // FIXME, IE/Edge need this or else the a-target becomes the window
    setTimeout(function() {
        document.getElementById( "toc-div" ).innerHTML = tocString;
    }, 0);
}

function tocAndSearchInitOnLoad() {
    updateTOC([]);
    tocString = null;

    // Check if there are search args; if so, assume them to be
    // be "?q=some_search_string" and perform a search for that
    // search string right away; this way URLs like...
    //
    //  https://doc.froglogic.com/squish/5.0/index.html?q=click
    //
    // ...would be valid and would perform a search automatically.
    if ( window.location.search.length > 0
        && window.location.search.indexOf( "?q=" ) == 0 ) {
        document.getElementById( "searchEdit" ).value = decodeURI( window.location.search.substr( 3 ) );
        updateSearch();
        setSearchDIVVisible();
    } else {
        setTOCDIVVisible()
    }
}
