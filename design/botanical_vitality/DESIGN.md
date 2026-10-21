---
name: Botanical Vitality
colors:
  surface: '#f4fafd'
  surface-dim: '#d4dbdd'
  surface-bright: '#f4fafd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef5f7'
  surface-container: '#e8eff1'
  surface-container-high: '#e2e9ec'
  surface-container-highest: '#dde4e6'
  on-surface: '#161d1f'
  on-surface-variant: '#424843'
  inverse-surface: '#2b3234'
  inverse-on-surface: '#ebf2f4'
  outline: '#727973'
  outline-variant: '#c1c8c1'
  surface-tint: '#436652'
  primary: '#426450'
  on-primary: '#ffffff'
  primary-container: '#5a7d68'
  on-primary-container: '#fbfff9'
  inverse-primary: '#aacfb7'
  secondary: '#496455'
  on-secondary: '#ffffff'
  secondary-container: '#ccead6'
  on-secondary-container: '#4f6a5b'
  tertiary: '#8a4c3a'
  on-tertiary: '#ffffff'
  tertiary-container: '#a76450'
  on-tertiary-container: '#fffeff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c5ecd2'
  primary-fixed-dim: '#aacfb7'
  on-primary-fixed: '#002112'
  on-primary-fixed-variant: '#2c4e3b'
  secondary-fixed: '#ccead6'
  secondary-fixed-dim: '#b0cdbb'
  on-secondary-fixed: '#062014'
  on-secondary-fixed-variant: '#324c3e'
  tertiary-fixed: '#ffdbd0'
  tertiary-fixed-dim: '#ffb59f'
  on-tertiary-fixed: '#380d02'
  on-tertiary-fixed-variant: '#6f3726'
  background: '#f4fafd'
  on-background: '#161d1f'
  surface-variant: '#dde4e6'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 44px
    fontWeight: '700'
    lineHeight: 52px
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 2.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system reimagines wellness and herbal nutrition commerce through an editorial, trustworthy, and serene visual language. Departing from cluttered, high-intensity discount retail paradigms, it frames dietary science and botanical lifestyle products with calm authority, transparency, and warmth. 

The aesthetic is grounded in **Organic Warm Minimalism**, merging soft herbal sage tones, delicate warm cream canvases, and muted terracotta-blush accents with precise, readable typography. The experience prioritizes generous breathing room, intuitive hierarchical clarity, and tactile rounded containers that invite relaxed exploration. 

Targeted at health-conscious consumers who value clean formulations, self-care routines, and substantiated nutritional guidance, the interface communicates reliability and gentle restoration without clinical coldness.

## Colors

The palette balances earthy vitality with gentle warmth, ensuring high-contrast readability against softly tinted backgrounds:

- **Primary (`#5A7D68` - Sage Pine):** Used for primary conversion points, focused navigation markers, key icons, and verified status elements. Conveys natural balance and therapeutic authority.
- **Secondary (`#98B5A3` - Soft Mint Herb):** Deployed for supportive badges, category tags, soft container backdrops, and secondary interactive states.
- **Tertiary (`#E89B84` - Delicate Blush Peach):** Reserved strictly for promotional incentives, discount chips, urgency micro-copy, and active cart notifications, providing eye-catching warmth without aggressive neon disruption.
- **Neutral Surface & Backgrounds:** The base canvas operates on warm alabaster cream (`#FAF8F5`) layered with pure white (`#FFFFFF`) card surfaces and subtle borders (`#E6E8E5`).
- **Typography Neutrals:** Primary text relies on deep slate grey (`#2D3436`), avoiding harsh absolute blacks, while secondary specifications and inactive labels utilize mineral grey (`#636E72`).

## Typography

Typography establishes an intentional cadence between editorial warmth and clinical precision. 

- **Headlines (Plus Jakarta Sans):** Crafted with balanced geometric curves and friendly proportions. Headings maintain moderate letter spacing (`-0.02em` on `headline-xl` down to `-0.01em` on `headline-sm`) to anchor product bundles, hero storytelling, and section demarcations.
- **Body & Product Data (Inter):** Leveraged for comprehensive nutritional specs, ingredient breakdowns, pricing matrices, and metadata. Inter provides neutral clarity across dense e-commerce parameters.
- **Promotional & Numerical Styling:** Discount values and pricing tiers enforce tabular lining figures where applicable to preserve vertical optical alignments across multi-item cards.

