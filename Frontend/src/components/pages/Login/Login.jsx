import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { login, reset } from '../../../features/auth/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const message = useSelector((state) => state.auth.message)
    const status = useSelector((state) => state.auth.status)

    const [data, setData] = useState({ email: '', password: '' })
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => { dispatch(reset()) }, [])
    useEffect(() => {
        if (status && status === 'succeeded') {
            setIsSubmitting(false)
            // setData(initialValue)
            navigate('/')
        }

        if (status === 'failed') {
            setTimeout(() => {
                setIsSubmitting(false)
            }, 3000)
        }
    }, [status])

    const handleOnChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value })
    };

    const handleOnSubmit = (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        dispatch(login(data))

    };

    return (
        <div className='lookup container'>
            <h2>Login</h2>
            <form onSubmit={handleOnSubmit} >
                <input type="text" placeholder='Email' name='email' required onChange={handleOnChange} />
                <input type="password" placeholder='Password' name='password' required onChange={handleOnChange} />
                {message && <p className={status}>{message}</p>}
                <button disabled={isSubmitting}>Go</button>
            </form>
            <p>Not a user yet? <span><Link to='/register'>here</Link></span></p>
        </div>
    )
}

export default Login