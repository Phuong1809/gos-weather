import React from 'react'
import {Formik, Form, Field, ErrorMessage} from 'formik'
import * as Yup from 'yup'
import '../styles/Unsubscribe.css'

function Unsubscribe() {

    const handleOnClick = async (values) => {
        try {
            const res = await fetch('http://localhost:3001/unsubscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors',
                credentials: 'same-origin',
                body: JSON.stringify({ email:values.email })
            })
            if (!res.ok) throw new Error('Error in unsubscribing')
            console.log('Unsubscribed successfully with status response ', res.status)
        } catch (err) {
            console.log(err)
        }
        window.location.href = '/'
        alert('Unsubscribed successfully')
    }

    const validationSchema = Yup.object().shape({
        email: Yup.string().email('Invalid email').required('Email is required')
    })

    return (
        <div className='containerUnsubscribe'>
           
            <Formik onSubmit={handleOnClick} initialValues={{email:''}} validationSchema={validationSchema}>
                <Form className='contentUnsubscribe'>
                    <h1>Unsubscribe from our service</h1>
                    <ErrorMessage className='error' name='email' component='div' />
                    <Field
                        type='text'
                        placeholder='Enter your email'
                        name='email'
                    />
                    <button type='submit'>Unsubscribe</button>
                </Form>
            </Formik>
        </div>
    )
}

export default Unsubscribe
