# Design: Alchemist 404 Website

The site must feel like the game. Every visual element below comes from the game's own asset pack in `საიტის ვიზუალები/` (site visuals). Do not invent a different style.

## Art direction

Dark fantasy with a warm golden UI. The game's world art shows ruined temples, a winged statue, and a pink-purple dusk sky over near-black stone. The game UI is ornate gold frames decorated with dragon-skull carvings and green gem accents, with parchment or dark-slate panels inside. The website reproduces this: the world art is the backdrop, content lives inside the game's frames.

## Color tokens (extracted from the assets)

```css
:root {
  /* backgrounds */
  --ink:        #0d1115;   /* near-black page base (background art shadows) */
  --slate:      #1e364b;   /* deep blue stone */
  --steel:      #264b63;   /* lighter blue stone */
  /* sky accents */
  --dusk:       #834678;   /* purple sky */
  --rose:       #d088ad;   /* pink horizon glow */
  /* UI metals and panels */
  --gold:       #d7af59;   /* bright gold edge */
  --gold-mid:   #a68b4b;   /* mid gold */
  --bronze:     #5c4f32;   /* dark gold shadow */
  --parchment:  #d0cecb;   /* light panel fill (tutorial window interior) */
  --panel-dark: #17181a;   /* dark panel fill (button interior) */
  /* accent */
  --gem-green:  #3ddc55;   /* gem arrows/accents on frames */
  /* text */
  --text-light: #f2ede2;   /* on dark backgrounds */
  --text-dark:  #241d12;   /* on parchment panels */
}
```

Contrast rules: `--text-light` on `--ink`/`--slate`/`--panel-dark`; `--text-dark` on `--parchment`. Gold is for borders, headings, and decorative text, not for body copy on dark (fails AA at small sizes). `--gem-green` only for small accents and hover states, never body text.

## Typography

- **Comic Relief** (self-hosted, OFL license, from the font zip): all headings, nav, buttons. Bold for H1/H2.
- Body text: Comic Relief Regular if it stays readable at 16 to 18px; if long paragraphs (team bios) look too busy, fall back to a system stack (`Georgia, serif` tone fits) for body only. Decide by eye during build, headings stay Comic Relief either way.
- Scale: H1 clamp(2.2rem, 5vw, 3.5rem), H2 clamp(1.6rem, 3.5vw, 2.4rem), body 1rem/1.6.
- Hero title: use the logo image (`Alchemist_404_Logo`), not HTML text. Keep an sr-only h1 "Alchemist 404" for accessibility and SEO.

## Key assets and how to use them

| Raw asset (folder / file) | Use on site |
|---|---|
| `background/Ilustração_Sem_Título.png` | Full-bleed hero background (ruins + winged statue + dusk sky). Darken bottom edge with a gradient into `--ink` so the page flows into dark sections. |
| `ლოგო სათაურით/Alchemist_404_Logo (1).png` | Hero logo, centered. Also footer at small size. |
| `favicon/Alchemist_40ფ4_Logo (1).png` | Source for favicon set (gold 404 mark). |
| `აღწერის ფანჯარა/Turorial_Window (2).png` | "Tutorial window" frame: gold frame with dragon skulls, parchment interior, heart gem at top, arrow-gem bar at the bottom. Container for the About section, which is a 2-page pager: the frame's arrow gems are real buttons that page through the About text. |
| `აღწერის ფანჯარა/Turorial_Window_butons*.png` | Pressed states for the About pager arrows: `butons.png` is the idle bar (both gems green), `butons Left .png` has the left gem pink (left pressed), `butonsright.png` has the right gem pink (right pressed). The pink gem sprites are cropped by the asset pipeline and swapped in on press. |
| `ღილაკი/Box text_ (1).png` | Wide dark plaque with gold border and green gem arrows. Use as button / section-title plaque (9-slice or background-image with padding). |
| `ჩარჩო screenshot-ებისთვის/ENEMY_Health horizontal 3_.png` | Landscape gold frame with parchment interior. Frame for game screenshots. |
| `ჩარჩო წევრების ფოტოებისთვის/ENEMY_Health_ (1).png` | Portrait gold frame. Frame for team member photos (photo masked into the interior area). |
| `Alchemist website photos and bios/*.jpg,*.png` | Team photos: Anastasia (taso gegia.jpg), Davis Von Randow.png, Dragadin.jpg, Jacob Williams.jpg, Jamie Mullis.png, Mariam (მარიამ სიმონიშვილი.jpg). |

Frame technique: the frames are full illustrations with transparent outsides. Simplest robust approach: place the photo/text block absolutely inside a relatively-positioned frame image, with the interior area expressed in percentages of the frame size (tune once per frame). Test at all breakpoints.

## Page layout (single page, anchored nav)

1. **Header/nav**: slim dark bar, small logo left, anchor links (About, Features, Screenshots, Team, Contact). Collapses to a burger under 768px.
2. **Hero**: full-viewport background art, big logo, one-line tagline, primary CTA button (plaque asset) "Discover the game" scrolling to About.
3. **About**: tutorial-window frame containing the game description (what it is, real chemistry while playing).
4. **Features**: 3 or 4 short cards on dark plaques (Learn real chemistry, Action-puzzle gameplay, For students and the curious, Original art and music).
5. **Screenshots**: screenshots in the landscape gold frames. Until real screenshots are provided, use the background art and frame assets as placeholders with a note in the code.
6. **Team**: 6 members, portrait-framed photos, name + role in gold, bio text below or in a modal/expandable. Order: Anastasia (Founder, CEO, Developer), Jamie (Software Architect, Game Developer), Davis (Art Director, Illustrator), Jacob (Music Producer, Composer), Dragadin (Game Designer, Creative Writer), Mariam (Finance).
7. **Footer**: small logo, contact email placeholder, copyright, font license note.

## Motion

Subtle only: fade/slide-in on scroll (IntersectionObserver, CSS transitions), gentle hover glow (gold) on buttons and gem-green on arrows. Respect `prefers-reduced-motion`. No parallax libraries, no heavy animation.

## Responsive rules

- Mobile first. Background art: use `object-fit: cover` focused on the statue.
- Frames scale with their container; minimum readable body text 16px.
- Team grid: 1 column at 360px, 2 at 768px, 3 at 1440px.
