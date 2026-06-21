import { Card } from "@/components/ui/Card";

export default function TermsOfUse() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          <a href="/" className="text-lg font-bold tracking-tight"><span className="text-[#4285F4]">Spot</span> <span className="text-[#0F9D58]">Mining</span></a>
          <div className="flex gap-6">
            <a href="/guidelines" className="text-sm font-medium text-[#757575] hover:text-[#202124] transition-colors">Guidelines</a>
            <a href="/privacy" className="text-sm font-medium text-[#757575] hover:text-[#202124] transition-colors">Privacy</a>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-black text-[#202124]">Terms of Use</h1>
        <p className="text-sm text-[#BDBDBD] mt-2">Last updated: June 20, 2026</p>

        <div className="mt-8 space-y-6">
          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">1. Service Description</h2>
            <p className="text-sm text-[#757575] leading-relaxed">
              Spot Mining is a street parking matching service. We provide technology that connects members
              who are leaving a parking spot with members who are looking for one. Spot Mining does not own,
              lease, manage, or control any parking spots. All parking arrangements are made solely between
              members. We facilitate the match but are not a party to any parking agreement.
            </p>
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">2. Member Obligations</h2>
            <p className="text-sm text-[#757575] leading-relaxed mb-3">
              As a member of Spot Mining, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-[#757575] leading-relaxed">
              <li>Provide accurate and truthful information about your parking availability and schedule</li>
              <li>Comply with all applicable laws, including local parking regulations and traffic laws</li>
              <li>Use the platform only for its intended purpose of parking spot matching</li>
              <li>Not engage in fraudulent, deceptive, or misleading activity</li>
              <li>Maintain the confidentiality of your account credentials</li>
            </ul>
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">3. No Ownership of Parking Spots</h2>
            <p className="text-sm text-[#757575] leading-relaxed">
              Street parking spots are public property. Spot Mining does not claim any ownership interest
              in any parking spot. Our matching service simply connects members who have information about
              a spot becoming available with members seeking a spot. No transfer of property rights ever
              occurs through our platform.
            </p>
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">4. Privacy and Anonymity</h2>
            <p className="text-sm text-[#757575] leading-relaxed">
              Spot Mining is designed to protect your privacy. We do not require real names for display.
              Members interact using chosen usernames. Location data is anonymized and used only for
              matching purposes. We do not sell your personal information. See our Privacy Policy for
              full details on how we handle your data.
            </p>
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">5. Limitation of Liability</h2>
            <p className="text-sm text-[#757575] leading-relaxed">
              Spot Mining provides a matching platform only. We are not responsible for any parking
              tickets, fines, towing, damages, disputes, accidents, or any other issues arising from
              parking arrangements made through our service. Members use the platform at their own risk
              and are solely responsible for their compliance with laws and their interactions with
              other members.
            </p>
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">6. Termination</h2>
            <p className="text-sm text-[#757575] leading-relaxed">
              We reserve the right to suspend or terminate any membership for violations of these
              Terms of Use, applicable laws, or our Community Guidelines. Members may cancel their
              membership at any time through their account settings. Upon termination, your access
              to the platform will be revoked and your data will be handled in accordance with our
              Privacy Policy.
            </p>
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">7. Contact</h2>
            <p className="text-sm text-[#757575] leading-relaxed">
              For questions about these terms, please contact us at support@parkingagent.com.
            </p>
          </Card>
        </div>
      </main>

      <footer className="border-t border-gray-200 py-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3 text-[10px] text-[#757575]">
          <div className="font-bold tracking-tight"><span className="text-[#4285F4]">Spot</span> <span className="text-[#0F9D58]">Mining</span></div>
          <div className="flex gap-4">
            <a href="/" className="hover:text-[#202124]">Home</a>
            <a href="/guidelines" className="hover:text-[#202124]">Guidelines</a>
            <a href="/privacy" className="hover:text-[#202124]">Privacy</a>
          </div>
          <p>&copy; 2026 Spot Mining. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
