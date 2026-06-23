---
name: Velvet & Vine
colors:
  surface: '#181214'
  surface-dim: '#181214'
  surface-bright: '#3f3739'
  surface-container-lowest: '#120d0f'
  surface-container-low: '#201a1c'
  surface-container: '#241e20'
  surface-container-high: '#2f282a'
  surface-container-highest: '#3a3335'
  on-surface: '#ecdfe2'
  on-surface-variant: '#dbc0c5'
  inverse-surface: '#ecdfe2'
  inverse-on-surface: '#362f31'
  outline: '#a38b8f'
  outline-variant: '#554246'
  surface-tint: '#ffb1c4'
  primary: '#ffb1c4'
  on-primary: '#63052e'
  primary-container: '#6b0d33'
  on-primary-container: '#f0789b'
  inverse-primary: '#a1395b'
  secondary: '#c9c6c3'
  on-secondary: '#31302f'
  secondary-container: '#484745'
  on-secondary-container: '#b7b4b2'
  tertiary: '#e9c349'
  on-tertiary: '#3c2f00'
  tertiary-container: '#cba72f'
  on-tertiary-container: '#4e3d00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffd9e0'
  primary-fixed-dim: '#ffb1c4'
  on-primary-fixed: '#3f001a'
  on-primary-fixed-variant: '#822144'
  secondary-fixed: '#e5e2df'
  secondary-fixed-dim: '#c9c6c3'
  on-secondary-fixed: '#1c1b1a'
  on-secondary-fixed-variant: '#484745'
  tertiary-fixed: '#ffe088'
  tertiary-fixed-dim: '#e9c349'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#574500'
  background: '#181214'
  on-background: '#ecdfe2'
  surface-variant: '#3a3335'
typography:
  headline-xl:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  price-display:
    fontFamily: Playfair Display
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 32px
  xl: 48px
  container-margin: 20px
  gutter: 16px
---

## Brand & Style

This design system is built for a premium, "gourmet-to-go" fast food experience. The brand personality is indulgent, sophisticated, and editorial, moving away from typical quick-service imagery toward a fine-dining aesthetic. 

The visual style blends **Minimalism** with **Tonal Layering**. It uses large, cinematic food photography as a structural element, framed by generous negative space and high-contrast surfaces. The interface should feel like a high-end lifestyle magazine—effortless, expensive, and curated. The emotional response is one of "affordable luxury," where the user feels they are treating themselves to something special.

## Colors

The palette is anchored by a deep **Burgundy**, used to evoke richness and appetite. This is paired with a **Cream/Off-White** (secondary) for a classic, sophisticated contrast. 

The default mode is a **high-contrast dark theme**. In this mode, the primary background is a near-black neutral (#1A1416) with deep burgundy used for primary actions and container backgrounds. The Cream/Off-White is used primarily for typography and elevated surface elements to maintain legibility. A soft **Metallic Gold** (#D4AF37) is used sparingly for accents, ratings, and premium "loyalty" indicators.

## Typography

The typographic hierarchy uses a high-contrast pairing of a classic serif and a precision sans-serif. 

**Playfair Display** is used for all headlines and price points to reinforce the "gourmet" narrative. Its elegant curves and thin hair-lines provide a sense of craft. For high-impact areas like hero headers, use tighter letter-spacing.

**Hanken Grotesk** handles all functional text and body copy. It is a clean, contemporary sans-serif that ensures clarity in dense menus or ingredient lists. Labels should often be set in uppercase with slight tracking to create a "designer brand" feel.

## Layout & Spacing

The layout follows a **Fluid Grid** with a 4-column structure for mobile and an 8-column structure for tablets. 

A "Safe-Area Vertical Rhythm" is maintained using a 8px baseline. Content cards and headers should prioritize generous vertical margins (`lg` or `xl`) to create an airy, premium feel. 

**Adaptive Rules:**
- **Mobile:** Single column list view for products with full-bleed imagery. 20px horizontal margins.
- **Tablet:** 2-column grid for product cards.
- **Desktop:** Fixed max-width container (1200px) with centered alignment.

## Elevation & Depth

Depth is achieved through **Tonal Layers** rather than heavy shadows. 

1.  **Base Layer:** Dark Neutral (#1A1416).
2.  **Surface Layer:** Deep Burgundy (#6B0D33) containers for primary navigation or featured banners.
3.  **Elevated Layer:** Cream (#F9F5F2) surfaces for product cards or modals. 

When shadows are required for interactive elements, use **Ambient Tinted Shadows**: low-opacity burgundy-tinted blurs (0px 8px 24px rgba(107, 13, 51, 0.2)) to ensure the elevation feels integrated with the brand color. In dark mode, use soft inner-glows (1px top border at 10% white) to define edges instead of drop shadows.

## Shapes

The shape language is defined by **pronounced, organic curves**. 

Standard UI components like inputs and small buttons use a `0.5rem` (8px) radius. However, primary containers, product cards, and the main bottom navigation bar utilize a larger, "pill-soft" radius of **24px to 32px**. This extreme roundedness softens the high-contrast color palette, making the app feel approachable and modern. Product images within cards should follow the card's corner radius exactly.

## Components

### Product Cards
Cards feature a Cream (#F9F5F2) background with a 32px corner radius. The product image should be high-resolution, often with a slight "overhang" or bleed. Pricing is positioned at the bottom right in Playfair Display.

### Category Filters
Horizontal scrolling list of pill-shaped chips. 
- **Inactive:** Transparent background with a thin Cream border.
- **Active:** Solid Burgundy background with Cream text.

### Persistent Bottom Navigation
A floating bar with a 32px radius, detached from the bottom edge by 16px. Use a semi-transparent Deep Burgundy with a backdrop-blur (Glassmorphism) effect. Icons should be minimal line-art with a "Gold" highlight for the active state.

### Input Fields
Used for search or customization. Minimalist style with a solid background and 8px corner radius. Focus state is indicated by a subtle Gold border.

### Primary Action Button
Full-width buttons with a 32px radius. Use the Deep Burgundy background for "Add to Cart" and the Gold accent for "Checkout" to denote the final step in the user journey.