/* Sé Rafi — demo catalog.
   Used only while Shopify is not connected (see js/config.js).
   Names, prices and descriptions are placeholders for the mockup. */
window.SERAFI_CATALOG = [
  // Rings
  { handle: 'thread-band', title: 'Thread Band', category: 'rings', price: 185, stackable: true, tags: ['bestseller'],
    art: { kind: 'ring', style: 'thin' },
    description: 'A 1.2mm band that sits close to the skin. The simplest way to start a stack, or to fill the gap between two bolder rings.',
    details: ['Band width approx. 1.2mm', 'Solid 14k gold', 'Polished finish'] },
  { handle: 'whisper-pave-band', title: 'Whisper Pavé Band', category: 'rings', price: 640, stackable: true, tags: ['bestseller'],
    art: { kind: 'ring', style: 'pave', stone: 'diamond' },
    description: 'Tiny white diamonds set halfway around a slim band, so the sparkle faces up and the palm side stays smooth.',
    details: ['Band width approx. 1.6mm', 'Half-eternity pavé setting', 'Solid 14k gold'] },
  { handle: 'dew-solitaire', title: 'Dew Solitaire', category: 'rings', price: 890, stackable: true, tags: ['bestseller', 'new'],
    art: { kind: 'ring', style: 'solitaire', stone: 'diamond' },
    description: 'A single round diamond held low in four prongs, set close enough to the band that it stacks without snagging.',
    details: ['Round white diamond', 'Low four-prong setting', 'Solid 14k gold'] },
  { handle: 'rope-twist-band', title: 'Rope Twist Band', category: 'rings', price: 260, stackable: true, tags: [],
    art: { kind: 'ring', style: 'twist' },
    description: 'Two fine strands twisted together. Adds texture between polished bands.',
    details: ['Band width approx. 1.8mm', 'Twisted wire construction', 'Solid 14k gold'] },
  { handle: 'petal-marquise', title: 'Petal Marquise Ring', category: 'rings', price: 720, stackable: true, tags: ['new'],
    art: { kind: 'ring', style: 'marquise', stone: 'diamond' },
    description: 'A marquise diamond set east to west across the finger, like a petal laid flat.',
    details: ['Marquise white diamond', 'East-west setting', 'Solid 14k gold'] },
  { handle: 'spinel-pip-ring', title: 'Spinel Pip Ring', category: 'rings', price: 480, stackable: true, tags: ['new'],
    art: { kind: 'ring', style: 'bezel', stone: 'spinel' },
    description: 'A small round red spinel in a smooth bezel. One drop of color for an otherwise quiet stack.',
    details: ['Round red spinel', 'Bezel setting', 'Solid 14k gold'] },
  { handle: 'sapphire-trio-ring', title: 'Sapphire Trio Ring', category: 'rings', price: 560, stackable: true, tags: [],
    art: { kind: 'ring', style: 'trio', stone: 'sapphire' },
    description: 'Three blue sapphires in bezels, spaced along the top of a slim band.',
    details: ['Three round blue sapphires', 'Bezel settings', 'Solid 14k gold'] },
  { handle: 'eternity-line', title: 'Eternity Line', category: 'rings', price: 1450, stackable: true, tags: ['bestseller'],
    art: { kind: 'ring', style: 'eternity', stone: 'diamond' },
    description: 'White diamonds set all the way around. Made to order in your size because the stones leave no room to resize.',
    details: ['Full-eternity setting', 'Made to order, 3 to 4 weeks', 'Solid 14k gold'] },
  { handle: 'rafi-signet', title: 'Rafi Signet', category: 'rings', price: 780, stackable: true, tags: [],
    art: { kind: 'ring', style: 'signet' },
    description: 'A small oval signet with room for two or three engraved initials.',
    details: ['Oval face approx. 9 x 6mm', 'Engraving available', 'Solid 14k gold'] },
  { handle: 'dome-band', title: 'Dome Band', category: 'rings', price: 320, stackable: true, tags: [],
    art: { kind: 'ring', style: 'dome' },
    description: 'A wider, softly domed band that anchors the bottom of a stack.',
    details: ['Band width approx. 3mm', 'Domed profile', 'Solid 14k gold'] },

  // Necklaces
  { handle: 'pip-pendant', title: 'Pip Pendant Necklace', category: 'necklaces', price: 420, tags: ['bestseller'],
    art: { kind: 'necklace', style: 'pendant', stone: 'diamond' },
    description: 'A bezel-set diamond on a fine cable chain, adjustable at 16 and 18 inches.',
    details: ['Adjustable 16" / 18" chain', 'Bezel-set white diamond', 'Solid 14k gold'] },
  { handle: 'thread-chain', title: 'Thread Chain', category: 'necklaces', price: 240, tags: [],
    art: { kind: 'necklace', style: 'chain' },
    description: 'A fine cable chain to wear alone or layered under a pendant.',
    details: ['Available in 16" and 18"', 'Spring ring clasp', 'Solid 14k gold'] },
  { handle: 'pave-bar-necklace', title: 'Pavé Bar Necklace', category: 'necklaces', price: 680, tags: [],
    art: { kind: 'necklace', style: 'bar', stone: 'diamond' },
    description: 'A short bar of pavé diamonds that sits flat at the collarbone.',
    details: ['Bar length approx. 15mm', 'Adjustable 16" / 18" chain', 'Solid 14k gold'] },

  // Earrings
  { handle: 'dew-studs', title: 'Dew Studs', category: 'earrings', price: 520, tags: ['bestseller'],
    art: { kind: 'earrings', style: 'studs', stone: 'diamond' },
    description: 'Round diamonds in four prongs, sold as a pair.',
    details: ['Sold as a pair', 'Push backs', 'Solid 14k gold'] },
  { handle: 'pave-huggies', title: 'Pavé Huggies', category: 'earrings', price: 590, tags: ['new'],
    art: { kind: 'earrings', style: 'huggie', stone: 'diamond' },
    description: 'Small hinged hoops with pavé on the front face. Made to stack in a second or third piercing.',
    details: ['Inner diameter approx. 8mm', 'Hinged closure', 'Sold as a pair'] },
  { handle: 'thread-hoops', title: 'Thread Hoops', category: 'earrings', price: 280, tags: [],
    art: { kind: 'earrings', style: 'thread-hoop' },
    description: 'Light, fine-gauge hoops for everyday wear.',
    details: ['Diameter approx. 14mm', 'Hinged closure', 'Sold as a pair'] },

  // Bracelets
  { handle: 'line-tennis-bracelet', title: 'Line Tennis Bracelet', category: 'bracelets', price: 2400, tags: [],
    art: { kind: 'bracelet', style: 'tennis', stone: 'diamond' },
    description: 'A continuous line of prong-set diamonds with a hidden box clasp.',
    details: ['Length 6.5"', 'Box clasp with safety latch', 'Solid 14k gold'] },
  { handle: 'thread-cuff', title: 'Thread Cuff', category: 'bracelets', price: 360, tags: [],
    art: { kind: 'bracelet', style: 'cuff' },
    description: 'An open cuff with polished ball ends. Slides on and stays put.',
    details: ['Fits wrists approx. 6" to 6.75"', 'Open cuff', 'Solid 14k gold'] }
];

/* Ready-made stacks shown on the home page and the stack builder (bottom ring first). */
window.SERAFI_STACKS = [
  { name: 'The quiet stack', note: 'Polished bands with one small stone.',
    rings: [['dome-band', 'yellow'], ['thread-band', 'yellow'], ['spinel-pip-ring', 'yellow'], ['thread-band', 'yellow']] },
  { name: 'The bright stack', note: 'Diamonds top to bottom.',
    rings: [['eternity-line', 'white'], ['whisper-pave-band', 'white'], ['dew-solitaire', 'white'], ['whisper-pave-band', 'white']] },
  { name: 'The mixed-metal stack', note: 'Yellow, rose and white together.',
    rings: [['rope-twist-band', 'rose'], ['whisper-pave-band', 'yellow'], ['petal-marquise', 'white'], ['thread-band', 'rose'], ['sapphire-trio-ring', 'yellow']] }
];
