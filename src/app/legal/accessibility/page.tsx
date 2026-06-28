import { Card } from "@/components/ui/Card";

export default function Accessibility() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          <a href="/" className="text-lg font-bold tracking-tight">Spotimization</a>
          <a href="/login" className="text-sm font-medium text-[#757575] hover:text-[#202124] transition-colors">Login</a>
        </div>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto px-4 py-10">
        <div className="modern-hero px-6 py-10 sm:px-10 sm:py-14 text-center mb-8">
          <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-white">Accessibility</h1>
            <p className="text-white/90 mt-3 text-lg">Last updated: June 18, 2026</p>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">Our Commitment</h2>
            <p className="text-sm text-[#757575] leading-relaxed">
              Spotimization is committed to ensuring digital accessibility for
              all users, including individuals with disabilities. We strive to
              make our platform usable by everyone, regardless of ability or
              assistive technology.
            </p>
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">Mobile-First Design</h2>
            <p className="text-sm text-[#757575] leading-relaxed">
              Our platform is built with a mobile-first approach, ensuring that
              all features are accessible on mobile devices. We use responsive
              design techniques to adapt to different screen sizes and
              orientations. Large touch targets, readable text sizes, and
              simple navigation make the platform easy to use on any device.
            </p>
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">Standards Compliance</h2>
            <p className="text-sm text-[#757575] leading-relaxed mb-3">
              We aim to comply with the Web Content Accessibility Guidelines
              (WCAG) 2.1 Level AA standards. Our team regularly reviews and
              tests the platform to identify and address accessibility issues.
              We follow best practices including:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-[#757575] leading-relaxed">
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
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">ADA Compliance</h2>
            <p className="text-sm text-[#757575] leading-relaxed">
              Spotimization is designed with the Americans with Disabilities
              Act (ADA) requirements in mind. We understand that accessibility
              is an ongoing effort and continuously work to improve the user
              experience for all individuals.
            </p>
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">Accessibility Features</h2>
            <ul className="list-disc list-inside space-y-1 text-sm text-[#757575] leading-relaxed">
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
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">Ongoing Improvements</h2>
            <p className="text-sm text-[#757575] leading-relaxed mb-3">
              Accessibility is an ongoing commitment. We regularly:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-[#757575] leading-relaxed">
              <li>Conduct accessibility audits and testing</li>
              <li>Review and implement user feedback</li>
              <li>Stay informed about evolving accessibility standards</li>
              <li>
                Provide accessibility training to our development team
              </li>
            </ul>
          </Card>

          <Card>
            <h2 className="font-bold text-[#202124] text-sm mb-2">Feedback</h2>
            <p className="text-sm text-[#757575] leading-relaxed">
              We welcome feedback on the accessibility of Spotimization. If you
              encounter accessibility barriers or have suggestions for
              improvement, please contact us at
              accessibility@spotimization.com. We will make reasonable efforts
              to address your concerns.
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
