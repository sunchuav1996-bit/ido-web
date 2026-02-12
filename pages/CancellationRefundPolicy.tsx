import React from 'react';

export const CancellationRefundPolicy: React.FC = () => {
    return (
        <div className="py-12 max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-brand-dark mb-2">Cancellation & Refund Policy</h1>
            <p className="text-brand-lightText text-sm mb-8">Last updated: February 2025</p>

            <div className="prose prose-sm max-w-none text-brand-text space-y-6">
                <section>
                    <h2 className="text-2xl font-semibold text-brand-dark mb-3">1. Cancellation Policy</h2>

                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
                        <p className="font-semibold text-brand-dark mb-2">Standard Custom Orders:</p>
                        <ul className="list-disc pl-6 space-y-1 text-sm">
                            <li><strong>Within 24 hours of order:</strong> Free cancellation, full refund</li>
                            <li><strong>After 24 hours, before production starts:</strong> Full refund with 5% cancellation fee</li>
                            <li><strong>After production has started:</strong> Non-cancellable (see return policy for options)</li>
                        </ul>
                    </div>

                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                        <p className="font-semibold text-brand-dark mb-2">Pre-made Products:</p>
                        <ul className="list-disc pl-6 space-y-1 text-sm">
                            <li><strong>Within 24 hours of order:</strong> Free cancellation, full refund</li>
                            <li><strong>After 24 hours, before dispatch:</strong> 10% cancellation fee applies</li>
                            <li><strong>After dispatch:</strong> Non-cancellable (see return/refund policy)</li>
                        </ul>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-brand-dark mb-3">2. Requesting a Cancellation</h2>
                    <p>
                        To request a cancellation:
                    </p>
                    <ol className="list-decimal pl-6 space-y-2">
                        <li>Log into your account on our website</li>
                        <li>Go to "My Orders" and select the order to cancel</li>
                        <li>Click "Request Cancellation" and provide a reason (optional)</li>
                        <li>Alternatively, email us at care@idoforyou.in with your order number</li>
                    </ol>
                    <p className="mt-3 text-sm text-brand-lightText">
                        Cancellation requests are processed within 24-48 hours. We will send a confirmation email once the request is processed.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-brand-dark mb-3">3. Return Policy</h2>
                    <p>
                        If you wish to return a product within <strong>7 days of delivery</strong>:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Product Condition:</strong> Item must be unused, undamaged, and in original packaging</li>
                        <li><strong>Return Request:</strong> Email care@idoforyou.in with your order number and reason</li>
                        <li><strong>Return Process:</strong> We will provide a return shipping label or address</li>
                        <li><strong>Inspection:</strong> Upon receiving your return, we will inspect the product</li>
                        <li><strong>Approval:</strong> If approved, your refund will be processed within 5-7 business days</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-brand-dark mb-3">4. Non-Returnable Items</h2>
                    <p>
                        The following items cannot be returned:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Custom-made 3D statues (as they are made-to-order and personalized)</li>
                        <li>Damaged items due to customer misuse or negligence</li>
                        <li>Items without original packaging or tags removed</li>
                        <li>Items requested for return after 7 days of delivery</li>
                        <li>Products that were modified or altered by the customer</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-brand-dark mb-3">5. Return Shipping</h2>
                    <p>
                        <strong>Return Shipping Costs:</strong>
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Defective Products:</strong> ido covers return shipping costs</li>
                        <li><strong>Buyer's Remorse:</strong> Buyer bears return shipping costs (deducted from refund)</li>
                        <li><strong>Wrong Item Sent:</strong> ido covers return shipping costs</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-brand-dark mb-3">6. Refund Timeline</h2>
                    <p>
                        After your return is approved and received:
                    </p>
                    <div className="bg-brand-lightBg p-4 rounded-lg space-y-2 text-sm">
                        <p><strong>Inspection & Processing:</strong> 2-3 business days</p>
                        <p><strong>Approval Notification:</strong> You'll receive a confirmation email</p>
                        <p><strong>Refund Processing:</strong> 3-5 business days (depending on your bank)</p>
                        <p><strong>Total Timeline:</strong> 7-14 business days from approval</p>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-brand-dark mb-3">7. Refund Method</h2>
                    <p>
                        Refunds will be issued to the original payment method:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Credit/Debit Card:</strong> Refund reflected in 3-7 business days</li>
                        <li><strong>Digital Wallets:</strong> Refund reflected in 1-3 business days</li>
                        <li><strong>Bank Transfer:</strong> Refund reflected in 3-5 business days</li>
                    </ul>
                    <p className="mt-3 text-sm text-brand-lightText">
                        Note: Your bank may take additional time to process the refund. Check with them if the refund isn't visible within the stated timeframe.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-brand-dark mb-3">8. Partial Refunds</h2>
                    <p>
                        You may not receive a full refund in the following cases:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Return shipping costs (if paid by customer)</li>
                        <li>Cancellation fees applied during the cancellation window</li>
                        <li>Custom modifications or additional services rendered</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-brand-dark mb-3">9. Defective Products</h2>
                    <p>
                        If your product arrives defective or damaged:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Report within 48 hours:</strong> Contact care@idoforyou.in with photos</li>
                        <li><strong>Verification:</strong> We will assess the damage/defect</li>
                        <li><strong>Resolution:</strong> We will offer a replacement or full refund</li>
                        <li><strong>Return Shipping:</strong> Covered by ido at no cost</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-brand-dark mb-3">10. Wrong Item Sent</h2>
                    <p>
                        If we sent the wrong item:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Contact us immediately with your order number</li>
                        <li>We will arrange a replacement or return</li>
                        <li>No questions asked - ido bears all costs</li>
                        <li>We will expedite a replacement or process a refund</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-brand-dark mb-3">11. Exceptions to This Policy</h2>
                    <p>
                        This cancellation and refund policy does not apply to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Clearance or sale items (final sale, no returns)</li>
                        <li>Gift cards or digital services</li>
                        <li>Orders placed with discount codes or promotional offers (check specific terms)</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-brand-dark mb-3">12. Dispute Resolution</h2>
                    <p>
                        If you have a dispute regarding a cancellation or refund:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Contact us at care@idoforyou.in with all order details</li>
                        <li>We will review your case within 5-7 business days</li>
                        <li>Our decision will be communicated via email</li>
                        <li>For unresolved disputes, you may escalate through your payment provider</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-brand-dark mb-3">13. Custom Orders Disclaimer</h2>
                    <p>
                        <strong>Important:</strong> Custom 3D statues are created exclusively for your order based on your specifications. Due to the personalized and production-intensive nature of custom work, these items are generally <strong>non-refundable once production has begun</strong>. However, we are committed to quality and will work with you if there are issues.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-brand-dark mb-3">14. Contact Us</h2>
                    <p>
                        For any cancellation or refund-related inquiries:
                    </p>
                    <div className="bg-brand-lightBg p-4 rounded-lg mt-3">
                        <p><strong>Email:</strong> care@idoforyou.in</p>
                        <p className="mt-2"><strong>Response Time:</strong> Within 24-48 hours</p>
                        <p className="mt-2 text-sm">Please include your order number and a clear description of your request.</p>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-brand-dark mb-3">15. Policy Updates</h2>
                    <p>
                        We reserve the right to modify this cancellation and refund policy at any time. Policy changes will be posted on this page with a new effective date. Continued use of our website signifies your acceptance of the updated policy.
                    </p>
                </section>
            </div>
        </div>
    );
};
