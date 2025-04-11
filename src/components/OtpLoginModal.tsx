// components/OtpLoginModal.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface OtpLoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (token: string) => void;
  role: 'doctor' | 'ad' | 'admin';
}

const OtpLoginModal: React.FC<OtpLoginModalProps> = ({ open, onClose, onSuccess, role }) => {
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const { toast } = useToast();

  const handleSendOtp = async () => {
    try {
      await axios.post('/api/otp/send', { email, mobile: '' });
      setOtpSent(true);
      toast({ title: 'OTP sent to email.' });
    } catch (err) {
      toast({ title: 'Failed to send OTP.', variant: 'destructive' });
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await axios.post('/api/otp/verify', {
        emailOrMobile: email,
        otp
      });

      const token = res.data.token;
      localStorage.setItem('token', token);
      toast({ title: 'OTP verified. Logged in.' });
      onSuccess(token);
      onClose();
    } catch (err) {
      toast({ title: 'Invalid OTP.', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>OTP Login ({role.toUpperCase()})</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!otpSent ? (
            <>
              <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Button onClick={handleSendOtp}>Send OTP</Button>
            </>
          ) : (
            <>
              <Input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
              <Button onClick={handleVerifyOtp}>Verify & Login</Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OtpLoginModal;
