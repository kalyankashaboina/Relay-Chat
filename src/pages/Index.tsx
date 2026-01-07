import { ChatLayout } from '@/components/chat/ChatLayout';
import { Toaster } from '@/components/ui/sonner';

const Index = () => {
  return (
    <>
      <ChatLayout />
      <Toaster position="top-center" />
    </>
  );
};

export default Index;
