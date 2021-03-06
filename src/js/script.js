var godsArray = []

function hideTab(){
    //Function to hide the tab when the home button is clicked
    document.getElementById("resultTable").style.display = "none";
    document.getElementById("familyTree").style.display = "none";
    document.getElementById("GodName").value = "";
    document.getElementById("homePic").style.display = "initial";
}


function getGodsInfo() {

    //Function to maje the tab visible
    document.getElementById("resultTable").style.display = "initial";
    document.getElementById("homePic").style.display = "none";

    //Transform the name of the god with the good capital letters

    var godNamewithGoodCaps= ($("#GodName").val().charAt(0)).toUpperCase();
    
    for (var i = 1; i < $("#GodName").val().length; i++) {
            godNamewithGoodCaps += ($("#GodName").val().charAt(i)).toLowerCase();
           
    }

    if (godsArray.indexOf(godNamewithGoodCaps) !== -1) {
        document.getElementById("resultTable").style.display="block";
        document.getElementById("familyTree").style.display = "block";
        document.getElementById("noGodFound").style.display="none";

    }
    if (godsArray.indexOf(godNamewithGoodCaps) === -1) {
        document.getElementById("resultTable").style.display="none";
        document.getElementById("familyTree").style.display = "none";
        document.getElementById("noGodFound").style.display="block";
    }


    


    //Display loading while data is loading
    document.getElementById('godImage').src = "./style/img/LoadingImage.jpg"
    document.getElementById('godGender').innerHTML = "Loading..";
    document.getElementById('godAbode').innerHTML= "Loading..";
    document.getElementById('godSiblings').innerHTML= "Loading..";
    document.getElementById('godSymbol').innerHTML= "Loading..";
    document.getElementById('godChildren').innerHTML= "Loading..";
    document.getElementById('godParents').innerHTML= "Loading..";
    document.getElementById('godConsorts').innerHTML = "Loading..";
    document.getElementById('godGames').innerHTML = "Loading..";
    document.getElementById('godMovies').innerHTML = "Loading..";
    document.getElementById('godArtPieces').innerHTML = "Loading..";
    document.getElementById('godName').innerHTML = "Loading..";




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
    var games = []
    var movies = []
    var artPieces = []
    var URL = 'https://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&query=';
    var suffix = '&format=application%2Fsparql-results%2Bjson&CXML_redir_for_subjs=121&CXML_redir_for_hrefs=&timeout=30000&debug=on&run=+Run+Query+';
    

    /////////////////////////Sparql queries//////////////////////////////////////////////////

    //Pour plus d'infos sur chaque requête, merci de se référer à l'annexe du compte rendu pdf. 
    var generalQuery = `
        select ?uri as ?resource, STR(?n) as ?nameOfGod, ?image, STR(?go) as ?GodOf,STR(?abode) as ?Abode, if(EXISTS{?uri foaf:gender ?ge}, STR(?ge),(if(regex(?GodOf,".*God .*","i"), "Male",(if(regex(?GodOf,".*Goddess .*","i"), "Female","Not specified"))))) as ?Gender where {

    ?uri dbp:name ?n;
    dbp:type ?t.
    
    Filter(regex(?t,".*Greek.*") and datatype(?n)=rdf:langString and regex(?n, ".*`+godNamewithGoodCaps+`(_| |$)"))
    
    {
        ?uri dbp:godOf ?go.
        FILTER(isLiteral(?go))
    }
    UNION
    {
        ?uri dbp:godOf ?goresource.
        ?goresource rdfs:label ?go.
        FILTER(isLiteral(?go) and lang(?go)="en")
    }
    
    optional{?uri dbo:thumbnail ?image}.

    
    optional{
        ?uri dbp:abode ?a. 
        ?a rdfs:label ?abode.
        FILTER(lang(?abode)="en")
    }.
    
    optional{?uri foaf:gender ?ge}.
    }
        `
        
    var siblingsQuery = `
    SELECT DISTINCT STR(?sibling) as ?Sibling WHERE 
        {
        ?uri dbp:name ?n;
        dbp:godOf ?go;
        dbp:type ?t.
        FILTER(regex(?t,".*Greek.*") and regex(?n,".*`+godNamewithGoodCaps+`( |$)","i"))

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
            
            Filter(isLiteral(?sibling) and datatype(?sibling)=rdf:langString)
        }
        }
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
    
        Filter(regex(?t,".*Greek.*") and regex(?n,".*`+godNamewithGoodCaps+`( |$)","i"))
        }`

    var childrenQuery = `
    SELECT DISTINCT STR(?child) as ?Children
    WHERE {
      ?uri dbp:name ?n;
      dbp:godOf ?go;
      dbp:type ?t.
      FILTER(regex(?t,".*Greek.*") and regex(?n,".*`+godNamewithGoodCaps+`( |$)","i"))
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
    
         ?children rdfs:label ?child.
         
         Filter(isLiteral(?child) and lang(?child)="en")
      }  
    }
    `

    var childrenQuery2 = `
    SELECT DISTINCT STR(?child) as ?Children
    WHERE {
    {
        ?uri dbp:name ?n;
        dbp:godOf ?go;
        dbp:type ?t3.
        FILTER(regex(?t3,".*Greek.*") and regex(?n,".*`+godNamewithGoodCaps+`( |$)","i"))
        ?childRes dbp:parents ?parents;
        dbp:type ?t3.
        FILTER(!isBlank(?parents) and isLiteral(?parents))
        VALUES ?N1 { 1 2 3 4}
        BIND(replace(?parents, " and ", " ") as ?parentStr)
        BIND (concat("^([^,]*,){", str(?N1) ,"} *") AS ?skipN1)
        BIND (replace(replace(?parentStr, ?skipN1, ""), ",.*$", "") AS ?parent)
        FILTER(regex(?parent, ?n))
        ?childRes dbp:name ?child.
        FILTER( datatype(?child)=rdf:langString)
    }
    UNION 
    {
        ?childRes dbp:parents ?parents;
        dbp:type ?t3.   
        ?parents dbp:type ?t3;
        dbp:name ?parentName.
        FILTER(regex(?parentName, ".*`+godNamewithGoodCaps+`( |$)", "i"))
        ?childRes dbp:name ?child.
        FILTER( datatype(?child)=rdf:langString)
    }
    }
    `

    var parentsQuery = `
        select DISTINCT ?parent  where 
        {
        ?uri dbp:name ?child;
        dbp:godOf ?go;
        dbp:type ?t.
        Filter(regex(?t,".*Greek.*") and regex(?child,".*`+godNamewithGoodCaps+`( |$)","i"))
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
        select DISTINCT STR(?consort) as ?Consorts where 
        {
            ?uri dbp:name ?n;
            dbp:godOf ?go;
            dbp:type ?t.
            Filter(regex(?t,".*Greek.*") and regex(?n,".*`+ godNamewithGoodCaps +`( |$)","i"))
        {
            VALUES ?N { 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20}
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
            FILTER(datatype(?consort)=rdf:langString)
        }
    }
    `

    var consortsQuery2 = `
    SELECT DISTINCT STR(?consort) as ?Consorts
    WHERE {
      {
         ?uri dbp:name ?n;
         dbp:godOf ?go;
         dbp:type ?t.
         FILTER(regex(?t,".*Greek.*") and regex(?n,".*`+godNamewithGoodCaps+`( |$)","i"))
    
         ?consortRes dbp:consort ?ourGod;
         dbp:type ?t.
         FILTER(!isBlank(?ourGod) and isLiteral(?ourGod))
    
         VALUES ?N1 { 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20}
         BIND(replace(?ourGod, " and ", " ") as ?ourGodStr)
         BIND (concat("^([^,]*,){", str(?N1) ,"} *") AS ?skipN1)
         BIND (replace(replace(?ourGodStr, ?skipN1, ""), ",.*$", "") AS ?ourGodName)
         FILTER(regex(?ourGodName, CONCAT(?n,"( |$)"), "i"))
         ?consortRes dbp:name ?consort.
      }
      UNION 
      {
         ?uri dbp:name ?n;
         dbp:godOf ?go;
         dbp:type ?t.
         FILTER(regex(?t,".*Greek.*") and regex(?n,".*`+godNamewithGoodCaps+`( |$)","i"))
         ?consortRes dbp:consort ?ourGod;
         dbp:type ?t.   
         ?ourGod dbp:type ?t;
         dbp:name ?ourGodName.
         FILTER(regex(?ourGodName, CONCAT(?n,"( |$)"), "i"))
         ?consortRes dbp:name ?consort.
      }
    } 
    
        `
    
    var gamesQuery = `
       select Distinct(STR(?label)) as ?game where{
      ?uri rdf:type dbo:VideoGame;
           dbo:abstract ?abstract;
           rdfs:label ?label;
           dct:subject ?subject;
           rdf:type ?type.
      Filter(( lang(?label)="en" and lang(?abstract)="en" ) and ( regex(?abstract,"`+godNamewithGoodCaps+`( |,|;|\\\\.)")  and !regex(?abstract,"Zeus Software") and  (regex(?type,"mytholog","i")  ||  regex(?abstract,"mytholog","i") ||  regex(?subject,"mytholog","i")  ||  regex(?abstract," god( |,|;|.//)","i")  )  ))
}
        `


    var moviesQuery=`
        select Distinct(STR(?label)) as ?movie , ?uri where{
      ?uri rdf:type dbo:Film;
           dbo:abstract ?abstract;
           rdfs:label ?label;
           rdf:type ?type.
      Filter(( lang(?label)="en" and lang(?abstract)="en" ) and ( regex(?abstract,"`+godNamewithGoodCaps+`( |,|;|\\\\.)")  and  (regex(?type,"mytholog","i")  ||  regex(?abstract,"mytholog","i")   ||  regex(?abstract," god( |,|;|.//)","i")  )  ))
}

        `

         var artQuery=`
       select Distinct(STR(?label)) as ?artPiece where{
      ?uri rdf:type dbo:Artwork;
           dbo:abstract ?abstract;
           rdfs:label ?label;
           dct:subject ?subject;
           rdf:type ?type.
      Filter(( lang(?label)="en" and lang(?abstract)="en" ) and ( regex(?abstract,"`+godNamewithGoodCaps+`( |,|;|\\\\.)") and (regex(?type,"mytholog","i")  ||  regex(?abstract,"mytholog","i") ||  regex(?subject,"mytholog","i")  ||  regex(?abstract," god( |,|;|.//)","i")  )  ))
}

        `

        

    var encodedGeneralQuery = URL + encodeURI(generalQuery) + suffix
    var encodedSiblingsQuery = URL+encodeURI(siblingsQuery)+suffix
    var encodedSymbolsQuery = URL+encodeURI(symbolsQuery)+suffix
    var encodedChildrenQuery = URL+encodeURI(childrenQuery)+suffix
    var encodedChildrenQuery2 = URL+encodeURI(childrenQuery2)+suffix
    var encodedParentsQuery = URL+encodeURI(parentsQuery)+suffix
    var encodedConsortsQuery = URL + encodeURI(consortsQuery) + suffix
    var encodedConsortsQuery2 = URL + encodeURI(consortsQuery2) + suffix
    var encodedGamesQuery = URL + encodeURI(gamesQuery) + suffix
    var encodedMoviesQuery = URL + encodeURI(moviesQuery) + suffix
    var encodedArtQuery = URL + encodeURI(artQuery) + suffix



    $.ajax({ 
        url: encodedGeneralQuery, 
        success: function(result) {
            var results = result.results.bindings;
            for (var res in results) {
                if (typeof (results[res].Abode) !== 'undefined') {
                    tmpAbode = results[res].Abode.value;
                    if (abode.indexOf(" " + tmpAbode) === -1) abode.push(" " + tmpAbode)
                }
                if (typeof (results[res].Gender) !== 'undefined') {
                    tmpGender = results[res].Gender.value;
                    if (gender.indexOf(tmpGender) === -1) gender.push(tmpGender)
                }
                if (typeof (results[res].GodOf) !== 'undefined') {
                    tmpGodOf = results[res].GodOf.value;
                    if (godOf.indexOf(" " + tmpGodOf) === -1) godOf.push(" " + tmpGodOf)
                }
                if (typeof (results[res].image) !== 'undefined') {
                    tmpImage = results[res].image.value;
                    if (image.indexOf(tmpImage) === -1) image.push(tmpImage)
                }
                if (typeof (results[res].nameOfGod) !== 'undefined') {
                    tmpNameOfGod = results[res].nameOfGod.value;
                    if (nameOfGod.indexOf(tmpNameOfGod) === -1) nameOfGod.push(tmpNameOfGod)
                }
            }

            if (nameOfGod.length == 0) document.getElementById('godName').innerHTML = "No name found";
            else {
                document.getElementById('godName').innerHTML = godNamewithGoodCaps;
                document.getElementById('MyGod').innerHTML=$("#GodName").val();
            }
            
            if (godOf.length == 0) document.getElementById('godFunction').innerHTML = "No function found";
            else document.getElementById('godFunction').innerHTML = godOf;

            if (gender.length == 0) document.getElementById('godGender').innerHTML = "No Gender found";
            else document.getElementById('godGender').innerHTML = gender;

            if (image.length == 0) document.getElementById('godImage').src = "style/img/imageNotFound.png"
            else {
                document.getElementById('godImage').src = image;
                document.getElementById('godImage').alt = godNamewithGoodCaps;
            }

            if (abode.length == 0) document.getElementById('godAbode').innerHTML = "No abode found";
            else document.getElementById('godAbode').innerHTML=abode;
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
            siblings = sortSiblings(siblings)
            if (siblings.length == 0) document.getElementById('godSiblings').innerHTML = "No siblings found";
            else document.getElementById('godSiblings').innerHTML=siblings;
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
            if (symbols.length == 0) document.getElementById('godSymbol').innerHTML = "No symbols found";
            else document.getElementById('godSymbol').innerHTML=symbols;
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
        } 
    }).then($.ajax({ 
        url: encodedChildrenQuery2, 
        success: function(result) {
            var results = result.results.bindings;
            for (var res in results) {
                child = results[res].Children.value
                if (children.indexOf(" " + child) === -1) children.push(" " + child)
            }
            if (children.length == 0) document.getElementById('godChildren').innerHTML = "No child found";
            else document.getElementById('godChildren').innerHTML=children;
        } 
    }))

    $.ajax({ 
        url: encodedParentsQuery, 
        success: function(result) {
            var results = result.results.bindings; 
            var Mom=0;
            var Dad=0;
            for (var res in results) {
                parent = results[res].parent.value
                parent = rephrase(parent)
                if (parents.indexOf(" " + parent) === -1) parents.push(" " + parent)
                if (typeof results[0].parent.value !== 'undefined') Mom = rephrase(results[0].parent.value)
                if (typeof results[1].parent.value !== 'undefined') Dad = rephrase(results[1].parent.value)
            }
            if (parents.length == 0) document.getElementById('godParents').innerHTML = "No parent found";
            else document.getElementById('godParents').innerHTML=parents;
            if (Mom === 0) document.getElementById('Mom').innerHTML="<div class=\"parent\">No second parent found</div>"
            else document.getElementById('Mom').innerHTML="<div class=\"parent\" onclick=\"newSearch('"+Mom+"')\">"+Mom+"</div>";
            if (Dad === 0) document.getElementById('Dad').innerHTML="<div class=\"parent\">No parent found</div>"
            else document.getElementById('Dad').innerHTML="<div class=\"parent\" onclick=\"newSearch('"+Dad+"')\">"+Dad+"</div>";
        } 
    });     
        
    $.ajax({
        url: encodedConsortsQuery,
        success: function (result) {
            var results = result.results.bindings;
            for (var res in results) {
                consort = results[res].Consorts.value
                if (consorts.indexOf(" " + consort) === -1) consorts.push(" " + consort)
            }
        }
    }).then($.ajax({
        url: encodedConsortsQuery2,
        success: function (result) {
            var results = result.results.bindings;
            for (var res in results) {
                consort = results[res].Consorts.value
                if (consorts.indexOf(" " + consort) === -1) consorts.push(" " + consort)
            }
            if (consorts.length == 0) document.getElementById('godConsorts').innerHTML = "No consorts found";
            else document.getElementById('godConsorts').innerHTML = consorts;
        }
    }));

    $.ajax({
        url: encodedGamesQuery,
        success: function (result) {
            var results = result.results.bindings;
            for (var res in results) {
                game = results[res].game.value
                if (games.indexOf(" " + game) === -1) games.push(" " + game)
            }
            if (games.length == 0) document.getElementById('godGames').innerHTML = "No games found";
           else document.getElementById('godGames').innerHTML = games;
        }
    });

    $.ajax({
        url: encodedMoviesQuery,
        success: function (result) {
            var results = result.results.bindings;
            for (var res in results) {
                movie = results[res].movie.value
                if (movies.indexOf(" " + movie) === -1) movies.push(" " + movie)
            }
            if (movies.length == 0) document.getElementById('godMovies').innerHTML = "No movies found";
           else document.getElementById('godMovies').innerHTML = movies;
        }
    });

    $.ajax({
        url: encodedArtQuery,
        success: function (result) {
            var results = result.results.bindings;
            for (var res in results) {
                artPiece = results[res].artPiece.value
                if (artPieces.indexOf(" " + artPiece) === -1) artPieces.push(" " + artPiece)
            }
            if (artPieces.length == 0) document.getElementById('godArtPieces').innerHTML = "No art pieces found";
            else document.getElementById('godArtPieces').innerHTML = artPieces;
        }
    });

    updateTree($("#GodName").val())
}

