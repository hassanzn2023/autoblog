
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ProfilePage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
    }
  }, [profile]);

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', user.id as any);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully"
      });

      await refreshProfile();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return <div className="container py-10">Please sign in to view your profile.</div>;
  }

  return (
    <div className="container max-w-2xl py-10">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

      <div className="space-y-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={user.email || ''} disabled />
          <p className="text-sm text-muted-foreground">Your email address cannot be changed.</p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="first-name">First Name</Label>
          <Input 
            id="first-name" 
            value={firstName} 
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="last-name">Last Name</Label>
          <Input 
            id="last-name" 
            value={lastName} 
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <Button onClick={handleUpdateProfile} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;
