import React from 'react';

export const ShippingPolicy: React.FC = () => {
    return (
        <div className="py-12 max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-brand-dark mb-2">Shipping Policy</h1>
            <p className="text-brand-lightText text-sm mb-8">Last updated: February 2025</p>

            <div className="prose prose-sm max-w-none text-brand-text space-y-6">
                <section>
                    <h2 className="text-2xl font-semibold text-brand-dark mb-3">1. Shipping Regions</h2>
                    <p>
                        Currently, we offer shipping to locations within <strong>India only</strong>. We ship to all major cities and towns across India. If your location is not served by our shipping partners, we will contact you to discuss alternative delivery options.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-brand-dark mb-3">2. Shipping Timeline</h2>
                    <p>
                        Shipping timelines vary based on your location and order type:
                    </p>
                    <div className="bg-brand-lightBg p-4 rounded-lg space-y-3">
                        <div>
                            <p className="font-semibold text-brand-dark">Standard Custom Orders</p>
                            <p className="text-sm">Production: 7-14 days | Shipping: 3-7 business days</p>
                        </div>
                        <div>
                            <p className="font-semibold text-brand-dark">Express Custom Orders</p>
                            <p className="text-sm">Production: 3-5 days | Shipping: 2-4 business days</p>
                        </div>
                        <div>
                            <p className="font-semibold text-brand-dark">Pre-made Products</p>
                            <p className="text-sm">Shipping: 2-5 business days</p>
                        </div>
                    </div>
                    <p className="mt-3 text-sm text-brand-lightText italic">
                        These are estimates and not guaranteed. Actual delivery times may vary.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-brand-dark mb-3">3. Shipping Costs</h2>
                    <p>
                        Shipping charges are calculated based on:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Order weight and dimensions</li>
                        <li>Delivery location (urban/rural)</li>
                        <li>Shipping method selected (standard/express)</li>
                    </ul>
                    <p className="mt-3">
                        Shipping costs will be displayed in the checkout summary before payment confirmation.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-brand-dark mb-3">4. Order Processing</h2>
                    <p>
                        Once your order is placed and payment is confirmed:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>We will send a confirmation email with order details</li>
                        <li>Your custom order enters production (if applicable)</li>
                        <li>You will receive a shipping notification with tracking details once dispatched</li>
                        <li>You can track your package using the provided tracking number</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-brand-dark mb-3">5. Packaging</h2>
                    <p>
                        We take great care in packaging your products:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>All items are carefully packaged to prevent damage</li>
                        <li>Fragile items are wrapped with protective materials</li>
                        <li>Custom 3D statues are packaged with extra cushioning</li>
                        <li>Each package includes the necessary documentation</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-brand-dark mb-3">6. Damaged or Lost Shipments</h2>
                    <p>
                        If your package arrives damaged or is lost in transit:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Contact us immediately at care@idoforyou.in with photos of the damage</li>
                        <li>Provide your order number and tracking details</li>
                        <li>We will work with the shipping carrier to file a claim</li>
                        <li>Replacement or full refund will be processed based on the claim outcome</li>
                    </ul>
                    <p className="mt-3 text-sm">
                        <strong>Important:</strong> Report damage within 24 hours of delivery for faster claim processing.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-brand-dark mb-3">7. Delivery Address Requirements</h2>
                    <p>
                        Please ensure your delivery address includes:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Complete street address with area/landmark</li>
                        <li>City and state with PIN code</li>
                        <li>Phone number for delivery coordination</li>
                        <li>Alternative contact number if available</li>
                    </ul>
                    <p className="mt-3">
                        Orders may be delayed or returned if the address is incomplete or incorrect. Additional charges may apply for reshipment.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-brand-dark mb-3">8. Signature and Delivery Confirmation</h2>
                    <p>
                        Depending on the order value and shipping method, a signature may be required upon delivery. Please ensure someone is available to receive the package or make alternative arrangements with the delivery partner.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-brand-dark mb-3">9. Undeliverable Packages</h2>
                    <p>
                        If a package cannot be delivered within the specified timeframe:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>The shipping carrier will attempt redelivery</li>
                        <li>If unsuccessful, the package will be returned to us</li>
                        <li>We will contact you to provide an updated delivery address</li>
                        <li>Reship will incur additional charges unless the address was incorrect on our end</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-brand-dark mb-3">10. International Shipping (Future)</h2>
                    <p>
                        Currently, we only ship within India. International shipping may be available in the future. Please check back or contact us for updates on this service.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-brand-dark mb-3">11. Limitations and Exceptions</h2>
                    <p>
                        We are not responsible for delays or failures caused by:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Natural disasters, extreme weather, or unforeseen circumstances</li>
                        <li>Government actions, restrictions, or regulations</li>
                        <li>Strikes, lockouts, or labor disputes</li>
                        <li>Incorrect delivery address provided by the customer</li>
                        <li>Recipient unavailability or refusal to accept delivery</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-brand-dark mb-3">12. Contact Us</h2>
                    <p>
                        For any questions or concerns regarding shipping:
                    </p>
                    <div className="bg-brand-lightBg p-4 rounded-lg mt-3">
                        <p><strong>Email:</strong> care@idoforyou.in</p>
                        <p className="mt-2 text-sm">We will respond within 2-3 business days.</p>
                    </div>
                </section>
            </div>
        </div>
    );
};
