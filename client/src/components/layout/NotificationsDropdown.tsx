import { Menu, Button, Text } from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppDispatch, useAppSelector } from '../../../redux/store';
import { useDispatch } from 'react-redux';
import { fetchNotifications } from '../../../redux/features/notifications-slice';
import { logoutUser } from '../../../redux/features/auth-slice';

// const iconSign = (color = "black") => (
//     <img
//       src='/vectors/signature-icon.svg'
//       className='dark:invert w-[14px]'
//     />
// );

const NotificationsDropdown = () => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    //States
    // const [openNestedMenuId, setOpenNestedMenuId] = useState<string | null>(null);
    // const [signatureDocument, setSignatureDocument] = useState<FileOrFolder | null>(null);
    //Redux
    const dispatch = useDispatch<AppDispatch>();
    const user = useAppSelector(state => state.authReducer.user);
    const notifications = useAppSelector(state => state.notificationsReducer.notifications);

    // Enrich notifications with file data
    // const enrichedNotifications = useMemo(() => {
    //   return notifications.map(notification => {
    //     const latestVersion = allItems.find(item => item._id === notification._id);
    //     return latestVersion || notification;
    //   });
    // }, [notifications]);

    useEffect(() => {
        dispatch(fetchNotifications());
    }, [])

//     useEffect(() => {
//     if (signatureDocument) {
//         setPreviewItem(signatureDocument);
//     }
//   }, [signatureDocument])

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

  return (
    <Menu
      shadow="md"
      width={300}
      position="bottom-end"
      offset={8}
      withArrow
      zIndex={10000}
      withinPortal
      // disabled={false}
      styles={{
        dropdown: {
          border: '1px solid gray',
          maxHeight: '82vh', overflowY: 'auto'
        }
      }}>
        <Menu.Target>
        <div
          className="relative w-10 h-10 rounded-full top-[2px]
          bg-gray-300 hover:bg-gray-300 flex 
          items-center justify-center transition-colors duration-200 cursor-pointer
          hover:ring-2 hover:gray-300
          ">
          <img className='w-[22px] h-[22px]' src='/vectors/bell-solid-full.svg' alt='bell' />
          {true ? (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-semibold flex items-center justify-center rounded-full shadow-md">
              {3}
            </div>
          ) : (
            notifications && notifications.length > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-semibold flex items-center justify-center rounded-full shadow-md">
              {notifications.length}
            </div>
            )
          )}
        </div>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>BCR Signatures Needed</Menu.Label>
        {/* {enrichedNotifications.map((notification) => {
        const isOpen = openNestedMenuId === notification._id;
        return (
            <Menu
                key={notification._id}
                width={180}
                shadow="md"
                // position="right-start"
                position={isMobile ? 'bottom-start' : 'right-start'}
                withArrow
                offset={2}
                opened={isOpen}
                onChange={(open) => {
                if (!open) setOpenNestedMenuId(null);
            }}
            >
            <Menu.Target>
            <div
            onClick={(e) => {
                e.stopPropagation();
                setOpenNestedMenuId(isOpen ? null : notification._id);
            }}
            className="flex items-center justify-between w-full px-3 py-2 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-[#434343] transition-colors"
            >
            <span className="text-sm">
                {notification?.name} - {notification?.bcrContent?.departmentName} - {truncateWithSmartDots(String(notification?.bcrContent?.title), 50)}
            </span>
            <Text size="lg" c="dimmed">›</Text>
            </div>
            </Menu.Target>

            <Menu.Dropdown style={{ zIndex: 10000}}>
                <Menu.Item leftSection={iconEye()}
                  onClick={() => viewSignedDocument(notification)}>
                    View BCR
                </Menu.Item>
                <Menu.Item leftSection={iconSign()}
                  onClick={() => userSignBCRNotification(notification)}>
                    Sign Now
                </Menu.Item>
            </Menu.Dropdown>
            </Menu>
        );
        })} */}
       
        <Menu.Divider />

        <Menu.Label>Other</Menu.Label>
        <Menu.Item
            onClick={(e) => handleLogout()}
            leftSection={<img className='w-5 dark:invert' src='/vectors/right-from-bracket-solid-full.svg' alt='logout-icon' />}
        >
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

export default NotificationsDropdown;