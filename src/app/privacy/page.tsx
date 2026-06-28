import { Card } from "@/components/ui/Card";

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          <a href="/" className="text-lg font-bold tracking-tight"><span className="text-[#4285F4]">Spotimization</span></a>
          <div className="flex gap-6">
            <a href="/terms" className="text-sm font-medium text-[#757575] hover:text-[#202124] transition-colors">Terms</a>
            <a href="/guidelines" className="text-sm font-medium text-[#757575] hover:text-[#202124] transition-colors">Guidelines</a>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto px-4 py-10">
        <div className="modern-hero px-6 py-10 sm:px-10 sm:py-14 text-center mb-8">
          <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-white">Privacy Policy</h1>
            <p className="text-white/90 mt-3 text-lg">Last updated: June 20, 2026</p>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">1. Information We Collect</h2>
            <p className="text-sm text-[#757575] leading-relaxed mb-3">
              When you use Spotimization, we collect the following information:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-[#757575] leading-relaxed">
              <li><strong>Name and Email:</strong> Your name and email address when you create an account</li>
              <li><strong>Location Data:</strong> Your approximate GPS location to match you with nearby parking spots</li>
              <li><strong>Vehicle Information:</strong> Vehicle make, model, color, and license plate number you provide</li>
              <li><strong>Parking Schedule:</strong> Information about when you typically arrive and depart</li>
              <li><strong>Usage Data:</strong> How you interact with the platform, including match history</li>
            </ul>
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1 text-sm text-[#757575] leading-relaxed">
              <li>To match you with nearby parking spots and other members</li>
              <li>To send notifications about available spots and match confirmations</li>
              <li>To improve our matching algorithm and platform features</li>
              <li>To communicate with you about your account and service updates</li>
              <li>To enforce our Terms of Use and Community Guidelines</li>
              <li>To comply with legal obligations</li>
            </ul>
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">3. Data Sharing</h2>
            <p className="text-sm text-[#757575] leading-relaxed">
              We do not sell your personal information to third parties. We share your information
              only with your consent or as necessary to provide the service. Other members will see
              only your username, vehicle description, and general location for matching purposes.
              We may share data with service providers (hosting, analytics) who are bound by
              confidentiality agreements.
            </p>
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">4. Location Data</h2>
            <p className="text-sm text-[#757575] leading-relaxed">
              GPS location data is used exclusively for matching you with nearby parking spots. Your
              precise location is anonymized after processing by rounding to three decimal places
              (approximately 111 meter resolution). We do not store your precise location history.
              You may disable location services at any time, though this may affect matching accuracy.
            </p>
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">5. Data Retention</h2>
            <p className="text-sm text-[#757575] leading-relaxed">
              We retain your personal information for as long as your account is active or as needed
              to provide the service. After account deletion, we retain anonymized data for analytics
              purposes and may retain certain information as required by law. You may request
              deletion of your data at any time.
            </p>
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">6. Your Rights</h2>
            <p className="text-sm text-[#757575] leading-relaxed mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-[#757575] leading-relaxed">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and associated data</li>
              <li>Export your data in a portable format</li>
              <li>Withdraw consent for location tracking</li>
              <li>Opt out of non-essential communications</li>
            </ul>
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">7. Contact</h2>
            <p className="text-sm text-[#757575] leading-relaxed">
              For privacy-related inquiries, contact us at support@spotimization.com.
            </p>
          </Card>
        </div>
      </main>

      <footer className="border-t border-gray-200 py-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3 text-[10px] text-[#757575]">
          <div className="font-bold tracking-tight">Spotimization</div>
          <div className="flex gap-4">
            <a href="/" className="hover:text-[#202124]">Home</a>
            <a href="/terms" className="hover:text-[#202124]">Terms</a>
            <a href="/guidelines" className="hover:text-[#202124]">Guidelines</a>
          </div>
          <p>&copy; 2026 Spotimization. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
