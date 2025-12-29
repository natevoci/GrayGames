// =============================================
// Letter Hero - Game Logic
// A friendly typing game for kids learning
// the home row and beyond
// =============================================

class LetterHero {
    constructor() {
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.score = 0;
        this.difficulty = 1;
        this.correctPresses = 0; // Track correct presses for level progression
        this.newKeyCount = 0; // Track correct presses of the newly added key for this level
        this.currentLevelNewKey = null; // The key that was added at the current level
        this.baseSpeed = 1; // pixels per frame (reduced for kid-friendly pacing)
        this.speedMultiplier = 1;
        this.lastNewKey = null; // Track the last key that was added for level-up display

        // Keyboard rows and difficulty progression
        this.keyboardRows = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
        ];

        // Home row - start here
        this.homeRowKeys = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];

        // Progression: Start with 2 letters (F, I), add vowels early for word formation
        // 25 levels total to cover all letters
        this.progressionSequence = [
            ['F', 'I'],                                     // Level 1: Just the two index fingers
            ['F', 'I', 'A'],                                // Level 2: Add A (vowel early for words!)
            ['F', 'I', 'A', 'D'],                           // Level 3: Add D (words like AID!)
            ['F', 'I', 'A', 'D', 'K'],                      // Level 4: Add K
            ['F', 'I', 'A', 'D', 'K', 'S'],                 // Level 5: Add S
            ['F', 'I', 'A', 'D', 'K', 'S', 'L'],            // Level 6: Add L
            ['F', 'I', 'A', 'D', 'K', 'S', 'L', 'G'],       // Level 7: Add G
            ['F', 'I', 'A', 'D', 'K', 'S', 'L', 'G', 'H'],  // Level 8: Add H (full home row except J)
            ['F', 'I', 'A', 'D', 'K', 'S', 'L', 'G', 'H', 'E'],        // Level 9: Add E
            ['F', 'I', 'A', 'D', 'K', 'S', 'L', 'G', 'H', 'E', 'J'],   // Level 10: Add J (swapped with I)
            ['F', 'I', 'A', 'D', 'K', 'S', 'L', 'G', 'H', 'E', 'J', 'R'],     // Level 11: Add R
            ['F', 'I', 'A', 'D', 'K', 'S', 'L', 'G', 'H', 'E', 'J', 'R', 'U'], // Level 12: Add U
            ['F', 'I', 'A', 'D', 'K', 'S', 'L', 'G', 'H', 'E', 'J', 'R', 'U', 'T'],    // Level 13: Add T
            ['F', 'I', 'A', 'D', 'K', 'S', 'L', 'G', 'H', 'E', 'J', 'R', 'U', 'T', 'Y'], // Level 14: Add Y
            ['F', 'I', 'A', 'D', 'K', 'S', 'L', 'G', 'H', 'E', 'J', 'R', 'U', 'T', 'Y', 'Q'],    // Level 15: Add Q
            ['F', 'I', 'A', 'D', 'K', 'S', 'L', 'G', 'H', 'E', 'J', 'R', 'U', 'T', 'Y', 'Q', 'W'], // Level 16: Add W
            ['F', 'I', 'A', 'D', 'K', 'S', 'L', 'G', 'H', 'E', 'J', 'R', 'U', 'T', 'Y', 'Q', 'W', 'O'], // Level 17: Add O
            ['F', 'I', 'A', 'D', 'K', 'S', 'L', 'G', 'H', 'E', 'J', 'R', 'U', 'T', 'Y', 'Q', 'W', 'O', 'P'], // Level 18: Add P
            ['F', 'I', 'A', 'D', 'K', 'S', 'L', 'G', 'H', 'E', 'J', 'R', 'U', 'T', 'Y', 'Q', 'W', 'O', 'P', 'Z'],    // Level 19: Add Z
            ['F', 'I', 'A', 'D', 'K', 'S', 'L', 'G', 'H', 'E', 'J', 'R', 'U', 'T', 'Y', 'Q', 'W', 'O', 'P', 'Z', 'X'], // Level 20: Add X
            ['F', 'I', 'A', 'D', 'K', 'S', 'L', 'G', 'H', 'E', 'J', 'R', 'U', 'T', 'Y', 'Q', 'W', 'O', 'P', 'Z', 'X', 'C'],     // Level 21: Add C
            ['F', 'I', 'A', 'D', 'K', 'S', 'L', 'G', 'H', 'E', 'J', 'R', 'U', 'T', 'Y', 'Q', 'W', 'O', 'P', 'Z', 'X', 'C', 'V'],  // Level 22: Add V
            ['F', 'I', 'A', 'D', 'K', 'S', 'L', 'G', 'H', 'E', 'J', 'R', 'U', 'T', 'Y', 'Q', 'W', 'O', 'P', 'Z', 'X', 'C', 'V', 'B'], // Level 23: Add B
            ['F', 'I', 'A', 'D', 'K', 'S', 'L', 'G', 'H', 'E', 'J', 'R', 'U', 'T', 'Y', 'Q', 'W', 'O', 'P', 'Z', 'X', 'C', 'V', 'B', 'N'], // Level 24: Add N
            ['F', 'I', 'A', 'D', 'K', 'S', 'L', 'G', 'H', 'E', 'J', 'R', 'U', 'T', 'Y', 'Q', 'W', 'O', 'P', 'Z', 'X', 'C', 'V', 'B', 'N', 'M']  // Level 25: Add M (all keys)
        ];

        // Dictionary of kid-friendly words (curated for young learners)
        // Includes animals, colors, body parts, foods, objects, and actions
        this.wordDictionary = [
            // Basic 2-3 letter words
            'IF', 'IS', 'AS', 'AD', 'ID', 'FA', 'GO', 'NO', 'SO',
            
            // Animals
            'BAT', 'BEE', 'BUG', 'CAT', 'COD', 'COW', 'DAM', 'DOG', 'EEL', 'ELK', 'EMU', 'FLY', 'FOX', 'JAG', 'JAM', 'OWL', 'PIG', 'RAM',
            'BIRD', 'FISH', 'FROG', 'GOAT', 'HARE', 'KITE', 'MOLE', 'SEAL', 'SLUG', 'TOAD',
            'SHARK', 'SNAKE', 'TIGER', 'WHALE', 'ZEBRA',
            
            // Colors
            'RED', 'GOLD', 'BLUE',
            
            // Body Parts
            'ARM', 'EAR', 'EYE', 'JAW', 'LEG', 'LIP', 'TOE',
            'CHIN', 'FOOT', 'HAIR', 'HAND', 'HEAD', 'HEEL', 'KNEE', 'NAIL', 'SKIN',
            
            // Foods & Drinks
            'BUN', 'GUM', 'HAM', 'JAM', 'NUT', 'OAT', 'PIE', 'RYE',
            'BREAD', 'CAKE', 'CORN', 'DATE', 'FISH', 'FIGS', 'FRUIT', 'GRAIN', 'JUICE', 'JELLY', 'MILK', 'RICE', 'SALAD', 'SALT', 'STEW',
            'BUTTER', 'CHEESE', 'CUSTARD', 'GARLIC', 'GRAVY', 'KERNEL', 'SALADS',
            
            // Objects & Things
            'BAG', 'BAD', 'BED', 'BIG', 'BOX', 'BUS', 'CAN', 'CAR', 'COT', 'CUP', 'DAD', 'DEN', 'DUO', 'FLAG', 'FAN', 'FUN', 'GEL', 'HAT', 'HUT', 'JET', 'JUG', 'KEY', 'LAD', 'LAP', 'LID', 'MAP', 'MUD', 'NET', 'OAR', 'PAD', 'PAN', 'PAT', 'PEN', 'PET', 'PIN', 'POT', 'RAG', 'RAN', 'RAT', 'RUG', 'SAD', 'SAG', 'SIT', 'SKI', 'TAR', 'TAN', 'TEA', 'TEN', 'TOP', 'TOY', 'TUB', 'VAN', 'VAT', 'WEB',
            'BELT', 'BENT', 'BEST', 'BOAT', 'BOLT', 'BOOT', 'BUMP', 'CANE', 'CART', 'COAT', 'COIN', 'CRIB', 'DESK', 'DIAL', 'DUST', 'FORK', 'GAME', 'GATE', 'GIFT', 'GOAL', 'GOLF', 'GRIP', 'GUST', 'HOSE', 'HOST', 'HUNT', 'IDLE', 'JAIL', 'JEST', 'JOKE', 'JUMP', 'JUNK', 'KALE', 'KITE', 'KNIT', 'LACE', 'LAMP', 'LAST', 'LEAD', 'LEFT', 'LENS', 'LIFT', 'LIKE', 'LIME', 'LINE', 'LIST', 'LOAD', 'LOCK', 'LOOK', 'LOOP', 'LOST', 'MAIL', 'MAZE', 'MEAL', 'MEAN', 'MEAT', 'MESH', 'MINT', 'MISS', 'MIST', 'MOAT', 'MODE', 'MOLE', 'MOOD', 'MOPE', 'MOSS', 'MOST', 'NAME', 'NEAT', 'NECK', 'NEST', 'NEXT', 'NOTE', 'NOSE', 'OINK', 'ONCE', 'ONLY', 'PACK', 'PAGE', 'PAIL', 'PAID', 'PAIN', 'PALE', 'PALM', 'PANE', 'PANT', 'PARK', 'PART', 'PASS', 'PAST', 'PATE', 'PATH', 'PEAR', 'PEEL', 'PEST', 'PICK', 'PILE', 'PINE', 'PINK', 'PLAN', 'PLAY', 'PLOT', 'PLUG', 'PLUM', 'POEM', 'POKE', 'POLE', 'POOL', 'POPE', 'PORE', 'PORK', 'PORT', 'POSE', 'POST', 'POUR', 'PRAY', 'PULL', 'PUMP', 'PUNK', 'PUSH', 'QUIT', 'RACE', 'RACK', 'RAGE', 'RAID', 'RAIL', 'RAIN', 'RAKE', 'RAMP', 'RANG', 'RANK', 'RARE', 'RATE', 'RAVE', 'READ', 'REAL', 'REAP', 'REAR', 'REEL', 'RENT', 'REST', 'RICE', 'RICH', 'RIDE', 'RIFE', 'RIFT', 'RING', 'RINK', 'RIOT', 'RIPE', 'RISE', 'RISK', 'ROAD', 'ROAM', 'ROAR', 'ROBE', 'ROCK', 'RODE', 'ROLE', 'ROLL', 'ROMP', 'ROOF', 'ROOK', 'ROOM', 'ROOT', 'ROPE', 'ROSE', 'ROTE', 'RULE', 'RUNG', 'RUST', 'SAFE', 'SAGE', 'SAID', 'SAIL', 'SAKE', 'SALE', 'SALT', 'SAME', 'SAND', 'SANE', 'SANG', 'SANK', 'SASH', 'SEAL', 'SEAM', 'SEAT', 'SEED', 'SEEK', 'SEEM', 'SEEN', 'SELF', 'SELL', 'SEMI', 'SENT', 'SHED', 'SHIN', 'SHIP', 'SHOE', 'SHOP', 'SHOT', 'SHOW', 'SHUT', 'SICK', 'SIDE', 'SIFT', 'SIGN', 'SILK', 'SILL', 'SING', 'SINK', 'SIRE', 'SITE', 'SIZE', 'SKIM', 'SKIN', 'SKIP', 'SKIS', 'SLAB', 'SLAG', 'SLAM', 'SLAP', 'SLAT', 'SLED', 'SLID', 'SLIM', 'SLIP', 'SLOW', 'SMOG', 'SNAP', 'SNIP', 'SNOW', 'SOAR', 'SOCK', 'SODA', 'SOFA', 'SOFT', 'SOIL', 'SOLD', 'SOLE', 'SOLO', 'SOME', 'SONG', 'SOON', 'SORE', 'SORT', 'SOUL', 'SOUP', 'SOUR', 'SPAN', 'SPED', 'SPIN', 'SPIT', 'SPOT', 'STAB', 'STAG', 'STAR', 'STAY', 'STEM', 'STEP', 'STEW', 'STIR', 'STOP', 'STUB', 'STUD', 'SUIT', 'SULK', 'SURF', 'SWAP', 'SWAY', 'SWIM', 'TAIL', 'TAKE', 'TALE', 'TALK', 'TALL', 'TAME', 'TANK', 'TAPE', 'TASK', 'TAUT', 'TAXI', 'TEAM', 'TEAR', 'TEASE', 'TEEN', 'TELL', 'TEND', 'TENT', 'TERM', 'TEST', 'TEXT', 'THAN', 'THAT', 'THEM', 'THEN', 'THEY', 'THIN', 'THIS', 'THOU', 'THUD', 'THUS', 'TICK', 'TIDE', 'TIDY', 'TIED', 'TIER', 'TIES', 'TILE', 'TILT', 'TIME', 'TINE', 'TINT', 'TINY', 'TIRE', 'TOAD', 'TOGS', 'TOIL', 'TOLD', 'TOLL', 'TOMB', 'TOME', 'TONE', 'TOOK', 'TOOL', 'TOOT', 'TOPS', 'TORE', 'TORN', 'TORT', 'TOSS', 'TOUR', 'TOUT', 'TOWN', 'TRAP', 'TRAY', 'TREE', 'TREK', 'TRIM', 'TRIO', 'TRIP', 'TROT', 'TRUE', 'TUBE', 'TUCK', 'TUFT', 'TUNA', 'TUNE', 'TURN', 'TUSK', 'TUTU', 'TWAS', 'TWIG', 'TWIN', 'TWINE', 'UGLY', 'UNDO', 'UNIT', 'UNTO', 'UPON', 'USED', 'USER', 'VAIN', 'VALE', 'VANE', 'VARY', 'VASE', 'VAST', 'VEAL', 'VEIL', 'VEIN', 'VENT', 'VERB', 'VERY', 'VEST', 'VETO', 'VICE', 'VIED', 'VIEW', 'VILE', 'VINE', 'VOID', 'VOTE', 'WADE', 'WAGE', 'WAIL', 'WAIT', 'WAKE', 'WALK', 'WALL', 'WANE', 'WANT', 'WARD', 'WARE', 'WARM', 'WARN', 'WARP', 'WARS', 'WART', 'WASH', 'WASP', 'WAVE', 'WAVY', 'WEAK', 'WEAL', 'WEAR', 'WEAVE', 'WEBS', 'WEDS', 'WEED', 'WEEK', 'WEEP', 'WELD', 'WELL', 'WENT', 'WEPT', 'WERE', 'WEST', 'WHAT', 'WHEN', 'WHET', 'WHEY', 'WHIM', 'WHIP', 'WHIZ', 'WHOM', 'WIDE', 'WIFE', 'WILD', 'WILL', 'WILT', 'WIMP', 'WIND', 'WINE', 'WING', 'WINK', 'WIPE', 'WIRE', 'WIRY', 'WISE', 'WISH', 'WITH', 'WOLF', 'WOMB', 'WONT', 'WOOD', 'WOOL', 'WORD', 'WORE', 'WORK', 'WORM', 'WORN', 'WRAP', 'WREN', 'WRIT', 'YARD', 'YARN', 'YAWN', 'YEAR', 'YELL', 'YELP', 'YOKE', 'YOLK', 'YOUR', 'ZEAL', 'ZERO', 'ZEST', 'ZONE', 'ZOOM',
            
            // Actions & Verbs (short)
            'AIM', 'ATE', 'BED', 'BIT', 'BOW', 'BUY', 'CRY', 'CUT', 'DIP', 'DRY', 'EAT', 'FAN', 'FIT', 'FLY', 'GOT', 'GUN', 'HAD', 'HAS', 'HER', 'HIM', 'HIS', 'HOP', 'HOW', 'HUG', 'JOG', 'LAY', 'LET', 'LIE', 'MET', 'MIX', 'NOD', 'NOT', 'NOW', 'OWE', 'OWN', 'PAY', 'PET', 'PUT', 'RAN', 'RAT', 'RID', 'RUN', 'SAT', 'SAW', 'SAY', 'SET', 'SIT', 'SUM', 'TAN', 'TAP', 'TIE', 'TIP', 'TOO', 'TRY', 'USE', 'VIA', 'WAG', 'WAR', 'WAS', 'WAX', 'WAY', 'WHO', 'WHY', 'WOE', 'WON', 'YES', 'YET', 'YOU', 'ZAP',
            'BEND', 'BANG', 'BITE', 'BLOW', 'BOIL', 'BOLT', 'BOND', 'BOOT', 'BUMP', 'BURN', 'CALL', 'CALM', 'CAME', 'CARE', 'CAST', 'CHEW', 'CLAP', 'CLEAN', 'CLIMB', 'CLING', 'CLOSE', 'CLOWN', 'CLUE', 'COIL', 'COMET', 'COMMAND', 'COPE', 'COULD', 'COUNT', 'COURT', 'COVER', 'CRAFT', 'CRASH', 'CRAWL', 'CRAZE', 'CREAM', 'CREED', 'CREEP', 'CRIME', 'CRISP', 'CROWN', 'CRUDE', 'CRUEL', 'CRUSH', 'DANCE', 'DARE', 'DECAY', 'DECOR', 'DEFER', 'DELAY', 'DENIM', 'DENSE', 'DEPTH', 'DETER', 'DIAL', 'DICED', 'DIME', 'DINED', 'DIRECT', 'DIVINE', 'DIVER', 'DIZZY', 'DODGE', 'DOING', 'DOMED', 'DOUBT', 'DOUGH', 'DOWEL', 'DOWER', 'DRAFT', 'DRAIN', 'DRAKE', 'DRANK', 'DRAPE', 'DREAD', 'DREAM', 'DRESS', 'DRIED', 'DRIFT', 'DRILL', 'DRINK', 'DRIVE', 'DROIT', 'DRONE', 'DROOP', 'DROWN', 'DRUNK', 'EASED', 'EIGHT', 'EJECT', 'ELATE', 'ELDER', 'ELECT', 'ELITE', 'ELUDE', 'EMAIL', 'EMBED', 'EMBER', 'ENEMY', 'ENJOY', 'ENRAGE', 'ENTER', 'EQUAL', 'EQUIP', 'ERASE', 'ERECT', 'ERROR', 'EVENT', 'EVERY', 'EXACT', 'EXILE', 'EXIST', 'EXPEL', 'EXTRA', 'EXUDE', 'EYING',
            'FADED', 'FAINT', 'FAIRY', 'FAITH', 'FAKER', 'FALLS', 'FALSE', 'FANCY', 'FARED', 'FARMS', 'FATTY', 'FAULT', 'FAVOR', 'FEARS', 'FEAST', 'FEATS', 'FEEDS', 'FEELS', 'FEMUR', 'FENCE', 'FERAL', 'FERRY', 'FIBER', 'FIELD', 'FIEND', 'FIERY', 'FIFTH', 'FIFTY', 'FIGHT', 'FILCH', 'FILED', 'FILER', 'FILES', 'FILLY', 'FILMS', 'FILMY', 'FILTH', 'FINAL', 'FINCH', 'FINDS', 'FINED', 'FINER', 'FINES', 'FIRED', 'FIRER', 'FIRES', 'FIRST', 'FIRTH', 'FISSURE', 'FITS', 'FIXED', 'FIXER', 'FIZZY', 'FLACK', 'FLAIL', 'FLAIR', 'FLAKE', 'FLAKY', 'FLAME', 'FLANK', 'FLAPS', 'FLARE', 'FLASH', 'FLASK', 'FLATS', 'FLAWED', 'FLAX', 'FLECK', 'FLED', 'FLEE', 'FLEET', 'FLESH', 'FLEWS', 'FLEXED', 'FLICKS', 'FLIED', 'FLIER', 'FLIES', 'FLIGHT', 'FLIMY', 'FLINCH', 'FLING', 'FLINT', 'FLIPS', 'FLIRT', 'FLITS', 'FLOAT', 'FLOCK', 'FLOGS', 'FLOOD', 'FLOOR', 'FLOPS', 'FLORA', 'FLOUR', 'FLOUT', 'FLOWS', 'FLOWN', 'FLOWS', 'FLUBS', 'FLUFFY', 'FLUID', 'FLUKE', 'FLUNG', 'FLUNK', 'FLUSH', 'FLUTE', 'FOAMS', 'FOAMY', 'FOCAL', 'FOCUS', 'FOILS', 'FOIST', 'FOLDS', 'FOLIO', 'FOLKS', 'FOLLY', 'FONTS', 'FOODS', 'FOOLS', 'FOOTS', 'FORAY', 'FORCE', 'FORDS', 'FORGE', 'FORGO', 'FORKS', 'FORMS', 'FORTE', 'FORTH', 'FORTY', 'FORUM', 'FOSSA', 'FOSSIL', 'FOULS', 'FOUND', 'FOUNT', 'FOURS', 'FOWLS', 'FOXES', 'FOYER', 'FRAIL', 'FRAME', 'FRANK', 'FRAUD', 'FRAYS', 'FREAK', 'FREED', 'FREER', 'FRESH', 'FRETS', 'FRIAR', 'FRIED', 'FRIER', 'FRIES', 'FRILL', 'FRISK', 'FRIZZ', 'FROCK', 'FROGS', 'FROND', 'FRONT', 'FROST', 'FROTH', 'FROWN', 'FROZE', 'FRUIT', 'FRUMP', 'FRYER', 'FUDGE', 'FUELS', 'FUGUE', 'FULLS', 'FULLY', 'FUMES', 'FUNDS', 'FUNKY', 'FUNNY', 'FURRED', 'FURS', 'FURZE', 'FUSED', 'FUSES', 'FUSSY', 'FUSTY', 'FUZZY',
            'GABLED', 'GABLES', 'GADGET', 'GAFFER', 'GAGS', 'GAINED', 'GAITS', 'GALA', 'GALAXY', 'GALES', 'GALL', 'GALLED', 'GALLS', 'GALLEY', 'GALLS', 'GALLON', 'GALLOP', 'GALS', 'GAMED', 'GAMER', 'GAMES', 'GAMING', 'GAMMA', 'GANG', 'GANGED', 'GANGS', 'GAPING', 'GARAGE', 'GARB', 'GARBED', 'GARBS', 'GARDEN', 'GARGLE', 'GARLIC', 'GARLIC', 'GARMENT', 'GARNER', 'GARNISH', 'GARRET', 'GARRISON', 'GARTER', 'GAS', 'GASHED', 'GASHES', 'GASKET', 'GASPED', 'GASPS', 'GASSY', 'GATE', 'GATED', 'GATES', 'GATHER', 'GAUCHE', 'GAUDY', 'GAUGE', 'GAUNT', 'GAUNT', 'GAUSS', 'GAUZE', 'GAUZY', 'GAVE', 'GAVEL', 'GAWK', 'GAWKED', 'GAWKS', 'GAWKY', 'GAZE', 'GAZED', 'GAZER', 'GAZES', 'GAZUMP', 'GEAR', 'GEARED', 'GEARS', 'GECKO', 'GELS', 'GELID', 'GELATIN', 'GEM', 'GEMINI', 'GEMS', 'GENE', 'GENERAL', 'GENERIC', 'GENES', 'GENETIC', 'GENIAL', 'GENIE', 'GENIUS', 'GENOME', 'GENRE', 'GENRES', 'GENS', 'GENTEEL', 'GENTLE', 'GENTLY', 'GENTRY', 'GENUS', 'GEODE', 'GEOLOGIC', 'GEOMETRY', 'GEOTHERMAL', 'GERIATRIC', 'GERM', 'GERMANE', 'GERMAN', 'GERMANIC', 'GERMINAL', 'GERMS', 'GERUND', 'GESTAPO', 'GESTATION', 'GESTURES', 'GESUND', 'GET', 'GETS', 'GETTING', 'GETUP', 'GEYSER', 'GHASTLY', 'GHATS', 'GHEE', 'GHETTO', 'GHOST', 'GHOSTED', 'GHOSTS', 'GHOUL', 'GHOULS', 'GHYLL', 'GIANT', 'GIANTS', 'GIBE', 'GIBED', 'GIBER', 'GIBES', 'GIBBET', 'GIBBON', 'GIBBOUS', 'GIBLETS', 'GIDDY', 'GIFT', 'GIFTED', 'GIFTS', 'GIG', 'GIGABIT', 'GIGANTIC', 'GIGGLE', 'GIGGLED', 'GIGGLES', 'GIGOLO', 'GIGS', 'GILD', 'GILDED', 'GILDS', 'GILL', 'GILLED', 'GILLS', 'GILT', 'GIMBAL', 'GIMMICK', 'GIMP', 'GIMPY', 'GIN', 'GINGER', 'GINGERLY', 'GINGHAM', 'GINGIVITIS', 'GINGKO', 'GINS', 'GINSENG', 'GIRAFFE', 'GIRD', 'GIRDED', 'GIRDER', 'GIRDERS', 'GIRDLE', 'GIRDLED', 'GIRDLES', 'GIRDS', 'GIRL', 'GIRLFRIEND', 'GIRLHOOD', 'GIRLISH', 'GIRLS', 'GIRTH', 'GIRTHED', 'GIRTHS', 'GIST', 'GISTS', 'GIT', 'GIVE', 'GIVEN', 'GIVER', 'GIVERS', 'GIVES', 'GIZMO', 'GIZMOS', 'GIZZARD', 'GIZZARDS',
            'LABEL', 'LABEL', 'LABELS', 'LABOR', 'LABORED', 'LABORER', 'LABORS', 'LABOUR', 'LABOURED', 'LABOURS', 'LABYRINTH', 'LACE', 'LACED', 'LACER', 'LACERS', 'LACES', 'LACEY', 'LACIER', 'LACIEST', 'LACKING', 'LACKLUSTER', 'LACONCI', 'LACONIC', 'LACQUER', 'LACQUERED', 'LACQUERS', 'LACROSSE', 'LACTASE', 'LACTATE', 'LACTEAL', 'LACTIC', 'LACTOSE', 'LACUNA', 'LACUNAE', 'LACUNAS', 'LACY', 'LAD', 'LADDER', 'LADDERED', 'LADDERS', 'LADE', 'LADED', 'LADEN', 'LADES', 'LADIES', 'LADING', 'LADINO', 'LADITE', 'LADLE', 'LADLED', 'LADLES', 'LADLING', 'LADRONE', 'LADS', 'LADY', 'LADYBUG', 'LADYFINGER', 'LADYLIKE', 'LADYSHIP', 'LAG', 'LAGER', 'LAGGERS', 'LAGGARD', 'LAGGARDS', 'LAGGED', 'LAGGING', 'LAGOON', 'LAGOONS', 'LAGS', 'LAID', 'LAIN', 'LAIR', 'LAIRD', 'LAIRDS', 'LAIRS', 'LAIRY', 'LAISE', 'LAISSEZ', 'LAITY', 'LAKE', 'LAKED', 'LAKER', 'LAKERS', 'LAKES', 'LAKH', 'LAKHS', 'LAKIN', 'LAKINGS', 'LAKISH', 'LAKIST', 'LAKITER', 'LAKYISH', 'LAKYS', 'LAKY', 'LAMA', 'LAMAISM', 'LAMAIST', 'LAMAIST', 'LAMAISE', 'LAMANTIN', 'LAMASERAI', 'LAMASERY', 'LAMASSIN', 'LAMASSU', 'LAMB', 'LAMBASTE', 'LAMBAST', 'LAMBASTED', 'LAMBASTES', 'LAMBAST', 'LAMBAST', 'LAMBDA', 'LAMBDAS', 'LAMBENT', 'LAMBER', 'LAMBENT', 'LAMBERS', 'LAMBIE', 'LAMBIES', 'LAMBING', 'LAMBKIN', 'LAMBKINS', 'LAMBS', 'LAMBSKIN', 'LAMBSKINS', 'LAMBY', 'LAME', 'LAMEBRAIN', 'LAMEBRAINED', 'LAMED', 'LAMEDS', 'LAMELLA', 'LAMELLAR', 'LAMELLATE', 'LAMELLIBRANCH', 'LAMELLICORN', 'LAMELLICORNIA', 'LAMELLIROSTRAL', 'LAMELLIROSTRA', 'LAMELLULE', 'LAMELLULOSE', 'LAMELY', 'LAMENESS', 'LAMENT', 'LAMENTED', 'LAMENTER', 'LAMENTERS', 'LAMENTING', 'LAMENTINGS', 'LAMENTS', 'LAMENESS', 'LAMER', 'LAMERS', 'LAMERS', 'LAMES', 'LAMEST', 'LAMIA', 'LAMIAE', 'LAMIAS', 'LAMIGER', 'LAMIGEROUS', 'LAMINA', 'LAMINAE', 'LAMINAL', 'LAMINAR', 'LAMINAS', 'LAMINATE', 'LAMINATED', 'LAMINATES', 'LAMINATING', 'LAMINATION', 'LAMINATIONS', 'LAMINITIS', 'LAMINGTON', 'LAMINOUS', 'LAMISH', 'LAMITER', 'LAMITERS', 'LAMITIE', 'LAMIVERSE', 'LAMITIES', 'LAMING', 'LAMINGTONS', 'LAMMASTIDE', 'LAMMAS', 'LAMMASES', 'LAMMERGIER', 'LAMMERGYER', 'LAMMIE', 'LAMMIES', 'LAMMIGER', 'LAMOUR', 'LAMP', 'LAMPAS', 'LAMPASITE', 'LAMPASSION', 'LAMPED', 'LAMPEN', 'LAMPER', 'LAMPERED', 'LAMPERING', 'LAMPERS', 'LAMPEREYS', 'LAMPEREY', 'LAMPERGS', 'LAMPERGES', 'LAMPERI', 'LAMPERIDIO', 'LAMPERINE', 'LAMPERIZZ', 'LAMPERNIA', 'LAMPERNS', 'LAMPERSES', 'LAMPERTS', 'LAMPERYS', 'LAMPERYE', 'LAMPERY', 'LAMPERY', 'LAMPHOLDER', 'LÄMPING', 'LAMPINGS', 'LAMPION', 'LAMPIONS', 'LÄMPIT', 'LÄMPLACK', 'LÄMPLACKS', 'LÄMPLER', 'LÄMPLIGHTS', 'LÄMPLIGHTER', 'LÄMPLIGHTERS', 'LÄMPLIGHTING', 'LÄMPLIGHTS', 'LÄMPLIGHTY', 'LÄMPLING', 'LÄMPPOLE', 'LÄMPPOLES', 'LÄMPREYS', 'LÄMPREYLIKE', 'LÄMPREYS', 'LÄMPS', 'LAMPSHADE', 'LAMPSHADES', 'LAMPWORKER', 'LAMPWORKERS', 'LAMPWORK', 'LAMPYRIDAE', 'LAMPYRID', 'LAMPYRIDS', 'LAMPYRINA', 'LAMPYRINE', 'LAMPYRINIDAE', 'LAMPYROID', 'LAMPYROIDS',
            // Additional common words for expansion
            'SLIDE', 'SHIELD', 'IDEAL', 'IDEAS', 'AISLE', 'FLASH', 'SLASH', 'GLASS', 'GRASS', 'CLASS', 'BRASS', 'DRESS', 'STRESS', 'FEAST', 'BEAST', 'LEAST', 'TOAST', 'ROAST', 'COAST', 'BOAST', 'FROST', 'TRUST', 'TRUST', 'FRUIT', 'BUILD', 'GUILD', 'FIELD', 'YIELD', 'SHIELD', 'WIELD', 'HEARD', 'BEARD', 'HEART', 'BREATH', 'DEATH', 'SHEATH', 'HEALTH', 'WEALTH', 'STEALTH', 'STRONG', 'STRING', 'SPRING', 'SPRING', 'SPRINT', 'STRIPE', 'SCRIPT', 'STRIP', 'STRIP', 'DRIFT', 'SWIFT', 'SHIFT', 'SWIFT', 'CRAFT', 'DRAFT', 'GRAFT', 'SHAFT', 'STAFF', 'CHAFF', 'STAFF', 'SNIFF', 'STIFF', 'CLIFF', 'STUFF', 'BLUFF', 'FLUFF', 'GRUFF', 'SCUFF', 'SNUFF', 'TARIFF', 'SHERIFF', 'MOTIF', 'RELIEF', 'BELIEF', 'BRIEF', 'GRIEF', 'CHIEF', 'THIEF', 'BEEF', 'LEAF', 'DEAF', 'LOAF', 'SHEAF', 'CHAFF', 'STAFF', 'GAFF', 'NAFF', 'DRAFF', 'BOFF', 'DOFF', 'TOFF', 'SCOFF', 'DOFF', 'QUAFF', 'STAFF', 'WAIF', 'FIFE', 'LIFE', 'RIFE', 'WIFE', 'STRIFE', 'KNIFE', 'SAFE', 'CHAFE', 'STRAFE', 'WAFER', 'SAFER', 'CAFE', 'LOAFER', 'GOLFER', 'SURFER', 'CHAFER', 'LOAFER', 'GOLFER', 'SURFER', 'CHAFER', 'GAFFER', 'DUFFER', 'BUFFER', 'SUFFER', 'TOUGHER', 'ROUGHER', 'FLUFF', 'STUFF', 'SNUFF', 'BLUFF', 'GRUFF', 'SCUFF', 'REBUFF', 'SHERIFF', 'MOTIF', 'RELIEF', 'BELIEF', 'BRIEF', 'GRIEF', 'CHIEF', 'THIEF', 'BEEF', 'LEAF', 'DEAF', 'LOAF', 'SHEAF', 'CHEF', 'DEAF', 'ENOUGH', 'TOUGH', 'ROUGH', 'COUGH', 'DOUGH', 'THOUGH', 'THROUGH', 'THOUGHT', 'FOUGHT', 'BROUGHT', 'DROUGHT', 'SOUGHT', 'CAUGHT', 'TAUGHT', 'NAUGHT', 'FRAUGHT', 'WROUGHT', 'LAUGH', 'CALF', 'HALF', 'PATH', 'BATH', 'MATH', 'LATH', 'WRATH', 'CLOTH', 'BROTH', 'BOTH', 'MOTH', 'OATH', 'LOATH', 'GROWTH', 'WORTH', 'FORTH', 'NORTH', 'BIRTH', 'GIRTH', 'MIRTH', 'BERTH', 'EARTH', 'HEARTH', 'DEATH', 'BREATH', 'SHEATH', 'HEATH', 'TEETH', 'BENEATH', 'WEATHER', 'FEATHER', 'LEATHER', 'HEATHER', 'GATHER', 'FATHER', 'RATHER', 'LATHER', 'BATHER', 'SMOTHER', 'BROTHER', 'MOTHER', 'OTHER', 'BOTHER'
        ];

        // DOM elements
        this.letterContainer = document.getElementById('letterContainer');
        this.scoreDisplay = document.getElementById('score');
        this.difficultyDisplay = document.getElementById('difficulty');
        this.speedSlider = document.getElementById('speedSlider');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.gameStatus = document.getElementById('gameStatus');

        // Falling letters array
        this.fallingLetters = [];
        this.nextLetterId = 0;

        // Game loop
        this.gameLoopId = null;
        this.lastSpawnTime = 0;
        this.spawnInterval = 800; // milliseconds

        // Initialize
        this.initializeKeyboard();
        this.attachEventListeners();
    }

    // =============================================
    // INITIALIZATION
    // =============================================

    initializeKeyboard() {
        // Create visual keyboard with color coding for finger placement
        const fingering = {
            'left-pinky': ['Q', 'A', 'Z'],
            'left-ring': ['W', 'S', 'X'],
            'left-middle': ['E', 'D', 'C'],
            'left-index': ['R', 'T', 'F', 'G', 'V', 'B'],
            'right-index': ['Y', 'U', 'H', 'J', 'N', 'M'],
            'right-middle': ['I', 'K', ','],
            'right-ring': ['O', 'L', '.'],
            'right-pinky': ['P', ';', '\'']
        };

        const fingerColors = {
            'left-pinky': '#FF6B9D',
            'left-ring': '#FFC75F',
            'left-middle': '#FFD93D',
            'left-index': '#90EE90',
            'right-index': '#87CEEB',
            'right-middle': '#B39DDB',
            'right-ring': '#FF8B94',
            'right-pinky': '#FDBCB4'
        };

        // Build rows
        const rows = [
            document.getElementById('row1'),
            document.getElementById('row2'),
            document.getElementById('row3')
        ];

        for (let rowIdx = 0; rowIdx < this.keyboardRows.length; rowIdx++) {
            const row = rows[rowIdx];
            for (const key of this.keyboardRows[rowIdx]) {
                const keyBtn = document.createElement('button');
                keyBtn.textContent = key;
                keyBtn.className = 'key-button';
                keyBtn.dataset.key = key;

                // Determine finger and color
                let fingerType = null;
                for (const [finger, keys] of Object.entries(fingering)) {
                    if (keys.includes(key)) {
                        fingerType = finger;
                        break;
                    }
                }

                if (fingerType) {
                    keyBtn.style.setProperty('--finger-color', fingerColors[fingerType]);
                }

                // Mark as inactive initially (not in current difficulty)
                const initialActiveKeys = this.progressionSequence[0]; // Level 1 keys
                if (!initialActiveKeys.includes(key)) {
                    keyBtn.classList.add('inactive');
                } else {
                    keyBtn.classList.add('active');
                }

                row.appendChild(keyBtn);
            }
        }

        this.updateKeyboardDisplay();
    }

    updateKeyboardDisplay() {
        // Get active keys for current difficulty
        const activeKeys = this.progressionSequence[Math.min(this.difficulty - 1, this.progressionSequence.length - 1)];

        // Update all key buttons
        document.querySelectorAll('.key-button').forEach(btn => {
            const key = btn.dataset.key;
            if (activeKeys.includes(key)) {
                btn.classList.remove('inactive');
                btn.classList.add('active');
            } else {
                btn.classList.add('inactive');
                btn.classList.remove('active');
            }
        });
    }

    attachEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.speedSlider.addEventListener('input', (e) => {
            this.speedMultiplier = e.target.value / 5;
            this.updateSpawnRate();
        });

        // Keyboard input
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    // =============================================
    // GAME CONTROLS
    // =============================================

    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.isPaused = false;
        this.gameStatus.classList.add('hidden');
        
        // Set the first new key to I for level 1 (swapped with J)
        this.currentLevelNewKey = 'I';

        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;

        this.gameLoopId = requestAnimationFrame(() => this.gameLoop());
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.pauseBtn.textContent = this.isPaused ? '▶ Resume' : '⏸ Pause';

        if (!this.isPaused) {
            this.gameLoopId = requestAnimationFrame(() => this.gameLoop());
        }
    }

    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.score = 0;
        this.difficulty = 1;
        this.correctPresses = 0;
        this.newKeyCount = 0;
        this.currentLevelNewKey = null;
        this.speedMultiplier = 1;
        this.speedSlider.value = 5;

        this.scoreDisplay.textContent = this.score;
        this.difficultyDisplay.textContent = this.difficulty;

        // Clear falling letters
        this.letterContainer.innerHTML = '';
        this.fallingLetters = [];
        this.nextLetterId = 0;

        // Reset buttons
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = '⏸ Pause';

        // Show status
        this.gameStatus.classList.remove('hidden');
        this.gameStatus.querySelector('.status-text').textContent =
            'Ready to play? Press <strong>Start</strong> to begin!';

        this.updateKeyboardDisplay();

        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
        }
    }

    // =============================================
    // GAME LOOP
    // =============================================

    gameLoop() {
        if (!this.isRunning || this.isPaused) return;

        const now = Date.now();

        // Spawn new letters
        if (now - this.lastSpawnTime > this.spawnInterval) {
            this.spawnLetter();
            this.lastSpawnTime = now;
        }

        // Update falling letters
        this.updateLetters();

        // Check for difficulty increase
        this.checkDifficultyProgression();

        this.gameLoopId = requestAnimationFrame(() => this.gameLoop());
    }

    updateLetters() {
        const gameAreaHeight = this.letterContainer.parentElement.clientHeight;

        for (let i = this.fallingLetters.length - 1; i >= 0; i--) {
            const letter = this.fallingLetters[i];

            // Move letter down - speed only affected by speedMultiplier
            const speed = this.baseSpeed * this.speedMultiplier;
            letter.y += speed;

            // Update position
            letter.element.style.top = letter.y + 'px';

            // Bounce animation near bottom
            if (letter.y > gameAreaHeight - 100) {
                letter.element.classList.add('near-bottom');
            } else {
                letter.element.classList.remove('near-bottom');
            }

            // Remove if off screen
            if (letter.y > gameAreaHeight) {
                letter.element.remove();
                this.fallingLetters.splice(i, 1);
                // Small penalty
                this.score = Math.max(0, this.score - 5);
                this.updateScore();
            }
        }
    }

    spawnLetter() {
        const activeKeys = this.progressionSequence[Math.min(this.difficulty - 1, this.progressionSequence.length - 1)];
        let randomKey;

        // Get all valid words for this difficulty level dynamically
        const words = this.getValidWordsForLevel(this.difficulty);
        const canUseWords = words.length > 0;
        
        if (canUseWords && Math.random() < 0.7) {
            // 70% chance to spawn a letter from a word
            const randomWord = words[Math.floor(Math.random() * words.length)];
            const randomIndex = Math.floor(Math.random() * randomWord.length);
            randomKey = randomWord[randomIndex];
        } else if (this.currentLevelNewKey && this.newKeyCount < 2) {
            // Bias towards the newly added key if it hasn't appeared twice yet
            // 60% chance to spawn the new key if we need more presses on it
            if (Math.random() < 0.6) {
                randomKey = this.currentLevelNewKey;
            } else {
                randomKey = activeKeys[Math.floor(Math.random() * activeKeys.length)];
            }
        } else {
            // Random selection from all available keys
            randomKey = activeKeys[Math.floor(Math.random() * activeKeys.length)];
        }

        const letter = {
            id: this.nextLetterId++,
            key: randomKey,
            x: Math.random() * (this.letterContainer.clientWidth - 50),
            y: 0,
            element: null
        };

        // Create DOM element
        const letterEl = document.createElement('div');
        letterEl.className = 'falling-letter home-row';
        letterEl.textContent = randomKey;
        letterEl.dataset.letterId = letter.id;
        letterEl.style.left = letter.x + 'px';
        letterEl.style.top = letter.y + 'px';

        this.letterContainer.appendChild(letterEl);
        letter.element = letterEl;

        this.fallingLetters.push(letter);
    }

    updateSpawnRate() {
        // Faster speed = faster spawn rate
        this.spawnInterval = Math.max(300, 1000 - (this.speedMultiplier * 200));
    }

    // Get all words from dictionary that can be made with available letters
    getValidWordsForLevel(difficulty) {
        const activeKeys = this.progressionSequence[Math.min(difficulty - 1, this.progressionSequence.length - 1)];
        const activeKeysSet = new Set(activeKeys);

        return this.wordDictionary.filter(word => {
            // Word must be at least 2 letters
            if (word.length < 2) return false;
            
            // All letters in the word must be in the active keys
            return word.split('').every(letter => activeKeysSet.has(letter));
        });
    }

    // =============================================
    // INPUT HANDLING
    // =============================================

    handleKeyPress(e) {
        if (!this.isRunning || this.isPaused) return;

        const key = e.key.toUpperCase();
        const activeKeys = this.progressionSequence[Math.min(this.difficulty - 1, this.progressionSequence.length - 1)];

        // Ignore keys not in current difficulty
        if (!activeKeys.includes(key)) return;

        // Visual feedback on keyboard
        const keyBtn = document.querySelector(`[data-key="${key}"]`);
        if (keyBtn) {
            keyBtn.classList.add('pressed');
            setTimeout(() => keyBtn.classList.remove('pressed'), 100);
        }

        // Find and remove matching falling letters
        let hitCount = 0;
        for (let i = this.fallingLetters.length - 1; i >= 0; i--) {
            if (this.fallingLetters[i].key === key) {
                const letter = this.fallingLetters[i];

                // Animation before removal
                letter.element.classList.add('pop');

                // Add points based on distance from bottom (reward precision) and speed
                const gameAreaHeight = this.letterContainer.parentElement.clientHeight;
                const distanceFromBottom = gameAreaHeight - letter.y;
                const basePoints = Math.floor(10 * this.speedMultiplier);
                const bonusPoints = Math.max(0, Math.floor((distanceFromBottom / 20) * this.speedMultiplier));

                this.score += basePoints + bonusPoints;
                hitCount++;

                setTimeout(() => {
                    letter.element.remove();
                    // Use filter to safely remove the letter by reference, not by index
                    this.fallingLetters = this.fallingLetters.filter(l => l !== letter);
                }, 300);
            }
        }

        // Count as one correct press if any letters matched
        if (hitCount > 0) {
            this.correctPresses++;
            
            // Count presses on the newly added key for this level
            if (key === this.currentLevelNewKey) {
                this.newKeyCount++;
            }
            
            this.updateScore();
        }
    }

    updateScore() {
        this.scoreDisplay.textContent = this.score;
    }

    // =============================================
    // DIFFICULTY PROGRESSION
    // =============================================

    checkDifficultyProgression() {
        // Advance to next level after 10 correct presses, up to max level
        // BUT: the newly added key must appear at least 2 times before progressing
        const correctPressesNeeded = 10;
        const maxLevel = this.progressionSequence.length;
        const newDifficulty = Math.min(Math.floor(this.correctPresses / correctPressesNeeded) + 1, maxLevel);

        if (newDifficulty > this.difficulty) {
            // Check if the new key requirement has been met
            if (this.newKeyCount < 2) {
                // Don't advance yet - the new key hasn't appeared enough times
                return;
            }

            const oldDifficulty = this.difficulty;
            this.difficulty = newDifficulty;
            this.difficultyDisplay.textContent = this.difficulty;

            // Find the new key that was added
            const oldKeys = this.progressionSequence[oldDifficulty - 1];
            const newKeys = this.progressionSequence[this.difficulty - 1];
            const addedKey = newKeys.find(k => !oldKeys.includes(k));
            this.lastNewKey = addedKey;

            // Reset counters for the new level
            this.newKeyCount = 0;
            this.currentLevelNewKey = addedKey;

            // Pause game and show level-up message
            this.showLevelUpMessage(addedKey);
        }
    }

    showLevelUpMessage(newKey) {
        // Pause the game
        this.isPaused = true;
        this.pauseBtn.textContent = '▶ Resume';

        // Create level-up overlay
        const overlay = document.createElement('div');
        overlay.className = 'level-up-overlay';
        overlay.id = 'levelUpOverlay';

        const messageBox = document.createElement('div');
        messageBox.className = 'level-up-message';
        messageBox.innerHTML = `
            <div class="level-up-text">
                <div class="level-up-title">🎉 New Level! 🎉</div>
                <div class="level-up-key-display">"<span class="new-key-letter">${newKey}</span>" key added</div>
                <div class="level-up-instruction">Press <strong>"${newKey}"</strong> to continue</div>
            </div>
        `;

        overlay.appendChild(messageBox);
        this.gameStatus.parentElement.appendChild(overlay);

        // Circle the new key in the keyboard
        const newKeyBtn = document.querySelector(`[data-key="${newKey}"]`);
        if (newKeyBtn) {
            newKeyBtn.classList.add('key-circled');
        }

        // Wait for the new key to be pressed to continue
        const continueListener = (e) => {
            const key = e.key.toUpperCase();
            if (key === newKey) {
                // Remove overlay and circle
                overlay.remove();
                if (newKeyBtn) {
                    newKeyBtn.classList.remove('key-circled');
                }

                // Resume game
                this.isPaused = false;
                this.pauseBtn.textContent = '⏸ Pause';
                this.gameLoopId = requestAnimationFrame(() => this.gameLoop());

                // Remove this listener
                document.removeEventListener('keydown', continueListener);
            }
        };

        document.addEventListener('keydown', continueListener);

        // Update keyboard display to show new keys
        this.updateKeyboardDisplay();
    }
}

// =============================================
// INITIALIZE GAME ON PAGE LOAD
// =============================================

let game;

document.addEventListener('DOMContentLoaded', () => {
    game = new LetterHero();
});
