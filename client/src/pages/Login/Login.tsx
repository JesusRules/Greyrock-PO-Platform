import React, { useRef, useState } from 'react'
import { Button, Loader, PasswordInput, TextInput, useMantineColorScheme } from '@mantine/core';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch } from "../../../redux/store";
import { loginUser } from '../../../redux/features/auth-slice';
import toast from 'react-hot-toast';
import styles from './login.module.scss';

function Login() {
    const { colorScheme } = useMantineColorScheme();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    //Refs
    const loginRef = useRef(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);
    //States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
      try {
        setLoading(true);
        const resultAction = await dispatch(loginUser({ email, password }));
        // if (isFulfilled(resultAction)) {
        if (loginUser.fulfilled.match(resultAction)) {
            navigate('/review-orders');
            setEmail('');
            setPassword('');
          } else {
            toast.error(resultAction.payload || 'Login failed');
            setLoading(false);
          }
        } catch (error) {
          setLoading(false);
          console.log('Error logging in', error);
          toast.error("Something went wrong");        
        }
    }
    
    return (
      <section className={`${styles.section} ${colorScheme === 'dark' ? 'dark' : 'light'}`}>
        <div className={styles.container}>
          <img src="/images/native-eagle.png" />
          <h1>Band Council Resolution System</h1>
          
          <div className={styles.loginDiv}>
            <h2>Welcome!</h2>
              {/* LOGIN */}
              <TextInput className='rounded-md w-full max-w-[290px] border-[1.37px] border-black mb-[1rem]' placeholder="Enter email..." onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  passwordRef.current?.focus();
                }
              }} value={email} onChange={(e) => setEmail(e.target.value)} type='text' required ref={loginRef} />
  
              {/* PASSWORD */}
              <PasswordInput className='rounded-md w-full max-w-[290px] border-[1.37px] border-black' placeholder="Enter password..." onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleLogin();
                }
              }} value={password} onChange={(e) => setPassword(e.target.value)} type='password' required ref={passwordRef} />
  
          <div className={styles.bottomDiv}>
            <Button disabled={loading} size='lg' mt={16} h={50} py={10} px={30} loading={false} 
              color={colorScheme === 'dark' ? 'dark.5' : '#6a6a6a'} // Darker gray dynamically
              onClick={(e) => {
                handleLogin();
              }} >
              {!loading && (
                  <span>Login</span>
                  )}
                {loading && (
                  <div className={styles.loaderDiv}>
                    <Loader size={20} color="white" />
                </div>
                )}
            </Button>
            </div>
          </div>
        </div>
      </section>
    );
}

export default Login