const express = require('express');
const request = require('request');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const cron = require('node-cron');
const app = express();
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');


const swaggerOptions = {
    swaggerDefinition: {
      info: {
        title: 'Weather API',
        description: 'Weather API Information',
        contact: {
          name: 'Developer'
        },
        servers: ['http://localhost:3001']
      }
    },
    apis: ['index.js']
  };
  
  const swaggerDocs = swaggerJsDoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
  
  /**
   * @swagger
   * /subscribe:
   *  post:
   *    description: Use to subscribe to weather updates
   *    parameters:
   *      - name: email
   *        in: body
   *        required: true
   *        schema:
   *          type: string
   *      - name: city
   *        in: body
   *        required: true
   *        schema:
   *          type: string
   *    responses:
   *      '200':
   *        description: Confirmation email sent
   *      '400':
   *        description: Email or Location is required
   *      '500':
   *        description: Error sending confirmation email or Internal Server Error
   */

  /**
 * @swagger
 * /unsubscribe:
 *  post:
 *    description: Use to unsubscribe from weather updates
 *    parameters:
 *      - name: email
 *        in: body
 *        required: true
 *        schema:
 *          type: string
 *    responses:
 *      '200':
 *        description: Unsubscribed successfully
 *      '400':
 *        description: Email is required
 *      '500':
 *        description: Error unsubscribing or Internal Server Error
 */

  /**
 * @swagger
 * /confirm:
 *  get:
 *    description: Use to confirm subscription to weather updates
 *    parameters:
 *      - name: token
 *        in: query
 *        required: true
 *        schema:
 *          type: string
 *    responses:
 *      '200':
 *        description: Subscription confirmed
 *      '400':
 *        description: Token is required
 *      '500':
 *        description: Error confirming subscription or Internal Server Error
 */

  /**
 * @swagger
 * /:
 *  get:
 *    description: Use to test the API is working
 *    responses:
 *      '200':
 *        description: API is working
 *      '500':
 *        description: Internal Server Error
 */



const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,  
    optionsSuccessStatus: 200  
};
const db = require('./models');

app.use(cors(corsOptions));
app.use(express.json());




cron.schedule('15 1 * * *', async () => {
    console.log('Sending daily weather updates');
    subscribers= await db.Subscribers.findAll()
    console.log("subcribers ", subscribers)
    for (let subscriber of subscribers) {
        if (subscriber.confirmed) {
            request(`http://api.weatherapi.com/v1/forecast.json?key=8d61147511e7469ba6850823240506&q=${subscriber.location}&days=3&aqi=yes&alerts=no`,
                function (error, response, body) {
                    if (error) {
                        console.error('Error fetching weather data:', error);
                        return;
                    }

                    let data;
                    try {
                        data = JSON.parse(body);
                    } catch (parseError) {
                        console.error('Error parsing JSON:', parseError);
                        return;
                    }

                    if (!data || !data.location || !data.current || !data.forecast) {
                        console.error('Unexpected API response structure:', data);
                        return;
                    }

                    let Weather = {
                        location: data.location.name,
                        date: data.location.localtime,
                        tempature: data.current.temp_c,
                        wind_speed: data.current.wind_kph,
                        humidity: data.current.humidity,
                        weather_icons:'https:' + data.current.condition.icon,
                        weather_descriptions: data.current.condition.text,
                        forecast: data.forecast.forecastday.map((day) => {
                            return {
                                date: day.date,
                                icon:'https:' + day.day.condition.icon,
                                temp: day.day.avgtemp_c,
                                wind_speed: day.day.maxwind_kph,
                                humanity: day.day.avghumidity
                            };
                        })
                    };
                    console.log("Weather icon link ", Weather.weather_icons);
                    let htmlContent = `
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                        }
                        h1 {
                            color: #333;
                        }
                        h2 {
                            color: #666;
                        }
                        p {
                            color: #999;
                        }
                        img {
                            width: 50px;
                            height: 50px;
                        }
                    </style>
                    <h1>Daily Weather Update</h1>
                    <h2>${Weather.location}</h2>
                    <p>Date: ${Weather.date}</p>
                    <p>Temperature: ${Weather.tempature}°C</p>
                    <p>Wind Speed: ${Weather.wind_speed} kph</p>
                    <p>Humidity: ${Weather.humidity}%</p>
                    <img src="${Weather.weather_icons}" alt="Weather icon" />
                    <p>${Weather.weather_descriptions}</p>
                    <h2>Forecast</h2>
                    ${Weather.forecast.map(day => `
                        <h3>${day.date}</h3>
                        <img src="${day.icon}" alt="Weather icon" />
                        <p>Temperature: ${day.temp}°C</p>
                        <p>Wind Speed: ${day.wind_speed} kph</p>
                        <p>Humidity: ${day.humanity}%</p>
                    `).join('')}
                `;
                    
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: 'tranvanphuongones@gmail.com',
                            pass: 'tvce uwzi ehzh gwfm'
                        }
                    });

                    const mailOptions = {
                        from: 'tranvanphuongones@gmail.com',
                        to: subscriber.email,
                        subject: 'Daily Weather Update',
                        html: htmlContent
                    };

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Daily weather update email sent');
                        }
                    });
                }
            );
        }
    }
});


