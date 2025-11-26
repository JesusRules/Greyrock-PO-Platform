import { Menu, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppDispatch, useAppSelector } from '../../../redux/store';
import { useDispatch } from 'react-redux';
import { fetchNotifications } from '../../../redux/features/notifications-slice';
import { logoutUser } from '../../../redux/features/auth-slice';
import { PurchaseOrderViewModal } from '@components/purchase-orders/po-view-modal';
import { useGlobalContext } from '../../../context/global-context';

// If you have a shared global context controlling modals, you *can* use it too,
// but this solution keeps the selection local to this component.

const NotificationsDropdown = () => {
  const { openSignModal, setOpenSignModal, openViewPO, setOpenViewPO, setCurrentPO } = useGlobalContext();
  
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const dispatch = useDispatch<AppDispatch>();
  const user = useAppSelector(state => state.authReducer.user);
  const notifications = useAppSelector(state => state.notificationsReducer.notifications);

  // Which PO is currently selected to view/sign
  // const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] = useState<string | null>(null);
  // const [openViewPO, setOpenViewPO] = useState(false);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  function useIsMobile(breakpoint = 640) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth < breakpoint);
      };

      handleResize(); // run on mount
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, [breakpoint]);

    return isMobile;
  }

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/");
  };

  const isMobile = useIsMobile();

  const handleOpenPO = (poId: string) => {
    // setSelectedPurchaseOrderId(poId);
    setCurrentPO(poId);
    setOpenViewPO(true);
  };

  const hasNotifications = notifications && notifications.length > 0;

  return (
    <>
      <Menu
        shadow="md"
        width={320}
        position="bottom-end"
        offset={8}
        withArrow
        zIndex={10000}
        withinPortal
        styles={{
          dropdown: {
            border: '1px solid gray',
            maxHeight: '82vh',
            overflowY: 'auto',
          },
        }}
      >
        <Menu.Target>
          <div
            className="relative w-10 h-10 rounded-full top-[2px]
            bg-gray-300 hover:bg-gray-300 flex 
            items-center justify-center transition-colors duration-200 cursor-pointer
            hover:ring-2 hover:gray-300"
          >
            <img
              className="w-[22px] h-[22px]"
              src="/vectors/bell-solid-full.svg"
              alt="bell"
            />
            {hasNotifications && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-semibold flex items-center justify-center rounded-full shadow-md">
                {notifications.length}
              </div>
            )}
          </div>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>User Credentials</Menu.Label>
          <div className="text-xs ml-5 mb-2">
            <p>
              Name:{' '}
              <strong>
                {user?.firstName} {user?.lastName}
              </strong>
            </p>
            <p>
              Permission Role:{' '}
              <strong>
                {user?.permissionRole === 'admin'
                  ? 'Admin'
                  : user?.permissionRole === 'poweruser'
                  ? 'Power User'
                  : user?.permissionRole === 'user'
                  ? 'User'
                  : user?.permissionRole}
              </strong>
            </p>
            <p>
              Signature Role:{' '}
              <strong>
                {user?.signatureRole === 'generalManager'
                  ? 'General Manager'
                  : user?.signatureRole === 'financeDepartment'
                  ? 'Finance Department'
                  : user?.signatureRole === 'overrideSigner'
                  ? 'Override Signer'
                  : user?.signatureRole}
              </strong>
            </p>
          </div>

          <Menu.Divider />

          <Menu.Label>Purchase Orders Signatures Needed</Menu.Label>

          {!hasNotifications && (
            <div className='ml-7'>
            <Text size="xs" c="dimmed" className="px-3 py-2">
              No purchase orders require your signature.
            </Text>
            </div>
          )}

          {hasNotifications &&
            notifications.map((po: any) => (
              <Menu.Item
                key={po._id}
                onClick={() => handleOpenPO(po._id)}
                className="whitespace-normal"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">
                    #{po.poNumber}
                  </span>
                  <span className="text-xs text-gray-600">
                    {po.department?.name} • {po.vendor?.companyName}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Total: ${po.total?.toFixed(2)} • Status: {po.status}
                  </span>
                </div>
              </Menu.Item>
            ))}

          <Menu.Divider />

          <Menu.Label>Other</Menu.Label>
          <Menu.Item
            onClick={handleLogout}
            leftSection={
              <img
                className="w-5 dark:invert"
                src="/vectors/right-from-bracket-solid-full.svg"
                alt="logout-icon"
              />
            }
          >
            Logout
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      {/* {selectedPurchaseOrderId && (
        <PurchaseOrderViewModal
          purchaseOrderId={selectedPurchaseOrderId}
          open={openViewPO}
          onOpenChange={(open) => {
            if (!open) {
              setOpenViewPO(false);
            } else {
              setOpenViewPO(true);
            }
          }}
        />
      )} */}
    </>
  );
};

