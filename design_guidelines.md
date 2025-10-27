# Design Guidelines: Retail Product Data Collection Web Application

## Design Approach

**Selected Approach:** Material Design System  
**Justification:** Mobile-first utility application requiring efficient data entry, clear feedback, and robust form components. Material Design excels at mobile interfaces with strong visual hierarchy and touch-friendly interactions.

**Key Design Principles:**
- Mobile-first: Every interaction optimized for single-hand phone operation
- Efficiency: Minimize steps between scan and data entry
- Clarity: Immediate visual feedback for all actions
- Accessibility: Large touch targets, clear form labels

---

## Typography

**Primary Font:** Roboto (via Google Fonts CDN)

**Hierarchy:**
- Page Headers: 24px, Medium (500)
- Section Headers: 20px, Medium (500)  
- Form Labels: 14px, Medium (500)
- Input Text: 16px, Regular (400)
- Body Text: 14px, Regular (400)
- Button Text: 14px, Medium (500), uppercase
- Helper Text: 12px, Regular (400)

**Language Support:** Ensure full Cyrillic character support for Russian interface

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, and 8
- Standard padding: p-4 or p-6
- Section spacing: mb-6 or mb-8
- Input spacing: mb-4
- Tight spacing: gap-2
- Comfortable spacing: gap-4

**Container Strategy:**
- Mobile: Full width with px-4 padding
- Content max-width: max-w-2xl for forms
- Cards: Full width within container

**Grid System:**
- Single column layout for mobile primary view
- Two-column for history table on larger viewports (md:grid-cols-2)

---

## Component Library

### Core UI Elements

**Scanner View:**
- Full-width camera viewport area with overlay guides
- Centered scanning frame (280x200px) with corner markers
- Live barcode detection indicator
- Top bar: Close/Back button (left), Flash toggle (right)
- Bottom instruction text: "Наведите камеру на штрихкод"

**Cards:**
- Elevated style with subtle shadow
- Rounded corners: rounded-lg
- Padding: p-6
- Clear separation between sections

**Buttons:**
- Primary: Filled, prominent, min-height 48px
- Secondary: Outlined, min-height 48px  
- Icon buttons: 48x48px touch target
- Floating Action Button (FAB): 56px diameter, fixed bottom-right for "Scan Next"

### Navigation

**Top App Bar:**
- Fixed position, height 56px
- Left: Menu/Back icon
- Center: Page title
- Right: Export icon, Settings icon
- Elevated shadow on scroll

**Bottom Navigation (if needed for multi-section app):**
- Height: 56px
- Icons with labels
- Active state clearly indicated

### Forms

**Input Fields:**
- Outlined style (Material)
- Height: 56px minimum
- Label: Floating label pattern
- Helper text below field
- Error states with red accent
- Required field indicator (*)

**Field Types:**
- Barcode: Read-only with scan icon
- Product Name: Text input with microphone icon for voice
- Price: Number input, right-aligned
- Category: Dropdown select
- Unit: Dropdown select with common options

**Voice Input Indicator:**
- Microphone icon button within input
- Animated ripple during recording
- Visual feedback showing recognized text

### Data Displays

**Product History Table:**
- Sticky header row
- Alternating row backgrounds for readability
- Columns: Barcode | Name | Price | Category | Unit
- Mobile: Stack as cards, show 3 key fields
- Desktop: Full table with all columns

**Success Confirmation:**
- Snackbar at bottom (48px height)
- Green accent with checkmark icon
- Auto-dismiss after 3 seconds
- Message: "Товар успешно добавлен"

### Overlays

**Export Modal:**
- Centered overlay
- White background with rounded corners
- Options: CSV, JSON format selection
- Preview of data count
- Download button (primary)
- Cancel button (text)

**Loading States:**
- Circular progress indicator for camera initialization
- Linear progress for data saving
- Skeleton screens for table loading

---

## Icons

**Library:** Material Icons (via Google Fonts CDN)

**Key Icons:**
- Scanner: `qr_code_scanner`
- Voice input: `mic`
- Export: `download`
- Success: `check_circle`
- Error: `error`
- Camera: `photo_camera`
- Flash: `flash_on` / `flash_off`
- Back: `arrow_back`
- Menu: `menu`

---

## Interaction Patterns

**Scanner Flow:**
1. Tap "Сканировать штрихкод" button
2. Camera opens full-screen
3. Auto-detect barcode → vibration feedback
4. Transition to form with barcode pre-filled
5. Complete remaining fields
6. Save → Confirmation → Auto-reset for next scan

**Voice Input Flow:**
1. Tap microphone icon in input field
2. Visual pulse animation during listening
3. Real-time transcription display
4. Tap to stop or auto-stop after pause
5. Edit text if needed

**Export Flow:**
1. Tap export icon in app bar
2. Modal shows format selection (CSV/JSON)
3. Preview total products count
4. Tap download → File downloads
5. Success message

---

## Accessibility & Performance

- Minimum touch target: 48x48px
- High contrast text (WCAG AA minimum)
- Clear focus indicators for keyboard navigation
- Labels in Russian, properly associated with inputs
- Optimized camera stream for battery efficiency
- Offline capability with local storage before sync

---

## Images & Visual Assets

**No Hero Images Required** - Utility application focused on functionality

**Icon Usage:**
- Use Material Icons consistently
- Barcode scanning illustrations for empty states
- Success/error icons in feedback messages

**Empty States:**
- Simple illustration of barcode + phone
- Helpful text: "Начните сканирование товаров"