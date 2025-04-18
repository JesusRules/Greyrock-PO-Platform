import React, { useEffect, useState } from 'react'
import { useMantineColorScheme, Image, Button } from '@mantine/core';

function ColorSchemeToggle() {
    const { setColorScheme } = useMantineColorScheme();
    // const colorScheme = useComputedColorScheme(); //SSR incompatible
    const [colorScheme, setClientColorScheme] = useState<"light" | "dark">("light");

    useEffect(() => {
        const theme = localStorage.getItem('mantine-color-scheme') || "light";
        setClientColorScheme(theme as "light" | "dark");

        if (typeof window !== "undefined") {
            document.documentElement.setAttribute("data-theme", theme);
        }
    }, [])

    useEffect(() => {
    if (colorScheme === 'dark') {
        document.documentElement.classList.add("dark");
    } else {
        document.documentElement.classList.remove("dark");
    }
    }, [colorScheme]);

    const toggleColorScheme = () => {
        const newScheme = colorScheme === "dark" ? "light" : "dark";
        setColorScheme(newScheme);
        setClientColorScheme(newScheme);
        localStorage.setItem('mantine-color-scheme', newScheme);
        // ✅ Set the data-theme attribute on <html> for CSS styling
         document.documentElement.setAttribute("data-theme", newScheme);
    }

  return (
    <div className='fixed top-0 right-0 z-[2000]'>
        <Button h={42} w={50} p={0} radius='md' onClick={toggleColorScheme}>
            {colorScheme === 'dark' ? (
                <Image 
                    p={17}
                    src='/vectors/sun-solid.svg' 
                    alt='sun-svg'
                    bg='blue'
                    fit='contain'
                    style={{backgroundColor: 'blue'}}
                />
            ) : (
                <Image 
                    p={17}
                    src='/vectors/moon-solid.svg' 
                    alt='moon-svg'
                    bg='blue'
                    fit='contain'
                    style={{backgroundColor: 'blue'}}
                />
            )}
        </Button>
    </div>
  )
}

export default ColorSchemeToggle