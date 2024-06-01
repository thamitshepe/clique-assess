import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useUser, useClerk } from '@clerk/clerk-react';

const CustomUserButton: React.FC = () => {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();

  if (!user) return null;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center space-x-2 focus:outline-none">
          <img
            src={user.imageUrl || ''}
            alt="User profile"
            width={30}
            height={30}
            className="rounded-full"
          />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-9999 mt-2 w-48 rounded-lg bg-white p-2 shadow-lg"
          style={{ zIndex: 9999 }}
        >
          <DropdownMenu.Group>
            <DropdownMenu.Item asChild>
              <button
                onClick={() => openUserProfile()}
                className="block w-full text-left px-2 py-1 text-sm text-gray-500 hover:text-black hover:bg-gray-100 focus:outline-none"
              >
                Profile
              </button>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <a
                href="https://billing.stripe.com/p/login/cN26s3cbcbCr6wU288"
                className="block w-full text-left px-2 py-1 text-sm text-gray-500 hover:text-black hover:bg-gray-100 focus:outline-none"
                target="_blank"
                rel="noopener noreferrer"
              >
                Manage Subscription
              </a>
            </DropdownMenu.Item>
          </DropdownMenu.Group>
          <DropdownMenu.Separator className="my-1 h-px bg-gray-200" />
          <DropdownMenu.Item asChild>
            <button
              onClick={() => signOut()}
              className="block w-full text-left px-2 py-1 text-sm text-gray-500 hover:text-black hover:bg-gray-100 focus:outline-none"
            >
              Sign Out
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default CustomUserButton;
