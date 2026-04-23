import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position="top-right"
      richColors
      toastOptions={{
        style: {
          background: 'rgba(10, 10, 15, 0.95)',
          border: '1px solid rgba(34, 197, 94, 0.25)',
          color: '#f8fafc',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
