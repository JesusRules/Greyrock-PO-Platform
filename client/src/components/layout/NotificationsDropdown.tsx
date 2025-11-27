import { Menu, Text, Badge } from '@mantine/core'; // ⬅️ add Badge here
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppDispatch, useAppSelector } from '../../../redux/store';
import { useDispatch } from 'react-redux';
import { fetchNotifications } from '../../../redux/features/notifications-slice';
import { logoutUser } from '../../../redux/features/auth-slice';
import { useGlobalContext } from '../../../context/global-context';

const NotificationsDropdown = () => {
  const { setOpenViewPO, setCurrentPO } = useGlobalContext();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const dispatch = useDispatch<AppDispatch>();
  const user = useAppSelector(state => state.authReducer.user);
  const notifications = useAppSelector(state => state.notificationsReducer.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  function useIsMobile(breakpoint = 640) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth < breakpoint);
      };

      handleResize();
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
          {/* USER CREDENTIALS */}
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
                  : user?.signatureRole === 'submitter'
                  ? 'Submitter'
                  : user?.signatureRole}
              </strong>
            </p>

            {/* ✅ Show departments only for normal users */}
            {user?.permissionRole === 'user' &&
              Array.isArray((user as any).departments) &&
              (user as any).departments.length > 0 && (
                <div className="mt-3">
                  <p className="font-semibold mb-1">User Departments</p>
                  <div className="flex flex-wrap gap-2">
                    {(user as any).departments.map((dept: any) => {
                      const key = dept._id ?? dept.name;
                      const label = `${String(dept.name).toUpperCase()}${
                        dept.departmentCode ? ` (${dept.departmentCode})` : ''
                      }`;

                      return (
                        <Badge
                          key={key}
                          radius="xl"
                          variant="outline"
                          size="xs"
                          style={{ fontWeight: 600 }}
                        >
                          {label}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
          </div>

          <Menu.Divider />

          {/* NOTIFICATIONS */}
          <Menu.Label>Purchase Orders Signatures Needed</Menu.Label>

          {!hasNotifications && (
            <div className="ml-7">
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
    </>
  );
};

export default NotificationsDropdown;