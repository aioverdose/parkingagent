import { Card } from "@/components/ui/Card";

export default function CommunityGuidelines() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          <a href="/" className="text-lg font-bold tracking-tight"><span className="text-[#4285F4]">Spotimization</span></a>
          <div className="flex gap-6">
            <a href="/terms" className="text-sm font-medium text-[#757575] hover:text-[#202124] transition-colors">Terms</a>
            <a href="/privacy" className="text-sm font-medium text-[#757575] hover:text-[#202124] transition-colors">Privacy</a>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-black text-[#202124]">Community Guidelines</h1>
        <p className="text-sm text-[#BDBDBD] mt-2">Last updated: June 20, 2026</p>

        <div className="mt-8 space-y-6">
          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">1. Be Respectful</h2>
            <p className="text-sm text-[#757575] leading-relaxed">
              Treat all members with courtesy and respect. Harassment, discrimination, hate speech,
              threatening behavior, or any form of abuse will not be tolerated. This includes comments
              or conduct based on race, ethnicity, religion, gender, sexual orientation, disability,
              or any other protected characteristic.
            </p>
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">2. Accurate Information</h2>
            <p className="text-sm text-[#757575] leading-relaxed">
              Always provide honest and accurate information about your parking availability, departure
              times, vehicle details, and location. Misleading other members undermines trust in the
              community and may result in account suspension. If your plans change, update your
              availability promptly.
            </p>
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">3. No Commercial Use</h2>
            <p className="text-sm text-[#757575] leading-relaxed">
              Spotimization is designed for individual members sharing street parking information.
              Commercial use, including but not limited to operating a paid parking service,
              reselling spot information, or using the platform for business purposes without
              explicit authorization, is strictly prohibited.
            </p>
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">4. Privacy</h2>
            <p className="text-sm text-[#757575] leading-relaxed">
              Respect the privacy of other members. Do not share personal information about other
              members outside of the platform, including their usernames, locations, schedules, or
              any other identifying details. Do not attempt to track, monitor, or collect information
              about other members without their consent.
            </p>
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">5. Compliance with Laws</h2>
            <p className="text-sm text-[#757575] leading-relaxed">
              All members must comply with local parking laws, traffic regulations, and all applicable
              laws. This includes observing time limits, permit requirements, street sweeping schedules,
              no-parking zones, and any other restrictions. Spotimization is not responsible for any
              violations incurred by members.
            </p>
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">6. Reporting Issues</h2>
            <p className="text-sm text-[#757575] leading-relaxed">
              If you experience or witness a violation of these guidelines, please report it to us
              immediately at support@spotimization.com. Provide as much detail as possible, including
              the username involved, date, time, and description of the incident. All reports are
              reviewed promptly and handled confidentially.
            </p>
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">7. Consequences of Violations</h2>
            <p className="text-sm text-[#757575] leading-relaxed">
              Violations of these Community Guidelines may result in warnings, temporary suspension,
              or permanent termination of your account. Serious or repeated violations will result in
              immediate and permanent removal from the platform. Spotimization reserves the right to
              take any action it deems appropriate in its sole discretion.
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
            <a href="/privacy" className="hover:text-[#202124]">Privacy</a>
          </div>
          <p>&copy; 2026 Spotimization. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
