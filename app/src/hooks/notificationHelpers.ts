// notificationHelpers.ts
export const toastNotification = ({ title, description, status }: { title: string, description: string, status: string }) => {
    // Implement your toast notification logic
    console.log(`Toast Notification: ${title} - ${description} - ${status}`);
  };
  
  export const sendNativeNotification = ({ title, body }: { title: string, body: string }) => {
    // Implement your native notification logic
    console.log(`Native Notification: ${title} - ${body}`);
  };
  