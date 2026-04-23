import { AlertTriangle, LoaderCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export function PageLoader({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="rounded-2xl border border-green-500/20 bg-white/5 px-8 py-6 text-center backdrop-blur-xl">
        <LoaderCircle className="mx-auto mb-4 h-10 w-10 animate-spin text-green-500" />
        <p className="text-gray-200">{message}</p>
      </div>
    </div>
  );
}

export function PageErrorState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Alert className="max-w-xl border-red-500/30 bg-red-500/10 text-red-100">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </div>
  );
}
