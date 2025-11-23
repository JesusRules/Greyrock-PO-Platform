// import { Menu, Button, Text } from '@mantine/core';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { byPrefixAndName } from '@awesome.me/kit-a2910709fe/icons'
// import { useEffect, useMemo, useState } from 'react';
// import api from '@/axiosSetup';
// import toast from 'react-hot-toast';
// import { fetchNotifications } from '@/redux/features/notifications-slice';
// import { AppDispatch, useAppSelector } from '@/redux/store';
// import { useDispatch } from 'react-redux';
// import { useGlobalContext } from '@/context/global-context';
// import { usePathname, useRouter } from 'next/navigation';
// import { logoutUser } from '@/redux/features/auth-slice';
// import { FileOrFolder } from '../../../../../types/FileOrFolder';
// import { truncateWithSmartDots } from '@/utils/general';
// import { fetchBcrFile } from '@/redux/features/bcr-inspect-slice';
// import { useDocUploaderContext } from '@/context/doc-uploader-context';

// const getLogoutIcon = (color = "black") => (
//     <FontAwesomeIcon
//       className='dark:invert'
//       color={color}
//       style={{ fontSize: `${14}px` }}
//       icon={byPrefixAndName.fas["right-from-bracket"]}
//     />
// );

// const iconEye = (color = "black") => (
//     <FontAwesomeIcon
//       className='dark:invert'
//       color={color}
//       style={{ fontSize: `${14}px` }}
//       icon={byPrefixAndName.fas["eye"]}
//     />
// );

// const iconSign = (color = "black") => (
//     <img
//       src='/vectors/signature-icon.svg'
//       className='dark:invert w-[14px]'
//     />
// );

// const NotificationsDropdown = () => {
//     const { firstTime, setLoader, setSelectedBCR, setSelectedItem, setPreviewItem, setPreviewOpen, 
//       showNotificationDemo, setShowNotificationDemo, setOpenSignDS, setOpenSignManual } = useGlobalContext();

//     const { setFileViewType, setSignerUserId } = useDocUploaderContext();

//     const router = useRouter(); 
//     //States
//     const [openNestedMenuId, setOpenNestedMenuId] = useState<string | null>(null);
//     const [signatureDocument, setSignatureDocument] = useState<FileOrFolder | null>(null); // used in useEffect for setPreviewItem
//     //Redux
//     const dispatch = useDispatch<AppDispatch>();
//     const pathname = usePathname();
//     const user = useAppSelector(state => state.authReducer.user);
//     const notifications = useAppSelector(state => state.notificationsReducer.notifications);
//     const allItems = useAppSelector(state => state.fileExplorerReducer.allItems);

//     // Enrich notifications with file data
//     const enrichedNotifications = useMemo(() => {
//       return notifications.map(notification => {
//         const latestVersion = allItems.find(item => item._id === notification._id);
//         return latestVersion || notification; // fallback if not found
//       });
//     }, [notifications, allItems]);

//     useEffect(() => {
//         dispatch(fetchNotifications());
//     }, [])

//     useEffect(() => {
//       if (pathname) {
//         setShowNotificationDemo(false);

//       }
//     }, [pathname])

//     useEffect(() => {
//     if (signatureDocument) {
//         setPreviewItem(signatureDocument);
//     }
//   }, [signatureDocument])

//     function useIsMobile(breakpoint = 640) {
//       const [isMobile, setIsMobile] = useState(false);

//       useEffect(() => {
//         const handleResize = () => {
//           setIsMobile(window.innerWidth < breakpoint);
//         };

//         handleResize(); // run on mount
//         window.addEventListener('resize', handleResize);
//         return () => window.removeEventListener('resize', handleResize);
//       }, [breakpoint]);

//       return isMobile;
//     }

//     const viewSignedDocument = async (item: FileOrFolder) => {
//         setFileViewType('url');
//         // If supporting docs has attachSignedBCR
//         const signedDoc = item.bcrContent?.supportingDocs?.find(
//           doc => doc.attachSignedBCR?.toString() === item.bcrContent?._id
//         );

