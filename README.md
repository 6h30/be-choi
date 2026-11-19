# Little Play: tap-and-play games for toddlers aged 1 to 3

Runs in the browser on phones and tablets. No app to install, no ads, no data collection. Sounds are generated in the browser with the Web Audio API, and pictures are emoji and SVG, so there are no image or audio files to download. The whole site is in English.

**Live site:** https://6h30.github.io/be-choi/

## How to run

**Quick try on a computer:** open `index.html` in Chrome. (Spoken words and offline mode need an `http` address, so the options below work better.)

**On a phone or tablet on the same Wi-Fi:**

```bash
cd be-choi
python -m http.server 8080
```

Then open `http://<your computer's IP address>:8080` on the phone.

**Put it online:** the repo is set up for GitHub Pages (branch `main`, root folder). Netlify Drop and Cloudflare Pages also work, since the site is static.

**Install like an app:** on iPhone/iPad tap Share, then "Add to Home Screen". On Android open the menu and choose "Install app". After the first visit with internet, the site also works offline.

**Parent area:** hold the ⚙️ button in the top-right corner of the menu for 2 seconds. There you can change the volume, turn the voice on or off, filter games by the child's age, and set the play timer.

## The twelve games and why they were chosen

| Game | From (months) | What the child does | Based on |
|---|---|---|---|
| 🎈 Bubbles | 12 | Taps bubbles to pop them. About half carry a thing inside (fruit, vehicle, toy or animal): popping it shows the thing and says its name, and animals make their sound. Rainbow bubbles pop in a shower of confetti. Tapping empty space blows a new bubble. | Instant cause and effect, plus a name for every surprise. Only a tap is needed. |
| 🙈 Peekaboo | 12 | Taps six cloths to reveal what is hiding. Each round is a different theme: animals, fruit, vehicles or toys. The name is spoken and the thing makes its sound. | Around 18 to 24 months children understand that hidden things still exist, so they love hiding and finding. |
| 🐮 Animal sounds | 12 | Taps one of 30 animals, on 5 themed pages (around the house, on the farm, pond and garden, in the jungle, forest, night and sea), to hear its sound and then its name. The first page has the gecko. | Children understand more than they can say. Hearing the sound and the name together helps with words. |
| 🎹 Music | 12 | Taps or slides a finger across 8 bars. A button switches between 5 instruments: xylophone, piano, bells, drums and an "animal band" where each bar is an animal. The ▶ button plays a tune or rhythm as a model. | Every melodic note is in the major scale, so any touch sounds pleasant. Rhythm and timbre give more to explore. |
| 🎨 Draw | 15 | Paints rainbow lines, stamps stars and flowers, stamps animals (each one makes its sound), or leaves a sparkle trail. A sponge clears the page. | Scribbling starts around 15 to 18 months. Big strokes, no "right way" to draw. |
| 🔔 Buttons | 18 | Twelve things to try: light switch, bell, drum, car, rocket (3, 2, 1), day and night, a door that opens on an animal, traffic light, train, alarm clock, a balloon that grows and pops, and a squeaky duck. | Toddlers love switches and buttons. Each one gives a different result. |
| 🐻 Feed the animals | 24 | Drags food to a hungry friend's mouth, or taps it and it flies there by itself. Six friends (bear, bunny, kitty, puppy, panda, monkey) take turns, each with a favourite food. 16 foods. | Simple dragging, tied to pretend play and caring for others. |
| 🧩 Shapes | 24 | Drags each shape into the matching hole. Ten shapes (circle, square, triangle, star, heart, diamond, oval, hexagon, rectangle, plus). Every few rounds there are four holes instead of three. | Shape sorting starts with the circle; by about 24 months children can match more complex shapes. |
| 🔍 Find it | 30 | Four kinds of question in turn: find a thing ("Where is the apple?"), find a colour, find the animal that makes the sound you hear, and find the group with the right number (one, two or three). After two wrong tries the right card glows as a hint. | Understanding spoken names of things and colours, and early counting. |
| 🚗 Vehicles | 15 | Taps one of 18 vehicles on 3 pages. Each one travels in its own lane: cars, buses and trucks on a road, the train on rails and boats on water along the bottom, planes, helicopter and rocket across the sky along the top. The picture tiles stay in the middle, and if several are tapped quickly the vehicles queue up and set off one after another, so none drives over another. Its name is spoken and it makes its sound. | Toddlers love vehicles. Slow, steady movement is easy to follow, and each vehicle type belongs to the right place. |
| 🛁 Bath time | 18 | Rubs a finger over a muddy animal to scrub it clean. Soap bubbles and squeaks follow the finger. When it is clean the animal makes its sound. Eight animals. | Scribbling and rubbing motions come early (15 to 18 months). No precision needed, no way to lose. |
| 🧺 Colour baskets | 28 | Drags fruit and other things into the basket of the same colour (red, yellow, green, orange). Two baskets first, three later. Tapping a thing sends it to the right basket. | Sorting by colour begins around 24 months and improves through age 3. |

