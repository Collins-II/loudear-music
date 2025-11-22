import React from "react";

export const metadata = {
  title: "Privacy Policy | LoudEar",
  description: "Privacy Policy for LoudEar Platform",
};

export function DataDeletionPage() {
return (
<div className="max-w-3xl mx-auto p-6 space-y-6">
<h1 className="text-3xl font-bold">Data Deletion Instructions</h1>
<p>Last updated: November 2025</p>


<p>
If you wish to delete your data from the LoudEar platform, follow the
steps below. Once completed, your data will be permanently removed from
our systems.
</p>


<h2 className="text-xl font-semibold">How to Request Data Deletion</h2>
<ul className="list-disc pl-6 space-y-2">
<li>Log in to your LoudEar account.</li>
<li>Navigate to <strong>Account Settings → Privacy</strong>.</li>
<li>Select <strong>Delete My Account & Data</strong>.</li>
<li>Confirm your request.</li>
</ul>


<p>
Alternatively, email <strong>support@loudear.com</strong> with the
subject line <em>&quot Data Deletion Request &quot</em> from the email associated
with your account.
</p>


<h2 className="text-xl font-semibold">Processing Time</h2>
<p>Deletion requests are processed within 7–14 business days.</p>
</div>
);
}