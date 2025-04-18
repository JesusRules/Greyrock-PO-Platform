import React, { useContext, createContext, useState, useEffect, ReactNode } from 'react';

interface GlobalContextProps {
  children: ReactNode;
}

interface GlobalContextType {
}

const GlobalContext = createContext<GlobalContextType | null>(null);

function GlobalContextProvider({ children }: GlobalContextProps) {
    //States
    //Modals
    
    return (
		<GlobalContext.Provider value={{ 
		}}  
		> 
			{children}
		</GlobalContext.Provider>
	);
}

const useGlobalContext = () => {
	const context = useContext(GlobalContext);
	if (!context) throw new Error('Issue with provider');
	return context;
};

export { GlobalContextProvider, useGlobalContext };
