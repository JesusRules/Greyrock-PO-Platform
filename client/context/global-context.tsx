import React, { useContext, createContext, useState, useEffect, ReactNode } from 'react';

interface GlobalContextProps {
  children: ReactNode;
}

interface GlobalContextType {
	openCreateVendor: boolean;
	setOpenCreateVendor: React.Dispatch<React.SetStateAction<boolean>>;
	
	openEditVendor: boolean;
	setOpenEditVendor: React.Dispatch<React.SetStateAction<boolean>>;

	openSignModal: boolean;
	setOpenSignModal: React.Dispatch<React.SetStateAction<boolean>>;
	
	openViewPO: boolean;
	setOpenViewPO: React.Dispatch<React.SetStateAction<boolean>>;

	globalLoading: boolean;
	setGlobalLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const GlobalContext = createContext<GlobalContextType | null>(null);

function GlobalContextProvider({ children }: GlobalContextProps) {
    //States
	const [openCreateVendor, setOpenCreateVendor] = useState(false);
	const [openEditVendor, setOpenEditVendor] = useState(false);
	const [openSignModal, setOpenSignModal] = useState(false);
	const [openViewPO, setOpenViewPO] = useState(false)
	// 🔥 NEW: loader state
	const [globalLoading, setGlobalLoading] = useState(false);

    return (
		<GlobalContext.Provider value={{ 
			openCreateVendor, setOpenCreateVendor,
			openEditVendor, setOpenEditVendor,
			openSignModal, setOpenSignModal,
			openViewPO, setOpenViewPO,
			globalLoading, setGlobalLoading,
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
