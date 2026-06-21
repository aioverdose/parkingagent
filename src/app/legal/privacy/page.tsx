import { Card } from "@/components/ui/Card";

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          <a href="/" className="text-lg font-bold tracking-tight">Spotimization</a>
          <a href="/login" className="text-sm font-medium text-[#757575] hover:text-[#202124] transition-colors">Login</a>
        </div>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-black text-[#202124]">Privacy Policy</h1>
        <p className="text-sm text-[#BDBDBD] mt-2">Last updated: June 18, 2026</p>

        <div className="mt-8 space-y-6">
          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">1. Information We Collect</h2>
            <p className="text-sm text-[#757575] leading-relaxed mb-3">
              When you use Spotimization, we collect the following information:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-[#757575] leading-relaxed">
              <li>
                <strong>Account Information:</strong> Name, email address, and
                password when you create an account
              </li>
              <li>
                <strong>Membership Data:</strong> Membership status, subscription
                type, payment information (processed through third-party
                payment processors)
              </li>
              <li>
                <strong>GPS Location:</strong> Your approximate location when
                using the matching service to pair you with nearby members
              </li>
              <li>
                <strong>Course Completion:</strong> Records of completed
                educational modules and course progress
              </li>
              <li>
                <strong>Usage Data:</strong> How you interact with the platform,
                including match history and feature usage
              </li>
              <li>
                <strong>Device Information:</strong> Device type, operating
                system, and browser information
              </li>
            </ul>
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1 text-sm text-[#757575] leading-relaxed">
              <li>
                To provide AI agentic matching technology between members
              </li>
              <li>
                To verify membership status and good-standing eligibility
              </li>
              <li>
                To deliver educational courses and track completion
              </li>
              <li>
                To improve our matching algorithm and platform features
              </li>
              <li>
                To communicate about membership, updates, and support
              </li>
              <li>
                To comply with legal obligations and enforce our terms
              </li>
            </ul>
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">3. Location Data</h2>
            <p className="text-sm text-[#757575] leading-relaxed">
              GPS location data is used only for the purpose of matching you
              with nearby members. We do not store your precise location
              history beyond what is necessary for active matches. You can
              disable location services through your device settings, but this
              may limit the functionality of the matching service.
            </p>
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">4. Data Sharing</h2>
            <p className="text-sm text-[#757575] leading-relaxed mb-3">
              We do not sell your personal information. We may share data with:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-[#757575] leading-relaxed">
              <li>
                Other members (only your name and ranking status for matching)
              </li>
              <li>
                Service providers (payment processing, hosting, analytics)
              </li>
              <li>
                Law enforcement (when required by law)
              </li>
            </ul>
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">5. Data Security</h2>
            <p className="text-sm text-[#757575] leading-relaxed">
              We implement industry-standard security measures to protect your
              data, including encryption in transit and at rest. However, no
              method of electronic storage is 100% secure, and we cannot
              guarantee absolute security.
            </p>
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">6. Your Rights</h2>
            <p className="text-sm text-[#757575] leading-relaxed mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-[#757575] leading-relaxed">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and associated data</li>
              <li>Export your data</li>
              <li>Withdraw consent for location tracking</li>
            </ul>
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">7. California Privacy Rights</h2>
            <p className="text-sm text-[#757575] leading-relaxed">
              California residents have additional rights under the California
              Consumer Privacy Act (CCPA) and California Privacy Rights Act
              (CPRA). These include the right to know what personal
              information is collected, the right to delete personal
              information, and the right to opt out of the sale of personal
              information (we do not sell personal information).
            </p>
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">8. Contact</h2>
            <p className="text-sm text-[#757575] leading-relaxed">
              For privacy-related inquiries, contact us at
              privacy@spotimization.com.
            </p>
          </Card>
        </div>
      </main>

      <footer className="border-t border-gray-200 py-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3 text-[10px] text-[#757575]">
          <div className="font-bold tracking-tight">Spotimization</div>
          <div className="flex gap-4">
            <a href="/premium" className="hover:text-[#202124]">Premium</a>
            <a href="/tos" className="hover:text-[#202124]">Terms</a>
            <a href="/legal/privacy" className="hover:text-[#202124]">Privacy</a>
          </div>
          <p>&copy; 2026 Spotimization. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
