export default function Accessibility() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between max-w-5xl mx-auto px-4 py-3">
          <a href="/" className="text-xl font-bold tracking-tight">
            <span className="text-[#4285F4]">Parking</span>{" "}
            <span className="text-[#0F9D58]">Agent</span>
          </a>
        </div>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black text-[#202124]">Accessibility</h1>
        <p className="text-sm text-[#BDBDBD] mt-2">Last updated: June 18, 2026</p>

        <div className="mt-8 space-y-6 text-sm text-[#757575] leading-relaxed">
          <section>
            <h2 className="font-bold text-lg text-[#202124] mb-2">
              Our Commitment
            </h2>
            <p>
              Parking Agent is committed to ensuring digital accessibility for
              all users, including individuals with disabilities. We strive to
              make our platform usable by everyone, regardless of ability or
              assistive technology.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-lg text-[#202124] mb-2">
              Mobile-First Design
            </h2>
            <p>
              Our platform is built with a mobile-first approach, ensuring that
              all features are accessible on mobile devices. We use responsive
              design techniques to adapt to different screen sizes and
              orientations. Large touch targets, readable text sizes, and
              simple navigation make the platform easy to use on any device.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-lg text-[#202124] mb-2">
              Standards Compliance
            </h2>
            <p>
              We aim to comply with the Web Content Accessibility Guidelines
              (WCAG) 2.1 Level AA standards. Our team regularly reviews and
              tests the platform to identify and address accessibility issues.
              We follow best practices including:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>
                Providing text alternatives for non-text content
              </li>
              <li>
                Ensuring keyboard navigation is available for all features
              </li>
              <li>
                Maintaining sufficient color contrast ratios
              </li>
              <li>
                Supporting screen reader compatibility
              </li>
              <li>
                Providing clear and consistent navigation
              </li>
              <li>
                Using semantic HTML and ARIA landmarks
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-lg text-[#202124] mb-2">
              ADA Compliance
            </h2>
            <p>
              Parking Agent is designed with the Americans with Disabilities
              Act (ADA) requirements in mind. We understand that accessibility
              is an ongoing effort and continuously work to improve the user
              experience for all individuals.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-lg text-[#202124] mb-2">
              Accessibility Features
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>Large touch targets:</strong> Buttons and interactive
                elements are sized for easy tapping on mobile devices
              </li>
              <li>
                <strong>Readable typography:</strong> Text sizes are optimized
                for readability on small screens
              </li>
              <li>
                <strong>Color-independent indicators:</strong> Important
                information is conveyed through text and icons in addition to
                color
              </li>
              <li>
                <strong>Clear contrast:</strong> Text and background colors
                meet WCAG contrast requirements
              </li>
              <li>
                <strong>Simple navigation:</strong> Consistent navigation
                patterns across all pages
              </li>
              <li>
                <strong>Form labels:</strong> All form inputs have associated
                labels for screen reader support
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-lg text-[#202124] mb-2">
              Ongoing Improvements
            </h2>
            <p>
              Accessibility is an ongoing commitment. We regularly:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Conduct accessibility audits and testing</li>
              <li>Review and implement user feedback</li>
              <li>Stay informed about evolving accessibility standards</li>
              <li>
                Provide accessibility training to our development team
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-lg text-[#202124] mb-2">
              Feedback
            </h2>
            <p>
              We welcome feedback on the accessibility of Parking Agent. If you
              encounter accessibility barriers or have suggestions for
              improvement, please contact us at
              accessibility@parkingagent.com. We will make reasonable efforts
              to address your concerns.
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