export default NotificationsDropdown;

// import { Menu, Button, Text } from '@mantine/core';
// import { useEffect, useMemo, useState } from 'react';
// import toast from 'react-hot-toast';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { AppDispatch, useAppSelector } from '../../../redux/store';
// import { useDispatch } from 'react-redux';
// import { fetchNotifications } from '../../../redux/features/notifications-slice';
// import { logoutUser } from '../../../redux/features/auth-slice';

// // const iconSign = (color = "black") => (
// //     <img
// //       src='/vectors/signature-icon.svg'
// //       className='dark:invert w-[14px]'
// //     />
// // );

// const NotificationsDropdown = () => {
//     const { pathname } = useLocation();
//     const navigate = useNavigate();
//     //States
//     // const [openNestedMenuId, setOpenNestedMenuId] = useState<string | null>(null);
//     // const [signatureDocument, setSignatureDocument] = useState<FileOrFolder | null>(null);
//     //Redux
//     const dispatch = useDispatch<AppDispatch>();
//     const user = useAppSelector(state => state.authReducer.user);
//     const notifications = useAppSelector(state => state.notificationsReducer.notifications);

//     // Enrich notifications with file data
//     // const enrichedNotifications = useMemo(() => {
//     //   return notifications.map(notification => {
//     //     const latestVersion = allItems.find(item => item._id === notification._id);
//     //     return latestVersion || notification;
//     //   });
//     // }, [notifications]);

//     useEffect(() => {
//         dispatch(fetchNotifications());
//     }, [])

// //     useEffect(() => {
// //     if (signatureDocument) {
// //         setPreviewItem(signatureDocument);
// //     }
// //   }, [signatureDocument])

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

//     const handleLogout = () => {
//         dispatch(logoutUser());
//         navigate("/");
//     };

//     const isMobile = useIsMobile();

//   return (
//     <Menu
//       shadow="md"
//       width={300}
//       position="bottom-end"
//       offset={8}
//       withArrow
//       zIndex={10000}
//       withinPortal
//       // disabled={false}
//       styles={{
//         dropdown: {
//           border: '1px solid gray',
//           maxHeight: '82vh', overflowY: 'auto'
//         }
//       }}>
//         <Menu.Target>
//         <div
//           className="relative w-10 h-10 rounded-full top-[2px]
//           bg-gray-300 hover:bg-gray-300 flex 
//           items-center justify-center transition-colors duration-200 cursor-pointer
//           hover:ring-2 hover:gray-300
//           ">
//           <img className='w-[22px] h-[22px]' src='/vectors/bell-solid-full.svg' alt='bell' />
//           {false ? (
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
//         <Menu.Label>User Credentials</Menu.Label>
//         <div className='text-xs ml-5'>
//         <p>Name: <strong>{user?.firstName} {user?.lastName}</strong></p>
//         <p>Permission Role: <strong>{user?.permissionRole === 'admin' ? 'Admin' : user?.permissionRole === 'poweruser' ? 'Power User' : user?.permissionRole === 'user' ? 'User' : user?.permissionRole}</strong></p>
//         <p>Signature Role: <strong>{user?.signatureRole === 'generalManager' ? 'General Manager' : user?.signatureRole === 'financeDepartment' ? 'Finance Department' 
//                     : user?.signatureRole === 'overrideSigner' ? 'Override Signer' : user?.signatureRole}</strong></p>
//         </div>

//         <Menu.Divider />

//         <Menu.Label>Purchase Orders Signatures Needed</Menu.Label>

//         <button onClick={() => console.log('notifications', notifications)}>CLICK ME</button>

//         {/* List Purchase Orders needing signing here */}
//         {/* {enrichedNotifications.map((notification) => {
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
//         })} */}
       
//         <Menu.Divider />

//         <Menu.Label>Other</Menu.Label>
//         <Menu.Item
//             onClick={(e) => handleLogout()}
//             leftSection={<img className='w-5 dark:invert' src='/vectors/right-from-bracket-solid-full.svg' alt='logout-icon' />}
//         >
//           Logout
//         </Menu.Item>
//       </Menu.Dropdown>
//     </Menu>
//   );
// }

// export default NotificationsDropdown;