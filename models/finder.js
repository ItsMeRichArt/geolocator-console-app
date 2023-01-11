const fs = require( 'fs' );
const { default: axios } = require( "axios" );


class Finder {

    historial = [];
    dbPath = './db/database.json';

    constructor () {

        this.readData();

    }

    get paramsMapbox () {

        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit'       : 5,
            'language'    : 'es'
        }

    }

    get paramsOpenweather () {

        return {
            'appid' : process.env.OPENWEATHER_KEY,
            'units' : 'metric',
            'lang'  : 'es'
        }

    }

    get historicalCapLettersation () {

        return this.historial.map( place => {

            let words = place.split(' ');
            words = words.map( word => word[0].toUpperCase() + word.substring(1) )

            return words.join(' ');

        })

    }

    async findCity ( city = '' ) {

        try{

            const mapboxInstance = axios.create({

                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ city }.json`,
                params : this.paramsMapbox

            })

            const cityData = await mapboxInstance.get();
               
            return cityData.data.features.map( placeInfo => ({

                id      : placeInfo.id,
                name    : placeInfo.place_name,
                lenght  : placeInfo.center[0],
                latitude: placeInfo.center[1]

            }))

        }catch ( error ){
            console.log( error );
        }

    }

    async weatherByPlace ( lat, lon ) {

        try {

            const openweatherInstace = axios.create({

                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params : { ...this.paramsOpenweather, lat, lon }
                
            })
            
            const placeWeather = await openweatherInstace.get();
            const { weather, main } = placeWeather.data;
               
            return {

                min        : main.temp_min,
                max        : main.temp_max,
                temperature: main.temp,
                description: weather[0].description ,

            }

        } catch ( error ) {
            console.log( error );
        }

    }

    addHistorical ( place = '' ) {

        if( this.historial.includes( place.toLocaleLowerCase() ) ) { return; }
        
        this.historial = this.historial.splice(0,5);
        this.historial.unshift( place.toLocaleLowerCase() );  
        
        this.saveData();

    }

    saveData () {

        const payload = { historical: this.historial };
        fs.writeFileSync( this.dbPath, JSON.stringify( payload ) );

    }

    readData () {

        if( !fs.existsSync( this.dbPath ) ) return;

        const dataStoraged = fs.readFileSync( this.dbPath, { encoding: 'utf-8' } );
        const dataDisplay = JSON.parse( dataStoraged );

        this.historial = dataDisplay.historical;
 
    }

}

module.exports = Finder;