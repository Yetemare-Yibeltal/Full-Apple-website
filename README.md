## Backend Setup

1. `cd Server`
2. `npm install`
3. `cp .env.example .env` and fill in real values (MongoDB URI, JWT secret, Anthropic API key, Chapa/Stripe keys, SMTP credentials)
4. `npm run seed` to populate the database with sample products, nav sections, and an admin account
5. `npm run dev` to start the API on `http://localhost:5000`

## API Overview

| Resource    | Base Route         | Notes                                             |
| ----------- | ------------------ | ------------------------------------------------- |
| Auth        | `/api/auth`        | Register, login, logout, forgot/reset password    |
| Products    | `/api/products`    | Public browsing, admin CRUD                       |
| Nav         | `/api/nav`         | Dynamic nav bar content                           |
| Cart        | `/api/cart`        | Per-user cart                                     |
| Orders      | `/api/orders`      | Checkout, order history, admin management         |
| Reviews     | `/api/reviews`     | Product reviews with admin moderation             |
| Wishlist    | `/api/wishlist`    | Saved products                                    |
| Coupons     | `/api/coupons`     | Discount codes                                    |
| Users       | `/api/users`       | Profile, address book                             |
| Admin Stats | `/api/admin/stats` | Revenue, sales trend, top products                |
| AI          | `/api/ai`          | Shopping assistant, NL search, content generation |
| Upload      | `/api/upload`      | Product image/video uploads                       |
| Payments    | `/api/payments`    | Chapa and Stripe checkout + webhooks              |

## License

Private project - all rights reserved.
