# **App Name**: KashierPay

## Core Features:

- Product Display: Display three different products with names and prices in EGP.
- Initiate Payment: When a 'Buy Now' button is pressed, send the product data to a Next.js API Route.
- Generate Hosted Payment Page URL: The Next.js API Route dynamically generates a Kashier Hosted Payment Page URL using the Kashier API with the provided API Keys (73342d90-d195-41a6-b260-1ea6cbf380bb) and Merchant ID (MID-37646-41).
- Payment Redirection: Redirect the customer to the dynamically generated Kashier Hosted Payment Page URL to complete the payment.
- Success Page Display: Display a 'Success' page upon successful payment.
- Cancel Page Display: Display a 'Cancel' page if the payment is cancelled or fails.

## Style Guidelines:

- Primary color: Deep saffron (#FF9933), to reflect the Egyptian context.
- Background color: Light beige (#F5F5DC), for a neutral, toned-down background.
- Accent color: Earthy brown (#A67B5B) for buttons.
- Font: 'PT Sans', a humanist sans-serif suitable for headlines or body text
- Simple, clean layout with a focus on product presentation and clear call-to-action buttons.