function updateTree(god) {

    var URL = 'https://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&query=';
    var suffix = '&format=application%2Fsparql-results%2Bjson&CXML_redir_for_subjs=121&CXML_redir_for_hrefs=&timeout=30000&debug=on&run=+Run+Query+';
    var consorts = []
    var childrenPapa = []

    var childrenPapaQuery = `
        SELECT DISTINCT STR(?child) as ?Children
        WHERE {
        ?uri dbp:name ?n;
        dbp:godOf ?go;
        dbp:type ?t.
        FILTER(regex(?t,".*Greek.*") and regex(?n,".*`+ god + `( |$)","i"))

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

    var consortsQuery = `
        SELECT DISTINCT STR(?consort) as ?Consorts
        WHERE {
        {
         ?uri dbp:name ?n;
         dbp:godOf ?go;
         dbp:type ?t.
         FILTER(regex(?t,".*Greek.*") and regex(?n,".*`+ god + `( |$)","i"))
    
         ?consortRes dbp:consort ?ourGod;
         dbp:type ?t.
         FILTER(!isBlank(?ourGod) and isLiteral(?ourGod))
    
         VALUES ?N1 { 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20}
         BIND(replace(?ourGod, " and ", " ") as ?ourGodStr)
         BIND (concat("^([^,]*,){", str(?N1) ,"} *") AS ?skipN1)
         BIND (replace(replace(?ourGodStr, ?skipN1, ""), ",.*$", "") AS ?ourGodName)
         FILTER(regex(?ourGodName, CONCAT(?n,"( |$)"), "i"))
         ?consortRes dbp:name ?consort.
      }
      UNION 
      {
         ?uri dbp:name ?n;
         dbp:godOf ?go;
         dbp:type ?t.
         FILTER(regex(?t,".*Greek.*") and regex(?n,".*`+ god +`( |$)","i"))
         ?consortRes dbp:consort ?ourGod;
         dbp:type ?t.   
         ?ourGod dbp:type ?t;
         dbp:name ?ourGodName.
         FILTER(regex(?ourGodName, CONCAT(?n,"( |$)"), "i"))
         ?consortRes dbp:name ?consort.
      }
    } `

    var consortsQuery2 = `
        SELECT DISTINCT STR(?consort) as ?Consorts
        WHERE {
            ?uri dbp:name ?n;
            dbp:godOf ?go;
            dbp:type ?t.
            Filter(regex(?t,".*Greek.*") and regex(?n,".*`+ god +`( |$)","i"))
        {
            VALUES ?N { 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20}
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
            FILTER(datatype(?consort)=rdf:langString)
        }
    } `
        
    var encodedChildrenPapaQuery = URL + encodeURI(childrenPapaQuery) + suffix
    var encodedConsortsQuery = URL + encodeURI(consortsQuery) + suffix
    var encodedConsortsQuery2 = URL + encodeURI(consortsQuery2) + suffix

    var tabConsorts = "<table class=\"consortsTable\" id=\"consortsAndChildren\" style=\"width:100%\"><tr>"
    var tabChildren= ""
    $.ajax({
        url: encodedChildrenPapaQuery,
        success: function (result) {
            var results = result.results.bindings;
            for (var res in results) {
                child = results[res].Children.value
                if (childrenPapa.indexOf(child) === -1) childrenPapa.push(child)
            }
        }
    });
    var consorts = []
    $.ajax({ 
        url: encodedConsortsQuery,
        success: function(result) {
            var results = result.results.bindings;
            for (var res in results) {
                consort = results[res].Consorts.value
                if (consorts.indexOf(consort) === -1) {
                    consorts.push(consort);
                    tabConsorts+="<td><div class=\"consort\" onclick=\"newSearch('"+consort+"')\">"+consort+"</div></td>"
                }
            }
        } 
    }).then($.ajax({
        url: encodedConsortsQuery2,
        success: function (result) {
            var results = result.results.bindings;
            for (var res in results) {
                consort = results[res].Consorts.value
                if (consorts.indexOf(consort) === -1) {
                    consorts.push(consort);
                    tabConsorts += "<td><div class=\"consort\" onclick=\"newSearch('" + consort + "')\">" + consort + "</div></td>"
                }
            }
            tabConsorts += "<tr></tr>";
            for (var res in consorts) {
                consort = consorts[res]
                tabChildren += "<td class=\"children\" id=\"" + consort + "Children\"></td>"
                findCommonChild(god, consort, childrenPapa)
            }
            tabConsorts += tabChildren
            tabConsorts += "</tr></table>";
            document.getElementById('consortTable').innerHTML = tabConsorts;
        }
    }))
}

function findCommonChild(god, consort, childrenPapa) {
    var URL = 'https://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&query=';
    var suffix = '&format=application%2Fsparql-results%2Bjson&CXML_redir_for_subjs=121&CXML_redir_for_hrefs=&timeout=30000&debug=on&run=+Run+Query+';
    var childrenMaman = []


    var childrenMamanQuery = `
        SELECT DISTINCT STR(?child) as ?Children
        WHERE {
        ?uri dbp:name ?n;
        dbp:godOf ?go;
        dbp:type ?t.
        FILTER(regex(?t,".*Greek.*") and regex(?n,".*`+ consort + `( |$)","i"))

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

    var encodedChildrenMamanQuery = URL + encodeURI(childrenMamanQuery) + suffix
    var divChildren = "<div class=\"children\">";

    $.ajax({
        url: encodedChildrenMamanQuery,
        success: function (result) {
            var results = result.results.bindings;
            for (var res in results) {
                child = results[res].Children.value
                if (childrenMaman.indexOf(child) === -1) childrenMaman.push(child)
            }
            var commonChildren = childrenPapa.filter(value => -1 !== childrenMaman.indexOf(value));
            for(child in commonChildren) {
                divChildren+="<div class=\"child\" onclick=\"newSearch('"+commonChildren[child]+"')\">"+commonChildren[child]+"</div>"
            }
            divChildren+="</div>";
            if (commonChildren.length == 0) document.getElementById(consort+"Children").innerHTML = "No child found";
            else document.getElementById(consort+"Children").innerHTML=divChildren;
        }
    })
}

function rephrase(name) {
    name = name.replace('or ','');
    name = name.replace(';','');
    name = name.replace(' ?, ','');
    return name
}

function newSearch(god){
    document.getElementById("GodName").value = god
    getGodsInfo()
}

function sortSiblings(siblings){
    var newsiblings = []
    for (i in siblings){
        if(siblings[i] !==" ē")
        newsiblings.push(rephrase(siblings[i]))
    }
    return newsiblings
}