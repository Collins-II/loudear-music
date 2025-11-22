import React from "react";

export const metadata = {
  title: "Terms & Conditions | LoudEar",
  description: "Terms of Use for LoudEar Platform",
};

export default function TermsPage() {
  return (
    <main className="max-w-4xl mx-auto py-16 px-6">
      <h1 className="text-3xl font-bold mb-6">Terms & Conditions</h1>
      <p className="mb-4">Last updated: November 2025</p>

      <p className="mb-4">
        These Terms & Conditions (“Terms”) govern your access to and use of the
        LoudEar platform (“Services”). By using LoudEar, you agree to these
        Terms.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. User Accounts</h2>
      <p className="mb-4">
        You must provide accurate information when creating an account. You are
        responsible for securing your login credentials.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. Acceptable Use</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>No illegal content</li>
        <li>No copyright infringement</li>
        <li>No abusive or harmful behavior</li>
        <li>No interference with platform operations</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. User Content</h2>
      <p className="mb-4">
        You retain ownership of the content you upload. By uploading, you grant
        LoudEar a license to store, process, and display your content for
        platform functionality.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Intellectual Property</h2>
      <p className="mb-4">
        All LoudEar trademarks, branding, and platform code are the property of
        LoudEar and may not be copied or reused without permission.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Payments & Billing</h2>
      <p className="mb-4">
        Paid plans, where applicable, will be billed according to the pricing
        selected. Refund policies may vary by region.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">6. Termination</h2>
      <p className="mb-4">
        LoudEar reserves the right to suspend accounts that violate these Terms
        or pose security risks.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">7. Limitation of Liability</h2>
      <p className="mb-4">
        LoudEar is provided “as is.” We are not liable for data loss, downtime,
        or damages arising from platform use.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">8. Changes to Terms</h2>
      <p className="mb-4">
        We may update these Terms at any time. Continued use of the platform
        signifies acceptance of the updated Terms.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">9. Contact Us</h2>
      <p className="mb-4">
        Email: <strong> support@loudear.com </strong>
      </p>
    </main>
  );
}