//         if (signedDoc) {
//           // await fetchTextContent(signedDoc);
//           setSignatureDocument(signedDoc);
//         } else {
//           // Show envelope PDF
//           // const newFile: any = { ...item };
//           const newFile: any = { ...item, type: 'signatures-merged-img' };
//           if (newFile) {
//             setSignatureDocument(newFile);
//           }
//         }
//         setPreviewOpen(true);
//     }

//     const userSignBCRNotification = (selectedItem: FileOrFolder) => {
//         setSelectedItem(selectedItem);
//         console.log('selectedItem', selectedItem)
//         setSignerUserId(user?._id!);
//         dispatch(fetchBcrFile(selectedItem._id!));
//         if (selectedItem.bcrContent?.signingType === 'DocuSign') {
//           setOpenSignDS(true);
//         }
//         if (selectedItem.bcrContent?.signingType === 'Manual') {
//           setOpenSignManual(true);
//         }
//     }

//     const handleLogout = () => {
//         dispatch(logoutUser());
//         router.push("/");
//     };

//     const isMobile = useIsMobile();

//   return (
//     <Menu
//     shadow="md"
//     width={300}
//     position="bottom-end"
//     offset={8}
//     withArrow
//     zIndex={10000}
//     withinPortal
//     disabled={firstTime}
//     styles={{
//       dropdown: {
//         maxHeight: '82vh', overflowY: 'auto'
//       }
//     }}
//     // onOpen={() => setOpenDropdown(true)}
//     // onClose={() => setOpenDropdown(false)}
//     >
//         <Menu.Target>
//         <div
//           className="relative w-10 h-10 rounded-full 
//           bg-gray-300 hover:bg-gray-300 flex 
//           items-center justify-center transition-colors duration-200 cursor-pointer
//           hover:ring-2 hover:gray-300
//           ">
//           <FontAwesomeIcon
//             style={{ fontSize: "16px" }}
//             icon={byPrefixAndName.fas["bell"]}
//             color="#000000"
//             className='w-[14px]'
//           />
//           {showNotificationDemo ? (
//             <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-semibold flex items-center justify-center rounded-full shadow-md">
//               {3}
//             </div>
//           ) : (
//             notifications && notifications.length > 0 && (
//             <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-semibold flex items-center justify-center rounded-full shadow-md">
//               {notifications.length}
//             </div>
//             )
//           )}
//         </div>
//       </Menu.Target>

//       <Menu.Dropdown>
//         <Menu.Label>BCR Signatures Needed</Menu.Label>
//         {enrichedNotifications.map((notification) => {
//         const isOpen = openNestedMenuId === notification._id;
//         return (
//             <Menu
//                 key={notification._id}
//                 width={180}
//                 shadow="md"
//                 // position="right-start"
//                 position={isMobile ? 'bottom-start' : 'right-start'}
//                 withArrow
//                 offset={2}
//                 opened={isOpen}
//                 onChange={(open) => {
//                 if (!open) setOpenNestedMenuId(null);
//             }}
//             >
//             <Menu.Target>
//             <div
//             onClick={(e) => {
//                 e.stopPropagation();
//                 setOpenNestedMenuId(isOpen ? null : notification._id);
//             }}
//             className="flex items-center justify-between w-full px-3 py-2 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-[#434343] transition-colors"
//             >
//             <span className="text-sm">
//                 {notification?.name} - {notification?.bcrContent?.departmentName} - {truncateWithSmartDots(String(notification?.bcrContent?.title), 50)}
//             </span>
//             <Text size="lg" c="dimmed">›</Text>
//             </div>
//             </Menu.Target>

//             <Menu.Dropdown style={{ zIndex: 10000}}>
//                 <Menu.Item leftSection={iconEye()}
//                   onClick={() => viewSignedDocument(notification)}>
//                     View BCR
//                 </Menu.Item>
//                 <Menu.Item leftSection={iconSign()}
//                   onClick={() => userSignBCRNotification(notification)}>
//                     Sign Now
//                 </Menu.Item>
//             </Menu.Dropdown>
//             </Menu>
//         );
//         })}
       
//         <Menu.Divider />

//         <Menu.Label>Other</Menu.Label>
//         <Menu.Item
//             onClick={(e) => handleLogout()}
//             leftSection={getLogoutIcon()}
//         >
//           Logout
//         </Menu.Item>
//       </Menu.Dropdown>
//     </Menu>
//   );
// }

// export default NotificationsDropdown;