## Layout & Spacing

A structured 12-column fluid grid orchestrates desktop screens, transitioning to an 8-column layout on tablet (`768px - 1024px`) and a 4-column layout on mobile devices (`< 768px`).

- **Grid Distances:** Column gutters contract from `1.5rem` desktop to `0.75rem` on mobile screens to preserve compact catalog viewability. Section canvases employ `2.5rem` outer margins on large viewports, collapsing to a secure `1rem` safe-margin along handheld edges.
- **Component Breathing Room:** Product grids employ `space-lg` horizontal and vertical spacing to isolate items cleanly without overwhelming visual borders. Internal card padding strictly respects `space-md` (`1rem`) to prevent suffocating botanical bottle renderings and multi-item gift sets.

## Elevation & Depth

Visual hierarchy rejects harsh drop shadows and skeuomorphic gradients in favor of **ambient daylight illumination and delicate tonal layering**:

- **Layer 0 (Canvas):** Warm alabaster background (`#FAF8F5`). Flat, non-reflective base.
- **Layer 1 (Cards & Product Tiles):** Solid white surface (`#FFFFFF`) with a faint micro-border (`1px solid #EBECE8`) and an ambient, whisper-soft shadow: `0 4px 16px -2px rgba(90, 125, 104, 0.05)`. This adds depth without visual grime.
- **Layer 2 (Hovered Cards & Dropdowns):** Subtle expansion to `0 8px 24px -4px rgba(45, 52, 54, 0.07)` accompanied by a light border shift towards `#DCE2DE`.
- **Layer 3 (Modals & Overlays):** Grounded by a translucent warm veil (`rgba(45, 52, 54, 0.35)`) and centered elevation: `0 16px 40px -8px rgba(45, 52, 54, 0.12)`.

## Shapes

The interface embraces a balanced curvature system (`roundedness: 2`), reflecting the natural geometry of leaves, capsules, and seed vessels:

- **Base Corner Radius (`0.5rem` / `8px`):** Standard for product imagery wrappers, input text fields, filter accordions, and dropdown menus.
- **Large Corner Radius (`1rem` / `16px`):** Applied to product cards, bundle showcase containers, and promotional feature carousels.
- **Pill Geometry (Fully Rounded / `9999px`):** Utilized exclusively for promotional discount tags (`-20%`), stock notifications, category chips, quantity steppers, and interactive primary action buttons.

## Components

### Buttons
- **Primary CTA:** Pill-shaped, background in Primary Sage (`#5A7D68`), text in crisp White (`#FFFFFF`). Padding: `0.75rem 1.5rem`. On hover, color transitions slightly deeper to `#4B6957` with no heavy outline.
- **Secondary / Ghost:** Pill-shaped, transparent background with a `1px` border in `#5A7D68` and text in `#5A7D68`. Hover state fills with an ultra-light wash (`rgba(90, 125, 104, 0.08)`).
- **Icon Quick-Add:** 40px round button embedded within card corners, white surface with `1px` subtle border, transitioning to Sage fill upon user hover.

### Product Badges & Chips
- **Discount Badges:** Soft blush pill (`#E89B84` text on `#FCEEE9` fill), uppercase `label-sm` weight, indicating promotional drops without harsh neon banners.
- **Category & Benefit Chips:** Rounded pill (`#5A7D68` text on `#EEF3F0` background). Selected filter states invert to solid Sage fill with white typography.

### Product Cards
- Contained within `#FFFFFF` cards, `1rem` rounded corners, bordered with `1px solid #EBECE8`.
- Contains centered photographic preview against a seamless neutral field, category metadata, bold headline title, star rating cluster, crossed-out original MSRP, and prominent current price.
- Footer houses a unified quantity selector and an ergonomic quick-action "Add to Basket" pill.

### Form Inputs & Search
- Integrated search and address fields feature `0.5rem` border radius, `#FAF8F5` interior fill, `1px` stroke in `#E1E4E0`, and an active focus state defined by a `1.5px` border in `#5A7D68` with zero outer ring glow.

### Lists & Cart Summaries
- Borderless list rows separated by continuous hairline dividers (`#F0F2EF`). Checkouts group item thumbnail, dynamic quantity stepper (`- 1 +` pill container), and item price aligned along a shared baseline.