//importing modules
var express = require( 'express' );
var request = require( 'request' );
var cheerio = require( 'cheerio' );

//creating a new express server
var app = express();

//setting EJS as the templating engine
app.set( 'view engine', 'ejs' );

//setting the 'assets' directory as our static assets dir (css, js, img, etc...)
app.use( '/assets', express.static( 'assets' ) );

var estimation = {
    Title: "Estimation of the good",
    AverageP: 0,
    Verdict: "",
}
var donneesLBC = {
    prix: 0,
    ville: 0,
    type: 0,
    surface: 0,
}
var med = {
    Mediumprix: 0,
}

app.get( '/', function ( req, res ) {
    if ( req.query.lienLBC ) {
        request( req.query.lienLBC, function ( error, response, body ) {

            if ( !error && response.statusCode == 200 ) {
                const $ = cheerio.load( body )
                const donneesLBCArray = $( 'section.properties span.value' )
                donneesLBC = {
                    prix: parseInt( $( donneesLBCArray.get( 0 ) ).text().replace( /\s/g, '' ), 10 ),
                    ville: $( donneesLBCArray.get( 1 ) ).text().trim().toLowerCase().replace( /\_|\s/g, '-' ),
                    type: $( donneesLBCArray.get( 2 ) ).text().trim().toLowerCase(),
                    surface: parseInt( $( donneesLBCArray.get( 4 ) ).text().replace( /\s/g, '' ), 10 )
                }
                med.Mediumprix = donneesLBC.prix / donneesLBC.surface

            }
            else { console.log( error ) }
        }
        )
    }

    var url = 'https://www.meilleursagents.com/prix-immobilier/' + donneesLBC.ville.toLowerCase

    request( url, function ( error, response, body ) {
        if ( !error && response.statusCode == 200 ) {
            const $ = cheerio.load( body );
            var AverageP = "";
            var a = $( this )
            if ( type == "Appartement" ) {
                if ( a.children()[0].next.data == "Prix m² appartement" ) {
                    AverageP = a.next().next().text();
                    AverageP = AverageP.substring( 14, 19 );
                    AverageP = AverageP.split( " " );
                    estimation.AverageP = AverageP[0] + AverageP[1];
                }
            }
            if ( type == "Maison" ) {
                if ( a.children()[0].next.data == "Prix m² maison" ) {
                    AverageP = a.next().next().text();
                    AverageP = AverageP.substring( 14, 19 );
                    AverageP = AverageP.split( " " );
                    estimation.AverageP = AverageP[0] + AverageP[1];
                }
            }
        }
    })


    if ( estimation.AverageP < med.Mediumprix ) {
        estimation.Verdict = "prix is too expensive, don't buy the good";
    }
    else if ( estimation.AverageP == med.Mediumprix ) {
        estimation.Verdict = "It's a good prix to buy";

    }
    else {
        estimation.Verdict = "Beware of the good because the prix is anormally low";
    }
    //}*/
    res.render( 'home', {

        message: donneesLBC.prix,
        message2: donneesLBC.surface,
        message3: donneesLBC.ville,
        message4: donneesLBC.type,
        message5: med.Mediumprix,
        message6: estimation.AverageP,
        message7: estimation.Verdict,
    });
});


//makes the server respond to the '/' route and serving the 'home.ejs' template in the 'views' directory




//launch the server on the 3000 port
app.listen( 3000, function () {
    console.log( 'App listening on port 3000!' );
});