import React from 'react'
import '../styles/Subscribe.css'
import { useState } from 'react'

function Subscribe() {

    const [data, setData] = useState({
        email: '',
        city: ''
    })
    const [errorCity, setErrorCity] = useState('')

    const handleOnclick = async () => {
        try {
            const res = await fetch('http://localhost:3001/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors',
                credentials: 'same-origin',
                body: JSON.stringify({ email: data.email, city: data.city.toLowerCase() })
            })
            if (!res.ok) throw new Error('Error in subscribing')
            console.log('Subscribed successfully with status response ', res.status)
            setErrorCity('')
            window.location.href = '/redirect';
            alert('Subscribed successfully')
        } catch (err) {
            console.log(err)
            setErrorCity('City name not found')
        }
    }

    const handleChange = (e) => {
        setData({
            ...data,
            [e.target.name]: e.target.value
        })
    }

    return (
        <div className='subscribePage'>
            <div className='subcsribeContainer'>
                <h1>Subscribe to our service</h1>
                <input type='text'
                    onChange={handleChange}
                    name='email'
                    placeholder='Enter your email' />
                <span>{errorCity}</span>
                <input type='text' placeholder='Enter your location'
                    onChange={handleChange}
                    name='city'
                />
                <button onClick={handleOnclick}>Subscribe</button>
            </div>
        </div>

    )
}

export default Subscribe
