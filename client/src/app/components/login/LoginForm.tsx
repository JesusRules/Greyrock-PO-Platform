'use client'

import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { TextInput, Text, useMantineColorScheme, Button, Loader, PasswordInput } from '@mantine/core';
import styles from './login.module.scss';
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../redux/store";
import { loginUser } from "../../../redux/features/auth-slice";
import { isFulfilled } from "@reduxjs/toolkit";

export default function LoginPage() {
  const { colorScheme } = useMantineColorScheme();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  //Refs
  const loginRef = useRef(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  //States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [menuLoading, setMenuLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setMenuLoading(true);
      const resultAction = await dispatch(loginUser({ email, password }));
      // if (isFulfilled(resultAction)) {
      if (loginUser.fulfilled.match(resultAction)) {
          router.replace('/file-explorer');
          setEmail('');
          setPassword('');
          // setMenuLoading(false);
        } else {
          toast.error(resultAction.payload || 'Login failed');
          setMenuLoading(false);
        }
      } catch (error) {
        setMenuLoading(false);
        console.log('Error logging in', error);
        toast.error("Something went wrong");        
      }
  }
//   const handleLogin = async () => {
//     try {
//         setMenuLoading(true);
//         const resultAction = await dispatch(loginUser({ email, password }));

//         if (loginUser.fulfilled.match(resultAction)) {
//             const { user, token } = resultAction.payload;

//             // ✅ Wait for Reserve DB to confirm readiness before redirecting
//             let retries = 0;
//             let dbReady = false;

//             while (!dbReady && retries < 5) { // Retries up to 5 times
//                 const dbCheckResponse = await api.get("/api/reserve/check-db-status", { withCredentials: true });
//                 if (dbCheckResponse.data.connected) {
//                     dbReady = true;
//                     break;
//                 }
//                 console.log(`⏳ Waiting for Reserve DB to be ready... (${retries + 1}/5)`);
//                 await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
//                 retries++;
//             }

//             if (!dbReady) {
//                 toast.error("Reserve database not ready. Try refreshing.");
//                 setMenuLoading(false);
//                 return;
//             }

//             // ✅ Redirect only after Reserve DB is fully ready
//             router.replace('/file-explorer');
//             setEmail('');
//             setPassword('');
//         } else {
//             toast.error(resultAction.payload || 'Login failed');
//             setMenuLoading(false);
//         }
//     } catch (error) {
//         setMenuLoading(false);
//         console.error('Error logging in', error);
//         toast.error("Something went wrong");
//     }
// };

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
          <Button disabled={menuLoading} size='lg' mt={16} h={50} py={10} px={30} loading={false} 
            color={colorScheme === 'dark' ? 'dark.5' : '#6a6a6a'} // Darker gray dynamically
            onClick={(e) => {
              handleLogin();
            }} >
            {!menuLoading && (
                <span>Login</span>
                )}
              {menuLoading && (
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