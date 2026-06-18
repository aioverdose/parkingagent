export default function TermsOfService() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between max-w-5xl mx-auto px-4 py-3">
          <a href="/" className="text-xl font-bold tracking-tight">
            <span className="text-[#4285F4]">Parking</span>{" "}
            <span className="text-[#0F9D58]">Agent</span>
          </a>
          <a href="/login" className="text-sm font-medium text-[#757575] hover:text-[#4285F4] transition-colors">Login</a>
        </div>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black text-[#202124]">Terms of Service</h1>
        <p className="text-sm text-[#BDBDBD] mt-2">Last updated: June 18, 2026</p>

        <div className="mt-8 space-y-6 text-sm text-[#757575] leading-relaxed">
          <section>
            <h2 className="font-bold text-lg text-[#202124] mb-2">
              1. Membership Platform
            </h2>
            <p>
              Parking Agent is a membership platform. We provide AI agentic
              matching technology and community education to our members. We do
              not own, sell, lease, or control any parking spots. All parking
              arrangements are made between members themselves.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-lg text-[#202124] mb-2">
              2. No Ownership of Parking Spots
            </h2>
            <p>
              Parking Agent does not own, sell, lease, or control any parking
              spots. Our technology facilitates communication and matching
              between members who choose to share information about available
              parking. Any parking arrangement made through our platform is
              solely between the participating members.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-lg text-[#202124] mb-2">
              3. Matching Technology
            </h2>
            <p>
              Our AI agentic matching technology pairs members who are departing
              a parking spot with members who are looking for a spot. The
              matching algorithm considers proximity, ranking status, and
              good-standing status. Parking Agent makes no guarantees about the
              availability or suitability of any parking spot.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-lg text-[#202124] mb-2">
              4. Community Education
            </h2>
            <p>
              Parking Agent provides educational courses about street parking
              laws in Long Beach, CA. These courses are for informational
              purposes only and do not constitute legal advice. Members are
              responsible for understanding and complying with all local
              parking laws and regulations.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-lg text-[#202124] mb-2">
              5. Member Responsibilities
            </h2>
            <ul className="list-disc list-inside space-y-1 mt-2">
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
          </section>

          <section>
            <h2 className="font-bold text-lg text-[#202124] mb-2">
              6. Limitation of Liability
            </h2>
            <p>
              Parking Agent provides a technology platform and educational
              content. We are not responsible for any parking tickets, towing,
              fines, damages, or disputes arising from parking arrangements
              made through our platform. Members use the platform at their own
              risk.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-lg text-[#202124] mb-2">
              7. Membership Fees
            </h2>
            <p>
              Membership fees cover access to our matching technology,
              educational courses, and community platform. Fees are billed
              monthly or annually as selected at signup. Refunds are handled
              on a case-by-case basis.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-lg text-[#202124] mb-2">
              8. Termination
            </h2>
            <p>
              We reserve the right to suspend or terminate membership for
              violations of these terms, applicable laws, or community
              guidelines. Members may cancel their membership at any time.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-lg text-[#202124] mb-2">
              9. Long Beach, CA Compliance
            </h2>
            <p>
              This platform is designed for use in Long Beach, California. All
              members must comply with Long Beach municipal parking ordinances,
              including time limits, permit requirements, street sweeping
              schedules, and no-parking zones. Members are responsible for
              staying informed about local parking regulations.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-lg text-[#202124] mb-2">
              10. Contact
            </h2>
            <p>
              For questions about these terms, contact us at
              support@parkingagent.com.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-gray-200 py-6 text-center text-xs text-[#BDBDBD]">
        <div className="max-w-5xl mx-auto px-4">
          <a href="/" className="hover:text-[#4285F4]">Back to Home</a>
        </div>
      </footer>
    </div>
  );
}
