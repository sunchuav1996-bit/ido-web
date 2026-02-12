import React from 'react';

export const PrivacyPolicy: React.FC = () => {
    return (
        <div className="py-12 max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-brand-dark mb-2">Privacy Policy</h1>
            <p className="text-brand-lightText text-sm mb-8">Last updated: February 2025</p>

            <div className="prose prose-sm max-w-none text-brand-text space-y-6">
                <section>
                    <h2 className="text-2xl font-semibold text-brand-dark mb-3">1. Introduction</h2>
                    <p>
                        At <strong>ido</strong> ("we," "us," "our," or "Company"), we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-brand-dark mb-3">2. Information We Collect</h2>
                    <p className="font-semibold text-brand-dark">We collect information in the following ways:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Personal Information:</strong> Name, email address, phone number, mailing address, and payment details when you place an order or contact us.</li>
                        <li><strong>Order Information:</strong> Product preferences, order history, custom design specifications, and delivery preferences.</li>
                        <li><strong>Usage Data:</strong> IP address, browser type, pages visited, time spent, and referring URLs collected through cookies and analytics tools.</li>
                        <li><strong>Communication Data:</strong> Messages you send to us via contact forms, email, or other communication channels.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-brand-dark mb-3">3. How We Use Your Information</h2>
                    <p className="font-semibold text-brand-dark">We use the information we collect to:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Process and fulfill your orders</li>
                        <li>Send transactional and promotional emails with your consent</li>
                        <li>Provide customer support and respond to inquiries</li>
                        <li>Improve our website and services</li>
                        <li>Comply with legal obligations and prevent fraud</li>
                        <li>Personalize your experience on our platform</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-brand-dark mb-3">4. Sharing Your Information</h2>
                    <p>
                        We do not sell or rent your personal information. We may share your information with:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Service Providers:</strong> Payment processors, shipping partners, and cloud service providers who assist in delivering our services.</li>
                        <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety.</li>
                        <li><strong>Business Transfers:</strong> In case of merger, acquisition, or asset sale.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-brand-dark mb-3">5. Data Security</h2>
                    <p>
                        We implement industry-standard security measures to protect your personal information, including SSL encryption, secure payment gateways, and restricted data access. However, no transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-brand-dark mb-3">6. Cookies and Tracking</h2>
                    <p>
                        Our website uses cookies and similar tracking technologies to enhance your experience. You can control cookie settings through your browser, though some features may not function properly with cookies disabled.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-brand-dark mb-3">7. Your Rights</h2>
                    <p>Depending on your location, you may have the right to:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Access your personal information</li>
                        <li>Request correction of inaccurate data</li>
                        <li>Request deletion of your data</li>
                        <li>Opt-out of marketing communications</li>
                        <li>Data portability</li>
                    </ul>
                    <p className="mt-3">
                        To exercise these rights, please contact us at <strong>care@idoforyou.in</strong>.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-brand-dark mb-3">8. Third-Party Links</h2>
                    <p>
                        Our website may contain links to third-party websites. We are not responsible for their privacy practices. Please review their privacy policies before providing any information.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-brand-dark mb-3">9. Children's Privacy</h2>
                    <p>
                        Our website is not intended for children under 13. We do not knowingly collect information from children under 13. If we become aware of such information, we will delete it promptly.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-brand-dark mb-3">10. Policy Updates</h2>
                    <p>
                        We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the updated policy on our website with a new "Last Updated" date.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-brand-dark mb-3">11. Contact Us</h2>
                    <p>
                        If you have questions about this Privacy Policy or our privacy practices, please contact us:
                    </p>
                    <div className="bg-brand-lightBg p-4 rounded-lg mt-3">
                        <p><strong>Email:</strong> care@idoforyou.in</p>
                        <p className="mt-2">We will respond to your inquiry within 7-10 business days.</p>
                    </div>
                </section>
            </div>
        </div>
    );
};