app.post('/subscribe', (req, res) => {
    const email = req.body.email;
    const city = req.body.city;
    console.log("email ", email);
    console.log("city ", city);
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    if(!city){
        return res.status(400).json({ error: 'Location is required' });
    }

    try {
        request(`http://api.weatherapi.com/v1/forecast.json?key=8d61147511e7469ba6850823240506&q=${city}&days=3&aqi=yes&alerts=no`,
            function (error, response, body) {
                if (error) {
                    console.error('Error fetching weather data:', error);
                    return res.status(500).send('Internal Server Error');
                }

                let data;
                try {
                    data = JSON.parse(body);
                } catch (parseError) {
                    console.error('Error parsing JSON:', parseError);
                    return res.status(500).send('Internal Server Error');
                }

                if (!data || !data.location || !data.current || !data.forecast) {
                    console.error('Unexpected API response structure:', data);
                    return res.status(500).send('Unexpected API response structure');
                }

                console.log("data ", data);

                if (response.statusCode === 200) {
                    res.status(200)
                } else {
                    res.status(response.statusCode).send('Error: ' + response.statusText);
                }
            }
        );
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).send('Internal Server Error');
    }

   


    const token = crypto.randomBytes(16).toString('hex');


    db.Subscribers.findOrCreate({
        where: { email: email },
        defaults: { token: token, location: city, confirmed: false}

    })
    .then(([subscriber, created]) => {
        if (!created) {
            subscriber.token = token;
            subscriber.location = city;
            subscriber.confirmed = false;
            subscriber.save();
        }
    })
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'tranvanphuongones@gmail.com',
            pass: 'tvce uwzi ehzh gwfm'
        }
    });

    const mailOptions = {
        from: 'tranvanphuongones@gmail.com',
        to: email,
        subject: 'Confirm your subscription',
        text: `Please confirm your subscription by clicking on the following link: http://localhost:3001/confirm?token=${token}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).send('Error sending confirmation email');
        } else {
            res.status(200).send('Confirmation email sent');
        }
    });
});

app.get('/confirm', async (req, res) => {
    const token = req.query.token;
    //i want to select all subscriber from database 
    console.log("token in /confirm ", token);
    subscribers= await db.Subscribers.findAll()
    console.log("subcribers day ", subscribers)
    for (let subscriber of subscribers) {
        console.log("subcriber ", subscriber);
        if (subscriber.token === token) {
            subscriber.confirmed = true;
            await subscriber.save();
            return res.status(200).send('Subscription confirmed');
        }
    }
    res.status(400).send('Invalid confirmation token');
});

app.post('/unsubscribe', async(req, res) => {
    const email = req.body.email;
    console.log("email in /unsubscribe ", email);
    subscribers= await db.Subscribers.findAll()
    for (let subscriber of subscribers) {
        console.log("subcriber ", subscriber);
        if (subscriber.email === email) {
            await subscriber.destroy();
            return res.status(200).send('Unsubscribed successfully');
        }
    }
    res.status(400).send('Email not found');
});

app.get('/', (req, res) => {
    let city = req.query.city;
    console.log("city ", city);

    if (!city) {
        return res.status(400).json({ error: 'City name is required' });
    }

    try {
        request(`http://api.weatherapi.com/v1/forecast.json?key=8d61147511e7469ba6850823240506&q=${city}&days=3&aqi=yes&alerts=no`,
            function (error, response, body) {
                if (error) {
                    console.error('Error fetching weather data:', error);
                    return res.status(500).send('Internal Server Error');
                }

                let data;
                try {
                    data = JSON.parse(body);
                } catch (parseError) {
                    console.error('Error parsing JSON:', parseError);
                    return res.status(500).send('Internal Server Error');
                }

                if (!data || !data.location || !data.current || !data.forecast) {
                    console.error('Unexpected API response structure:', data);
                    return res.status(500).send('Unexpected API response structure');
                }

                console.log("data ", data);
                let Weather = {
                    location: data.location.name,
                    date: data.location.localtime,
                    tempature: data.current.temp_c,
                    wind_speed: data.current.wind_kph,
                    humidity: data.current.humidity,
                    weather_icons: data.current.condition.icon,
                    weather_descriptions: data.current.condition.text,
                    forecast: data.forecast.forecastday.map((day) => {
                        return {
                            date: day.date,
                            icon: day.day.condition.icon,
                            temp: day.day.avgtemp_c,
                            wind_speed: day.day.maxwind_kph,
                            humanity: day.day.avghumidity
                        };
                    })
                };

                if (response.statusCode === 200) {
                    res.json(Weather);
                } else {
                    res.status(response.statusCode).send('Error: ' + response.statusText);
                }
            }
        );
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get("/test", (req, res) => {
    res.send("Hello World");
});

db.sequelize.sync().then(() => {
    app.listen(3001, () => {
        console.log('Server is running on port 3001');
    });
});