## Design rules drawn from the research

1. **Big targets, simple gestures.** Nielsen Norman Group recommends touch targets of at least 2 × 2 cm for young children (4 times the adult size). Here most targets are about 3 to 6 cm. Studies suggest 2-year-olds manage tap and drag, while pinch, rotate and press-and-hold are hard. So only taps and drags are used.
2. **Dragging always has a way out.** For children under 5, some researchers suggest "tap the item, and it moves to the target". Feed the bear and Shapes both do this.
3. **Many fingers at once is fine.** Toddlers often touch with several fingers or a whole hand. Every game handles each finger separately.
4. **No losing, no score, no clock.** A wrong choice only wiggles, with no error sound. The pace is slow and never rushed.
5. **Every touch gives feedback** in sound and picture, because a one-year-old is learning "when I do something, something happens".
6. **No reading needed.** The small text is for the grown-up playing along. Words are spoken by the browser's built-in voice.
7. **Time limits.** The WHO advises no screen time under age 1 and no more than 1 hour a day for ages 2 to 4. The American Academy of Pediatrics suggests slow, open-ended apps and playing along with your child. The site has a timer (10 minutes by default) and a "see you next time" screen; only a parent (holding a button for 2 seconds) can keep playing.
8. **No way out of the site.** No links, no ads, no purchases.

### Sources read

- [Nielsen Norman Group: Children's UX and physical development](https://www.nngroup.com/articles/children-ux-physical-development/) (touch target size, gestures that suit each age)
- [Nacher et al.: Multi-touch gestures for pre-kindergarten children](https://riunet.upv.es/bitstream/handle/10251/64752/IJHCS-Nacher.pdf?sequence=2) (2- to 3-year-olds and touch gestures)
- [Albrecht et al., CHI PLAY 2018: Toddler Techie Touch Generation](https://unpaywall.org/10.1145%2F3242671.3242693) (children 18 to 42 months: dragging is harder than tapping, pinch and rotate hardest)
- [UXPA: Playful Interfaces](https://oldmagazine.uxpa.org/?p=11776) (the "tap, then tap" idea instead of drag and drop for under-5s)
- [Zero to Three: Milestones by Age](https://www.zerotothree.org/wp-content/uploads/2026/08/Milestones-by-Age-Chart.pdf) and [Britannica: Infant and toddler development](https://www.britannica.com/science/infant-and-toddler-development/Introduction) (developmental milestones)
- [Pathways.org: Screen time](https://pathways.org/screen-time-for-babies-and-children) (a summary of screen-time guidance)

**An honest note on sources:** many touch studies use small samples and mixed ages, so the numbers are best read as guidance. The screen-time guidance was read through summary pages, not the original WHO and AAP documents (the AAP has shifted in 2025 and 2026 toward content quality and co-viewing rather than fixed numbers). The ages in the table above are rough ranges, and every child is different.

## Current limits

- **Not yet tried on real devices.** The site was tested in desktop Chrome with touch emulation at three sizes (phone upright, phone sideways, iPad): tapping, dragging and opening the parent area all work with no errors. Sound levels were measured, but the sounds and the voice have not been heard by ear in testing.
- **Animal sounds: 8 real recordings, the rest synthesized.** Cat, dog, bird, cow, pig, sheep, horse and chicken use short real recordings (from Wikimedia Commons, CC0, public domain, CC BY and CC BY-SA; see the "Sound credits" list in the parent area). The other 22 animals are still built in the browser from a few oscillators and filters, so they sound cartoon-like. More recordings can be added by listing them in `sounds/index.json`. If a recording is missing or fails to load, the synthesized sound plays instead.
- **The voice depends on the device.** The site uses the built-in text-to-speech voice of the iPhone, iPad or Android phone. If no English voice is installed, spoken words may be skipped (the parent area explains how to install one). Sound and pictures still work.
- **iPhone/iPad:** the ringer switch must be on to hear sound.
- **Emoji** look a little different on iOS, Android and Windows.

## Files

- `index.html`, `style.css`: the interface
- `core.js`: settings, sound (30 animal sounds, vehicles, drums, instruments), voice, effects, drag helper
- `games-a.js`: bubbles, peekaboo, animal sounds, music (and the data for animals, food, vehicles, toys, objects, colours and counting)
- `games-b.js`: draw, buttons, feed the animals, shapes, find it
- `games-c.js`: vehicles, bath time, colour baskets
- `shell.js`: menu, parent area, timer
- `sounds/`: the animal recordings (trimmed, level-matched MP3s) and `index.json` with their credits
- `sw.js`, `manifest.webmanifest`, `icon*`: offline use and installing as an app

**To add a game:** add a block `BE.GAMES.push({ id, icon, color, bg, min, name, start(api) { ... } })` to `games-a.js` or `games-b.js`. The `api` object provides `say`, `on`, `timeout` and `loop`, all of which clean up when the child leaves the game.
