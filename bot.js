'use strict';
var request = require("request")
//import axios from 'axios';
//import { processCurrentWeather, processForecastWeather } from './helpers';

const APP_ID = '07976ea0d7f1371a9e527add86391b84';
var irany = "";
var orsz = "";
//var date = new Date(UNIX_Timestamp * 1000);

// Weather Example
// See https://wit.ai/sungkim/weather/stories and https://wit.ai/docs/quickstart
const Wit = require('node-wit').Wit;
const FB = require('./facebook.js');
const Config = require('./const.js');

const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};



  
  
const dayMap = {
  '0': 'Sun',
  '1': 'Mon',
  '2': 'Tue',
  '3': 'Wed',
  '4': 'Thu',
  '5': 'Fri',
  '6': 'Sat'
};

const monthMap = {
  '0': 'Jan',
  '1': 'Feb',
  '2': 'Mar',
  '3': 'Apr',
  '4': 'May',
  '5': 'Jun',
  '6': 'Jul',
  '7': 'Aug',
  '8': 'Sep',
  '9': 'Oct',
  '10': 'Nov',
  '11': 'Dev'
};


function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function processDate(date = '') {
  const dateInMilliseconds = new Date(date * 1000);
  const day = dayMap[dateInMilliseconds.getDay()];
  const month = `${monthMap[dateInMilliseconds.getMonth()]} ${dateInMilliseconds.getDate()}`;
  return `${day}, ${month}`;
}




// Bot actions
const actions = {
  say(sessionId, context, message, cb) {
    console.log(message);

    // Bot testing mode, run cb() and return
    if (require.main === module) {
      cb();
      return;
    }

    // Our bot has something to say!
    // Let's retrieve the Facebook user whose session belongs to from context
    // TODO: need to get Facebook user name
    const recipientId = context._fbid_;
    if (recipientId) {
      // Yay, we found our recipient!
      // Let's forward our bot response to her.
      FB.fbMessage(recipientId, message, (err, data) => {
        if (err) {
          console.log(
            'Oops! An error occurred while forwarding the response to',
            recipientId,
            ':',
            err
          );
        }

        // Let's give the wheel back to our bot
        cb();
      });
    } else {
      console.log('Oops! Couldn\'t find user in context:', context);
      // Giving the wheel back to our bot
      cb();
    }
  },
  merge(sessionId, context, entities, message, cb) {
    // Retrieve the location entity and store it into a context field
    const loc = firstEntityValue(entities, 'location');
    if (loc) {
      context.loc = loc; // store it in context
    }

    cb(context);
  },

  error(sessionId, context, error) {
    console.log(error.message);
  },

  // getCurrent bot executes
//  ['getCurrent'](sessionId, context, cb) {
  ['getForecast'](sessionId, context, cb) {
    request({
      url: `http://api.openweathermap.org/data/2.5/weather?q=${context.loc}&units=metric&lang=hu&type=accurate&APPID=07976ea0d7f1371a9e527add86391b84`,
      json: true
    }, function (error, response, body) {

      if (!error && response.statusCode === 200) {

if ( response.body.wind.deg > 338 &&  response.body.wind.deg  < 23)  { irany = "A szél iránya Északi"; }
if ( response.body.wind.deg > 22  &&  response.body.wind.deg  < 67)  { irany = "A szél iránya Északkeleti";}
if ( response.body.wind.deg > 67  &&  response.body.wind.deg  < 102) { irany = "A szél iránya Keleti";}
if ( response.body.wind.deg > 102 &&  response.body.wind.deg  < 147) { irany = "A szél iránya Délkeleti";}
if ( response.body.wind.deg > 147 &&  response.body.wind.deg  < 193) { irany = "A szél iránya Déli";}
if ( response.body.wind.deg > 193 &&  response.body.wind.deg  < 238) { irany = "A szél iránya Délnyugati";}
if ( response.body.wind.deg > 238 &&  response.body.wind.deg  < 283) { irany = "A szél iránya Nyugati";}
if ( response.body.wind.deg > 283 &&  response.body.wind.deg  < 339) { irany = "A szél iránya Északnyugati";}
console.log(body) // Print the json response

        context.forecast =
`
${Date(response.body.dt * 1000)}
Jelenlegi idő itt:        ${context.loc} 
Most a hőmérséklet  ${response.body.main.temp} °C 
A mai minimum       ${response.body.main.temp_min} °C 
A mai maximum       ${response.body.main.temp_max} °C 
Égkép               ${response.body.weather[0].description}
Légnyomás           ${response.body.main.pressure} hPa 
Páratartalom        ${response.body.main.humidity} % 
A szélsebesség      ${response.body.wind.speed} km/óra
${irany}
`
        cb(context);

      }
    })
  },
// };

  
  
// getForecast bot executes
//  ['getForecast'](sessionId, context, cb) {
  ['getCurrent_old'](sessionId, context, cb) {
//          http://api.openweathermap.org/data/2.5/forecast/daily?APPID=07976ea0d7f1371a9e527add86391b84&q=London&units=metric&lang=hu&cnt=7
//  openweathermap.org/data/2.5/forecast/daily?APPID=07976ea0d7f1371a9e527add86391b84&q=London&units=metric&lang=hu&cnt=7
	  request({
      url: `http://api.openweathermap.org/data/2.5/forecast/daily?APPID=07976ea0d7f1371a9e527add86391b84&q=${context.loc}&units=metric&lang=hu&cnt=7`,
      json: true
    }, function (error, response, body) {

      if (!error && response.statusCode === 200) {
     console.log(body) // Print the json response

	var params = [];
	var day = new Date();

	day.setDate(day.getDate());

	      context.forecast =
`
${day.getMonth()+1+"-"+day.getDate()}:Min: ${response.body.list[0].min}°C Max: ${response.body.list[0].max}°C  ${response.body.weather[0].descripton}									 
`
day.setDate(day.getDate()+1);

        context.forecast = context.forecast +
`											 
${day.getMonth()+1+"-"+day.getDate()}:Min: ${response.body.list[1].min}°C Max: ${response.body.list[1].max}°C  ${response.body.weather[1].descripton}									 
`
        cb(context);
			
//	context.city     = context.loc;
//	context.forecast = params;
//        res.render('7Day',context);
//          cb(context);

      }
    })
  },
  ['getCurrent'](sessionId, context, cb) {
//	app.getCurrent('/',function(req,res)
	  {
				request('http://api.openweathermap.org/data/2.5/forecast/daily?APPID=07976ea0d7f1371a9e527add86391b84&q=London&units=metric&lang=hu&cnt=7', get7Day);
				
				function get7Day(err, response, body){
					if(!err && response.statusCode < 400){
						var retData = JSON.parse(body);
						var params = [];
						var day = new Date();
						var q = 0;						 
						for( q in retData.list){
						  context.forecast =  context.forecast +
							`
								${day.getMonth()+1+"-"+day.getDate()} Min: ${JSON.stringify(retData.list[q].temp.min)}  Max: ${JSON.stringify(retData.list[q].temp.max)} ${retData.list[q].weather[0].description}
							`
								day.setDate(day.getDate()+1);
							}
			
						//context.forecast = ' ${params} ';
        					cb(context);
						//res.render('7Day',context1);
					}
					else{
						console.log(err);
						console.log(response.statusCode);
					}
				}
			}  //)
		
  },
	
 };



const getWit = () => {
  return new Wit(Config.WIT_TOKEN, actions);
};

exports.getWit = getWit;

// bot testing mode
// http://stackoverflow.com/questions/6398196
if (require.main === module) {
  console.log("Bot testing mode.");
  const client = getWit();
  client.interactive();
}
