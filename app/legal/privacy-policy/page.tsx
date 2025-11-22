import React from "react";

export const metadata = {
  title: "Privacy Policy | LoudEar",
  description: "Privacy Policy for LoudEar Platform",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto py-16 px-6">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4">Last updated: November 2025</p>

      <p className="mb-4">
        Welcome to LoudEar (“we”, “our”, or “us”). This Privacy Policy explains
        how we collect, use, and protect your information when you use the
        LoudEar platform, including our website, mobile apps, and related
        services (collectively, the “Services”).
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
      <p className="mb-4">We collect the following information:</p>
      <ul className="list-disc ml-6 mb-4">
        <li>Account information (name, email, password)</li>
        <li>Uploaded content (videos, audio, metadata)</li>
        <li>Usage data (interactions, preferences)</li>
        <li>Device information (browser type, IP address)</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. How We Use Your Information</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>To provide and improve the platform</li>
        <li>To protect user accounts and maintain security</li>
        <li>To analyze platform performance</li>
        <li>To communicate updates and support</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Sharing of Information</h2>
      <p className="mb-4">
        We do not sell your data. We may share information only with service
        providers required to operate core LoudEar features (e.g., cloud hosting,
        analytics, payment processors).
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Cookies & Tracking Technologies</h2>
      <p className="mb-4">
        LoudEar uses cookies and similar tracking technologies to enhance your
        experience and analyze usage.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Data Security</h2>
      <p className="mb-4">
        We implement strong security measures to protect your data, although no
        method is 100% secure.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">6. Children’s Privacy</h2>
      <p className="mb-4">
        LoudEar is not intended for children under 13. We do not knowingly
        collect data from children.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">7. Your Rights</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>Access, correct, or delete your information</li>
        <li>Request a copy of your data</li>
        <li>Withdraw consent where applicable</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">8. Contact Us</h2>
      <p className="mb-4">
        If you have questions, contact us at:  
        <strong> support@loudear.com </strong>
      </p>
    </main>
  );
}
