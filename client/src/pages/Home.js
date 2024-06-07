import React from 'react'
import axios from 'axios'
import '../styles/Home.css'
import { useEffect, useState } from 'react'

function Home() {
  const [data, setData] = useState({
    celcius: 0,
    city: 'London',
    humidity: 0,
    wind_speed: 0,
    forecast: []
  })

  const [valid, setValid] = useState('')

  const handleOnClick = () => {
    if (city !== "") {
      setCity(city.toLowerCase())
      const url = `http://localhost:3001/?city=${city}`
      axios.get(url)
        .then(res => {
          setData({
            celcius: res.data.tempature,
            city: res.data.location,
            humidity: res.data.humidity,
            wind_speed: res.data.wind_speed,
            forecast:res.data.forecast
          })
          setValid('')
        })
        .catch(error => {
          setValid('City not found')
          console.log(error)
        })
    }
  }

  const [city, setCity] = useState('')
  useEffect(() => {
    const url = `http://localhost:3001/?city=ho chi minh`
    axios.get(url)
      .then((res) => {
        console.log(res.data)
        setData({
          celcius: res.data.tempature,
          city: res.data.location,
          humidity: res.data.humidity,
          wind_speed: res.data.wind_speed,
          forecast: res.data.forecast
        })
      })
      .catch((error) => {
        console.log(error)
      })
  }, [])

  return (
    <div className='container'>
      <div className='leftSide'>
        <div className='weather'>
          <div className='search'>
            <input type='text' placeholder='Search for a city' onChange={e => setCity(e.target.value)} />
            <button className='searchbtn'><img src='img/search.png' alt='Search button' onClick={handleOnClick} /></button>
          </div>
          <div className='checkValid'>
            <p>{valid}</p>
          </div>
          <div className='winfo'>
            <img src='https://cdn.weatherapi.com/weather/64x64/night/122.png' alt='Weather icon' />
            <h1>{data.celcius}°C</h1>
            <h2>{data.city}</h2>
            <div className='details'>
              <div className='col'>
                <p>{data.humidity}%</p>
                <p>Humidity</p>
              </div>
              <div className='col'>
                <p>{data.wind_speed}km/h</p>
                <p>Wind speed</p>
              </div>
            </div>

          </div>
        </div>
      </div>
      <div className='rightSide'>
        <h1>3-Day Forecast</h1>
        <div className='forecast'>
          <div className='forecastInfo'>
            <div className='day'>
              <h2>Today</h2>
              <img src={data.forecast[0]?.icon} alt='day1' />
              <p>{data.forecast[0]?.date}°C</p>
            </div>
            <div className='day'>
              <h2>Tomorrow</h2>
              <img src={data.forecast[1]?.icon} alt='day2' />
              <p>{data.forecast[1]?.date}°C</p>
            </div>
            <div className='day'>
              <h2>After Tomorrow</h2>
              <img src={data.forecast[2]?.icon} alt='day3' />
              <p>{data.forecast[2]?.date}°C</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Home
