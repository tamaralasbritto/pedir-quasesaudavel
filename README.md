# QUASE! Ordering Experience

You are an expert Product Designer, UX Designer and Senior Full Stack Engineer.

Build a modern, mobile-first web application for a Brazilian food brand called QUASE! saudável.

The goal is to create a premium ordering experience that feels effortless, beautiful and easy to use on a smartphone.

The entire interface must be in Brazilian Portuguese.

Do not create a generic restaurant website.

The experience should feel modern, warm, polished and intuitive.

------------------------------------------------

TECH STACK

Use:

- React

- TypeScript

- Tailwind CSS

- shadcn/ui

Organize the project with:

- Reusable components

- Clean folder structure

- Clear separation between data, components and business logic

- Type-safe interfaces

- Architecture prepared for future Supabase integration

Do not implement Supabase yet.

------------------------------------------------

BRAND

Name:

QUASE! saudável

Brand concept:

People do not need to be perfect.

They only need to make one better choice today.

The brand is about balance, practicality and eating better without guilt.

Brand personality:

- Light

- Friendly

- Modern

- Welcoming

- Minimalist

- Playful without being childish

- Premium without feeling inaccessible

- Never judgmental

Do not use devil icons, guilt-based messaging or language that classifies food as morally good or bad.

Visual style:

- White background

- Sage green: #A8C3A0

- Olive green: #6E8B61

- Warm beige: #F8F5EF

- Rounded corners

- Soft shadows

- Generous spacing

- Large, readable typography

- Subtle animations

- Elegant mobile-first layout

------------------------------------------------

HOME

Create a hero section with:

Logo area

Headline:

Comida fresca.

Preparada hoje.

Entregue no seu condomínio.

Subtitle:

Escolha uma opção e faça seu pedido em poucos minutos.

Display two large navigation cards.

CARD 1

Title:

Prontos para você

Description:

Opções equilibradas, preparadas no dia e prontas para pedir.

Button:

Ver opções

CARD 2

Title:

Monte o seu

Description:

Escolha a base, a proteína, os complementos e deixe tudo do seu jeito.

Button:

Começar

------------------------------------------------

SECTION: PRONTOS PARA VOCÊ

Display visually appealing product cards.

Each product card must contain:

- Image placeholder

- Product name

- Short description

- Price

- Nutritional highlights

- Quantity selector

- Button: Adicionar ao carrinho

Create these example products:

1. Salada de Folhas

Description:

Mix de folhas frescas, tomate, cenoura, pepino e molho separado.

2. Sanduíche Natural de Frango

Description:

Pão integral, frango cremoso, cenoura, milho e folhas frescas.

3. Salada de Frutas

Description:

Seleção de frutas frescas preparadas no dia.

Use placeholder prices that are easy to edit later.

------------------------------------------------

SECTION: MONTE O SEU

Allow the customer to choose which product they want to customize:

- Salada de folhas

- Sanduíche natural

- Salada de frutas

After selecting the product, guide the customer step by step.

Use clear sections, progress indication and large touch-friendly controls.

Possible categories:

- Base

- Proteína

- Complementos

- Frutas

- Molhos

- Extras QUASE!

Only display categories that apply to the selected product.

Each ingredient option must contain:

- Name

- Portion size

- Additional price

- Calories

- Protein

- Carbohydrates

- Fat

- Image placeholder

- Availability status

Example protein:

Frango desfiado — 100 g

Nutritional information:

- 165 kcal

- 31 g protein

- 0 g carbohydrates

- 3.6 g fat

Example Extras QUASE!:

- Granola

- Leite condensado

- Queijo

- Croutons

Use welcoming language.

Example supporting text for Extras QUASE!:

Um toque a mais também pode fazer parte.

Do not use guilt-based language.

------------------------------------------------

LIVE SUMMARY

As the customer selects ingredients, automatically update:

- Total price

- Calories

- Protein

- Carbohydrates

- Fat

Display this information in a clean and beautiful summary card.

Clearly indicate that nutritional values are estimates based on the selected portions.

The summary card must remain visible or easy to access throughout the customization process.

------------------------------------------------

CART

Create a floating cart button that is always easy to access on mobile.

The cart must support:

- Multiple different products

- Customized products

- Quantity adjustment

- Removal of items

- Display of selected ingredients

- Individual item totals

- Subtotal

Persist the cart in localStorage so the order is not lost if the page reloads.

------------------------------------------------

CHECKOUT

Create a simple checkout screen with:

- Customer name

- WhatsApp number

- Apartment number

- Payment method

Payment options:

- Pix

- Dinheiro

If the customer selects Dinheiro, ask:

Precisa de troco?

If yes, ask:

Troco para quanto?

Also include:

- Order observations

- Order summary

- Final subtotal

Button:

Finalizar pedido no WhatsApp

------------------------------------------------

WHATSAPP ORDER

Do not implement online payment.

When the customer clicks “Finalizar pedido no WhatsApp”:

Generate a properly formatted WhatsApp message containing:

- Customer name

- Apartment

- Payment method

- Each product

- Quantity

- Selected ingredients

- Individual prices

- Subtotal

- Observations

Then open WhatsApp using a wa.me link.

Keep the business WhatsApp number in one clearly identified configuration constant so it can be replaced later.

------------------------------------------------

DATA STRUCTURE

For now, store products and ingredients in typed local mock data.

Create reusable TypeScript interfaces for:

- Product

- Ingredient

- IngredientCategory

- Nutrition

- CartItem

- Customer

- Order

Keep product data separate from UI components.

The structure must be ready to replace local mock data with Supabase later without rebuilding the interface.

------------------------------------------------

DO NOT IMPLEMENT

Do not implement:

- Authentication

- Admin dashboard

- Supabase

- Online payment

- Inventory automation

- Customer accounts

- Delivery tracking

------------------------------------------------

PRIORITY

Focus on a functional MVP that allows a customer to:

1. View ready-made products

2. Customize a product

3. See the price and estimated nutritional information update

4. Add multiple items to the cart

5. Complete the order through WhatsApp

The application must be responsive, visually polished and functional.

Do not generate only a static visual prototype.

Implement the interactions, calculations, cart logic and WhatsApp checkout.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://pedir-quasesaudavel.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/283921f6-acd9-491f-a917-dbd2b77607d6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
