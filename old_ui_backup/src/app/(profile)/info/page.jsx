import SplitSettingsLayout from '@/components/profile/SplitSettingsLayout';
import PersonalInfoSection from '@/components/profile/PersonalInfoSection';
import PasswordSection from '@/components/profile/PasswordSection';

export default function ProfileInfoPage() {
  return (
    <SplitSettingsLayout
      title="Profile Management"
      left={<PersonalInfoSection />}
      right={<PasswordSection />}
    />
  );
}
