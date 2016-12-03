'use strict';
var request = require("request")
//import axios from 'axios';
//import { processCurrentWeather, processForecastWeather } from './helpers';

const APP_ID = '07976ea0d7f1371a9e527add86391b84';

function getCurrentWeather(location) {
  return (`http://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&APPID=${APP_ID}`);
}

//function getForecast(location) {
//  return  (`http://api.openweathermap.org/data/2.5/forecast/daily?q=${location}&units=metric&cnt=5&APPID=${APP_ID}`);//
//}

//export default function getWeather(location) {
function getWeather(location) {
  context.forecast = (`http://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&APPID=${APP_ID}`);
  // const forecast = getForecast(location);
}
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

  // getForecast bot executes
  ['getForecast'](sessionId, context, cb) {
    request({
      url: `http://api.openweathermap.org/data/2.5/weather?q=${context.loc}&units=metric&APPID=07976ea0d7f1371a9e527add86391b84`,
      json: true
    }, function (error, response, body) {

      if (!error && response.statusCode === 200) {
        console.log(body) // Print the json response
        context.forecast =
`
Jelenlegi idő itt:        ${context.loc} 
Most a hőmérséklet  ${response.body.main.temp} C 
A mai minimum       ${response.body.main.temp_min} C 
A mai maximum       ${response.body.main.temp_max} C 
Légnyomás           ${response.body.main.pressure} Hpa 
Páratartalom        ${response.body.main.humidity} % 
A szélsebesség      ${response.body.wind.speed} km/óra
{if  ${response.body.wind.deg} > 0 and  ${response.body.wind.deg}  < 360 then} A szél iránya Észak
`
        cb(context);

      }
    })
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
