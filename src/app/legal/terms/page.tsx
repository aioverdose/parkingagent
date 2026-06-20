import { Card } from "@/components/ui/Card";

export default function TermsOfService() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          <a href="/" className="text-lg font-bold tracking-tight"><span className="text-[#4285F4]">Parking</span> <span className="text-[#0F9D58]">Agent</span></a>
          <a href="/login" className="text-sm font-medium text-[#757575] hover:text-[#202124] transition-colors">Login</a>
        </div>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-black text-[#202124]">Terms of Service</h1>
        <p className="text-sm text-[#BDBDBD] mt-2">Last updated: June 18, 2026</p>

        <div className="mt-8 space-y-6">
          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">1. Membership Platform</h2>
            <p className="text-sm text-[#757575] leading-relaxed">
              Parking Agent is a membership platform. We provide AI agentic
              matching technology and community education to our members. We do
              not own, sell, lease, or control any parking spots. All parking
              arrangements are made between members themselves.
            </p>
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">2. No Ownership of Parking Spots</h2>
            <p className="text-sm text-[#757575] leading-relaxed">
              Parking Agent does not own, sell, lease, or control any parking
              spots. Our technology facilitates communication and matching
              between members who choose to share information about available
              parking. Any parking arrangement made through our platform is
              solely between the participating members.
            </p>
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">3. Matching Technology</h2>
            <p className="text-sm text-[#757575] leading-relaxed">
              Our AI agentic matching technology pairs members who are departing
              a parking spot with members who are looking for a spot. The
              matching algorithm considers proximity, ranking status, and
              good-standing status. Parking Agent makes no guarantees about the
              availability or suitability of any parking spot.
            </p>
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">4. Community Education</h2>
            <p className="text-sm text-[#757575] leading-relaxed">
              Parking Agent provides educational courses about street parking
              laws in Long Beach, CA. These courses are for informational
              purposes only and do not constitute legal advice. Members are
              responsible for understanding and complying with all local
              parking laws and regulations.
            </p>
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">5. Member Responsibilities</h2>
            <ul className="list-disc list-inside space-y-1 text-sm text-[#757575] leading-relaxed">
              <li>
                Comply with all applicable laws and regulations, including Long
                Beach street parking laws
              </li>
              <li>
                Maintain accurate account information and membership status
              </li>
              <li>
                Not misuse the platform or engage in fraudulent activity
              </li>
              <li>
                Respect other members and community guidelines
              </li>
              <li>
                Park only in legal parking spaces and comply with all posted
                signage
              </li>
            </ul>
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">6. Limitation of Liability</h2>
            <p className="text-sm text-[#757575] leading-relaxed">
              Parking Agent provides a technology platform and educational
              content. We are not responsible for any parking tickets, towing,
              fines, damages, or disputes arising from parking arrangements
              made through our platform. Members use the platform at their own
              risk.
            </p>
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">7. Membership Fees</h2>
            <p className="text-sm text-[#757575] leading-relaxed">
              Membership fees cover access to our matching technology,
              educational courses, and community platform. Fees are billed
              monthly or annually as selected at signup. Refunds are handled
              on a case-by-case basis.
            </p>
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">8. Termination</h2>
            <p className="text-sm text-[#757575] leading-relaxed">
              We reserve the right to suspend or terminate membership for
              violations of these terms, applicable laws, or community
              guidelines. Members may cancel their membership at any time.
            </p>
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">9. Long Beach, CA Compliance</h2>
            <p className="text-sm text-[#757575] leading-relaxed">
              This platform is designed for use in Long Beach, California. All
              members must comply with Long Beach municipal parking ordinances,
              including time limits, permit requirements, street sweeping
              schedules, and no-parking zones. Members are responsible for
              staying informed about local parking regulations.
            </p>
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">10. Contact</h2>
            <p className="text-sm text-[#757575] leading-relaxed">
              For questions about these terms, contact us at
              support@parkingagent.com.
            </p>
          </Card>
        </div>
      </main>

      <footer className="border-t border-gray-200 py-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3 text-[10px] text-[#757575]">
          <div className="font-bold tracking-tight"><span className="text-[#4285F4]">Parking</span> <span className="text-[#0F9D58]">Agent</span></div>
          <div className="flex gap-4">
            <a href="/premium" className="hover:text-[#202124]">Premium</a>
            <a href="/tos" className="hover:text-[#202124]">Terms</a>
            <a href="/legal/privacy" className="hover:text-[#202124]">Privacy</a>
          </div>
          <p>&copy; 2026 Parking Agent. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
