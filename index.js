require( 'dotenv' ).config();

const { leerInput, inquirerMenu, pausa, listPlaces } = require("./helpers/inquirer");
const Finder = require("./models/finder");


(async() => {

    const finder = new Finder();
    let optionMenu = 0;
    
    do{

        optionMenu = await inquirerMenu();
        
        switch( optionMenu ){

            case 1:
                //todo: Mostrar mensaje
                const searchTerm = await leerInput( 'Ciudad: ' );
                
                //todo: buscar los lugares
                const places = await finder.findCity( searchTerm );
                
                //todo: seleccionar el lugar 
                const idSelected = await listPlaces( places );
                if ( idSelected === '0' ) continue;

                const selectedPlace = places.find( place => place.id === idSelected );

                //todo: guardar en DB
                finder.addHistorical( selectedPlace.name ); 
               
                //todo: obtener el clima 
                const weather = await finder.weatherByPlace( selectedPlace.latitude, selectedPlace.lenght );
                
                //todo: mostrar resultados

                console.log( '\nInformación de la ciudad\n'.green );
                console.log( 'Nombre: '      , selectedPlace.name.green );
                console.log( 'Latitud: '     , selectedPlace.latitude );
                console.log( 'Longitud: '    , selectedPlace.lenght );
                console.log( 'Temperatura: ' , weather.temperature );
                console.log( 'Mínima: '      , weather.min);
                console.log( 'Máxima: '      , weather.max);
                console.log( 'Estado clima: ', weather.description.green );

            break;

            case 2:

                finder.historicalCapLettersation.forEach( (historicalData, idx) => {
                    const index = `${ idx + 1 }`.green;
                    console.log( `${ index } ${ historicalData }` );
                });

            break;
        }

        if ( optionMenu !== 0) await pausa();

    } while ( optionMenu != 0 );

}) ();