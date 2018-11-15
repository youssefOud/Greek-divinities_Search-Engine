function getGodsInfo(){
    document.getElementById("resultTable").style.display="block";
    var abode = []
    var gender = []
    var godOf = []
    var image = []
    var nameOfGod = []
    var symbols = []
    var siblings = []
    var parents = []
    var children = []
    var consorts = []
    var URL = 'https://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&query=';
    var suffix = '&format=application%2Fsparql-results%2Bjson&CXML_redir_for_subjs=121&CXML_redir_for_hrefs=&timeout=30000&debug=on&run=+Run+Query+';
    var generalQuery = `
        select ?uri as ?resource, STR(?n) as ?nameOfGod, ?image, STR(?go) as ?GodOf,STR(?abode) as ?Abode, if(bound(?ge), STR(?ge), if(regex(?go,"God .*") , "Male","Female")) as ?Gender where {
        ?uri dbp:name ?n;
        dbp:godOf ?go;
        dbp:type ?t;
        dbp:godOf ?go.

        optional{?uri dbo:thumbnail ?image}.

        optional{
        ?uri dbp:abode ?a. 
        ?a rdfs:label ?abode.
        FILTER(lang(?abode)="en")}.

        optional{?uri foaf:gender ?ge}.

        Filter(regex(?t,".*Greek.*") and regex(?n,".*`+$("#GodName").val()+`( |$)","i"))}
        `
    var siblingsQuery = `
        SELECT DISTINCT STR(?sibling) as ?Sibling
        WHERE {
        ?uri dbp:name ?n;
        dbp:godOf ?go;
        dbp:type ?t.
        FILTER(regex(?t,".*Greek.*") and regex(?n,".*`+$("#GodName").val()+`( |$)","i"))

        {
        VALUES ?N { 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30} 
        ?uri dbp:siblings ?siblings.
        FILTER(!isBlank(?siblings) and isLiteral(?siblings))
        BIND(replace(?siblings, " and ", " ") as ?sibStr)
        BIND (concat("^([^,]*,){", str(?N) ,"} *") AS ?skipN)
        BIND (replace(replace(?sibStr, ?skipN, ""), ",.*$", "") AS ?sibling)
        }
        UNION 
        {
            {?uri dbp:siblings ?siblings.}
            UNION
            {?siblings dbp:siblings ?uri.}

            ?siblings dbp:godOf ?go2;
            dbp:type ?t;
            dbp:name ?sibling.
            
            Filter(isLiteral(?sibling))
        }}
        `

    var symbolsQuery = `
        select DISTINCT STR(?symbol) as ?Symbol where {
        ?uri dbp:name ?n;
        dbp:godOf ?go;
        dbp:type ?t.
        {
            ?uri dbp:symbol ?symbols.
            ?symbols rdfs:label ?symbol.
            FILTER(!isLiteral(?symbols) and lang(?symbol)="en")
        }
        UNION
        {
            ?uri dbp:symbol ?symbol.
            FILTER(isLiteral(?symbol))
        }
    
        Filter(regex(?t,".*Greek.*") and regex(?n,".*`+$("#GodName").val()+`( |$)","i"))
        }`

    var childrenQuery = `
        SELECT DISTINCT STR(?child) as ?Children
        WHERE {
        ?uri dbp:name ?n;
        dbp:godOf ?go;
        dbp:type ?t.
        FILTER(regex(?t,".*Greek.*") and regex(?n,".*`+$("#GodName").val()+`( |$)","i"))
        
        {
            VALUES ?N { 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30} 
            ?uri dbp:children ?childrenStr.
            FILTER(!isBlank(?childrenStr)  and isLiteral(?childrenStr))
            BIND(replace(?childrenStr, " and ", " ") as ?childStr)
            BIND (concat("^([^,]*,){", str(?N) ,"} *") AS ?skipN)
            BIND (replace(replace(?childStr, ?skipN, ""), ",.*$", "") AS ?child)
        }
        UNION 
        {
            {?uri dbp:children ?children.}
            UNION
            {?children dbp:parents ?uri.}

            ?children dbp:type ?t;
            dbp:name ?child.
            
            Filter(isLiteral(?child))
        }  
        }
    `
    var parentsQuery = `
        select DISTINCT ?parent  where 
        {
        ?uri dbp:name ?child;
        dbp:godOf ?go;
        dbp:type ?t.
        Filter(regex(?t,".*Greek.*") and regex(?child,".*`+$("#GodName").val()+`( |$)","i"))
        {
            ?uri dbp:parents ?parents.
            FILTER(!isBlank(?parents) and isLiteral(?parents))
            VALUES ?N1 { 1 2 3 4} 
            BIND(replace(?parents, " and ", ",") as ?parentStr)
            BIND (concat("^([^,]*,){", str(?N1) ,"} *") AS ?skipN1)
            BIND (replace(replace(?parentStr, ?skipN1, ""), ",.*$", "") AS ?parent)
        }
        UNION
        {
            ?uri dbp:parents ?parents.
            ?parents dbp:name ?parent.
            FILTER(isLiteral(?parent))
        }
        }`
    var consortsQuery = `
        SELECT DISTINCT STR(?consort) as ?Consorts
        WHERE {
        {
            ?uri dbp:name ?n;
            dbp:godOf ?go;
            dbp:type ?t.
            FILTER(regex(?t,".*Greek.*") and regex(?n,".*`+$("#GodName").val()+`( |$)","i"))
            ?consortRes dbp:consort ?ourGod;
            dbp:type ?t.
            FILTER(!isBlank(?ourGod) and isLiteral(?ourGod))
            VALUES ?N1 { 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20} 
            BIND(replace(?ourGod, " and ", " ") as ?ourGodStr)
            BIND (concat("^([^,]*,){", str(?N1) ,"} *") AS ?skipN1)
            BIND (replace(replace(?ourGodStr, ?skipN1, ""), ",.*$", "") AS ?ourGodName)
            FILTER(regex(?ourGodName, ?n, "i"))
            ?consortRes dbp:name ?consort.
        }
        UNION 
        {
            ?uri dbp:name ?n;
            dbp:godOf ?go;
            dbp:type ?t.
            FILTER(regex(?t,".*Greek.*") and regex(?n,".*`+$("#GodName").val()+`( |$)","i"))
            ?consortRes dbp:consort ?ourGod;
            dbp:type ?t.   
            ?ourGod dbp:type ?t;
            dbp:name ?ourGodName.
            FILTER(regex(?ourGodName, ?n, "i"))
            ?consortRes dbp:name ?consort.
        }
        }`

    var consortsQuery2 = `
        select DISTINCT STR(?consort) as ?Consort where {
        ?uri dbp:name ?n;
        dbp:godOf ?go;
        dbp:type ?t.
        Filter(regex(?t,".*Greek.*") and regex(?n,".*`+$("#GodName").val()+`( |$)"))

        {
            VALUES ?N { 1 2 3 4} 
            ?uri dbp:consort ?consorts.
            FILTER(!isBlank(?consorts) and isLiteral(?consorts))
            BIND(replace(?consorts, " and ", ",") as ?consortStr)
            BIND (concat("^([^,]*,){", str(?N) ,"} *") AS ?skipN)
            BIND (replace(replace(?consortStr, ?skipN, ""), ",.*$", "") AS ?consort)
        }
        UNION
        {
            ?uri dbp:consort ?consorts.
            ?consorts dbp:type ?t;
            dbp:name ?consort.
        }
        }
    `
    var encodedGeneralQuery = URL+encodeURI(generalQuery)+suffix
    var encodedSiblingsQuery = URL+encodeURI(siblingsQuery)+suffix
    var encodedSymbolsQuery = URL+encodeURI(symbolsQuery)+suffix
    var encodedChildrenQuery = URL+encodeURI(childrenQuery)+suffix
    var encodedParentsQuery = URL+encodeURI(parentsQuery)+suffix
    var encodedConsortsQuery = URL+encodeURI(consortsQuery)+suffix
    var encodedConsortsQuery2 = URL+encodeURI(consortsQuery2)+suffix

    $.ajax({ 
        url: encodedGeneralQuery, 
        success: function(result) {
            var results = result.results.bindings; 
                var results = result.results.bindings; 
            var results = result.results.bindings; 
            for (var res in results) {
                tmpAbode = results[res].Abode.value;   
                if (abode.indexOf(" " + tmpAbode) === -1) abode.push(" " + tmpAbode)
                tmpGender = results[res].Gender.value;
                if (gender.indexOf(tmpGender) === -1) gender.push(tmpGender)
                tmpGodOf = results[res].GodOf.value;
                if (godOf.indexOf(" " + tmpGodOf) === -1) godOf.push(" " + tmpGodOf)
                tmpImage = results[res].image.value;
                if (image.indexOf(tmpImage) === -1) image.push(tmpImage)
                tmpNameOfGod = results[res].nameOfGod.value;
                if (nameOfGod.indexOf(tmpNameOfGod) === -1) nameOfGod.push(tmpNameOfGod)
            }
            document.getElementById('godName').innerHTML=$("#GodName").val();
            document.getElementById('godFunction').innerHTML=godOf;
            document.getElementById('godGender').innerHTML=gender;
            document.getElementById('godImage').src=image;
            document.getElementById('godImage').alt=$("#GodName").val();
            document.getElementById('godAbode').innerHTML=abode;
        } 
    }); 
        
    $.ajax({ 
        url: encodedSiblingsQuery, 
        success: function(result) {
            var results = result.results.bindings; 
            for (var res in results) {
                sibling = results[res].Sibling.value
                if (siblings.indexOf(" " + sibling) === -1) siblings.push(" " + sibling)
            }
            document.getElementById('godSiblings').innerHTML=siblings;
        } 
    }); 

    $.ajax({ 
        url: encodedSymbolsQuery, 
        success: function(result) {
            var results = result.results.bindings; 
            for (var res in results) {
                symbol = results[res].Symbol.value
                if (symbols.indexOf(" " + symbol) === -1) symbols.push(" " + symbol)
            }
            document.getElementById('godSymbol').innerHTML=symbols;
        } 
    }); 
        
    $.ajax({ 
        url: encodedChildrenQuery, 
        success: function(result) {
            var results = result.results.bindings; 
            for (var res in results) {
                child = results[res].Children.value
                if (children.indexOf(" " + child) === -1) children.push(" " + child)
            }
            document.getElementById('godChildren').innerHTML=children;
        } 
    }); 
        
    $.ajax({ 
        url: encodedParentsQuery, 
        success: function(result) {
            var results = result.results.bindings; 
            for (var res in results) {
                parent = results[res].parent.value
                if (parents.indexOf(" " + parent) === -1) parents.push(" " + parent)
            }
            document.getElementById('godParents').innerHTML=parents;
        } 
    }); 
        
    $.ajax({ 
        url: encodedConsortsQuery, 
        success: function(result) {
            var results = result.results.bindings; 
            for (var res in results) {
                consort = results[res].Consorts.value
                if (consorts.indexOf(" " + consort) === -1) consorts.push(" " + consort)
                console.log(" " + consort)
                console.log(consorts)
            }
        } 
    }).then($.ajax({ 
        url: encodedConsortsQuery2, 
        success: function(result) {
            var results = result.results.bindings; 
            for (var res in results) {
                consort = results[res].Consort.value
                if (consorts.indexOf(" " + consort) === -1) consorts.push(" " + consort)
            }
            document.getElementById('godConsorts').innerHTML=consorts;
        } 
    }))
}