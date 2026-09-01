import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Pressable, Linking, ScrollView, Platform, Animated, useWindowDimensions } from 'react-native';
import { Icon, IconName } from './Icon';
import { HeroCanvas } from './HeroCanvas';
import { Reveal } from './Reveal';
import { CoverImage } from './CoverImage';
import { SponsorLogo } from './SponsorLogo';
import { resolveUri } from './assetUri';
import { injectWebStyles } from './webStyles';

// Theme tokens
const GOLD = '#a89669';
const GOLD_HI = '#cbb684';
const BG = '#000';
const CARD = '#121212';
const CARD_HI = '#171717';
const BORDER = '#2a2a2a';
const TEXT = '#ececec';
const MUTED = '#9a9a9a';
const DISPLAY = Platform.OS === 'web' ? '"Saira Condensed", "Arial Narrow", sans-serif' : undefined;
const SANS = Platform.OS === 'web' ? '"Saira", system-ui, sans-serif' : undefined;
const APPLICATION_URL = 'https://tinyurl.com/VUMotorsports';
const APPLICATION_DEADLINE = 'Friday, Sep 4';

// The extracted VU-83 cutout (transparent WebP) used by the hero particle field.
const CAR_URI = resolveUri(require('./assets/car-silhouette.webp'));

injectWebStyles();

type Route = 'home' | 'car' | 'sponsor' | 'contact' | 'apply';

type Member = { name: string; role: string; email: string; year: string; major: string; category: 'executive' | 'returning' | 'faculty' };

const TEAM_MEMBERS: Member[] = [
  { name: 'Sebastien Jacques', role: 'President', email: 'sebastien.f.jacques@vanderbilt.edu', year: 'Senior', major: 'Mechanical Engineering', category: 'executive' },
  { name: 'Manu Thomas', role: 'Vice President', email: 'manu.thomas@vanderbilt.edu', year: 'Junior', major: 'Computer Science & Math', category: 'executive' },
  { name: 'Kriti Lohiya', role: 'Secretary', email: 'kriti.lohiya@vanderbilt.edu', year: 'Sophomore', major: 'Mechanical Engineering', category: 'executive' },
  { name: 'Ariel Alvarez', role: 'Member', email: 'ariel.j.alvarez@vanderbilt.edu', year: 'Sophomore', major: 'Mechanical Engineering', category: 'returning' },
  { name: 'Caroline Daub', role: 'Member', email: 'caroline.a.daub@vanderbilt.edu', year: 'Junior', major: 'Mechanical Engineering & Cognitive Studies', category: 'returning' },
  { name: 'Daiwei Lu', role: 'Member', email: 'daiwei.lu@vanderbilt.edu', year: 'Graduate', major: 'Computer Science', category: 'returning' },
  { name: 'Michael Ramirez', role: 'Member', email: 'michael.ramirez@vanderbilt.edu', year: 'Sophomore', major: 'Mechanical Engineering', category: 'returning' },
  { name: 'Claire Spector', role: 'Member', email: 'claire.n.spector@vanderbilt.edu', year: 'Sophomore', major: 'Mechanical Engineering', category: 'returning' },
  { name: 'Kat Stone', role: 'Member', email: 'katrina.m.stone@vanderbilt.edu', year: 'Junior', major: 'Human and Organizational Development', category: 'returning' },
  { name: 'Allison Valji', role: 'Member', email: 'allison.l.valji@vanderbilt.edu', year: 'Sophomore', major: 'Mechanical Engineering', category: 'returning' },
  { name: 'John Walther', role: 'Member', email: 'john.c.walther@vanderbilt.edu', year: 'Sophomore', major: 'Mechanical Engineering', category: 'returning' },
  { name: 'Phil Davis', role: 'Faculty Advisor', email: 'philip.l.davis@vanderbilt.edu', year: 'Faculty', major: 'Engineering Faculty', category: 'faculty' }
];

export default function App() {
  const [route, setRoute] = useState<Route>('home');
  const fade = useRef(new Animated.Value(1)).current;
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Handle hash routing on web so links are bookmarkable
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const getRouteFromHash = () => {
        const hash = window.location.hash.replace('#', '');
        if (hash === 'car' || hash === 'sponsor' || hash === 'contact' || hash === 'apply') {
          return hash as Route;
        }
        // Links handed out while the interest form was live still land on the
        // page that replaced it.
        if (hash === 'interest') return 'apply' as Route;
        return 'home' as Route;
      };

      const onHashChange = () => setRoute(getRouteFromHash());
      setRoute(getRouteFromHash());
      window.addEventListener('hashchange', onHashChange);
      return () => window.removeEventListener('hashchange', onHashChange);
    }
    return;
  }, []);

  // Cross-fade the routed content on navigation.
  useEffect(() => {
    fade.setValue(0);
    const anim = Animated.timing(fade, { toValue: 1, duration: 320, useNativeDriver: false });
    anim.start();
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    return () => anim.stop();
  }, [route]);

  const navigate = (r: Route) => {
    setRoute(r);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.hash = r;
    }
  };

  const { width } = useWindowDimensions();
  const narrow = width < 680;

  return (
    <SafeAreaView style={styles.safe}>
      {route === 'home' && <HeroCanvas maskUri={CAR_URI} />}

      <View style={styles.header}>
        <View style={[styles.headerInner, narrow && styles.headerInnerNarrow]}>
          <Pressable onPress={() => navigate('home')}>
            <Text style={[styles.brand, narrow && styles.brandNarrow]}>
              {narrow ? 'VANDERBILT MOTORSPORTS' : 'VANDERBILT UNIVERSITY MOTORSPORTS'}
            </Text>
          </Pressable>
          <View style={[styles.nav, narrow && styles.navNarrow]}>
            <NavButton label="Home" onPress={() => navigate('home')} active={route === 'home'} narrow={narrow} />
            <NavButton label={narrow ? 'Car' : 'Current Car'} onPress={() => navigate('car')} active={route === 'car'} narrow={narrow} />
            <NavButton label={narrow ? 'Sponsor' : 'Sponsorship'} onPress={() => navigate('sponsor')} active={route === 'sponsor'} narrow={narrow} />
            <NavButton label="Contact" onPress={() => navigate('contact')} active={route === 'contact'} narrow={narrow} />
            <NavButton
              label="Apply"
              onPress={() => navigate('apply')}
              active={route === 'apply'}
              narrow={narrow}
            />
          </View>
        </View>
      </View>

      <ScrollView ref={scrollRef} style={styles.scroll} contentContainerStyle={styles.content}>
        <Animated.View style={[styles.routeLayer, { opacity: fade }]}>
          {route === 'home' && <Home navigate={navigate} />}
          {route === 'car' && <Car />}
          {route === 'sponsor' && <Sponsor />}
          {route === 'contact' && <Contact />}
          {route === 'apply' && <Apply />}
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Vanderbilt University Motorsports © {new Date().getFullYear()}</Text>
      </View>
    </SafeAreaView>
  );
}

function NavButton({ label, onPress, active, narrow }: { label: string; onPress: () => void; active?: boolean; narrow?: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      style={({ pressed }) => [styles.navButton, narrow && styles.navButtonNarrow, pressed && styles.navButtonPressed]}
    >
      <Text style={[styles.navButtonText, narrow && styles.navButtonTextNarrow, (active || hover) && styles.navButtonTextActive]}>{label}</Text>
      <View style={[styles.navUnderline, active ? styles.navUnderlineActive : hover && styles.navUnderlineHover]} />
    </Pressable>
  );
}

function Btn({ label, onPress, variant = 'primary', icon, iconPosition = 'left' }: { label: string; onPress: () => void; variant?: 'primary' | 'ghost'; icon?: IconName; iconPosition?: 'left' | 'right' }) {
  const [hover, setHover] = useState(false);
  const ghost = variant === 'ghost';
  const iconColor = ghost ? (hover ? GOLD_HI : TEXT) : '#000';
  const iconEl = icon ? <Icon name={icon} size={15} color={iconColor} /> : null;
  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      style={({ pressed }) => [
        styles.btn,
        ghost ? styles.btnGhost : styles.btnPrimary,
        hover && (ghost ? styles.btnGhostHover : styles.btnPrimaryHover),
        pressed && styles.btnPressed,
      ]}
    >
      <View style={styles.btnInner}>
        {iconPosition === 'left' ? iconEl : null}
        <Text style={[styles.btnText, ghost ? styles.btnTextGhost : styles.btnTextPrimary, hover && ghost && styles.btnTextGhostHover]}>
          {label}
        </Text>
        {iconPosition === 'right' ? iconEl : null}
      </View>
    </Pressable>
  );
}

// Card that lifts subtly on hover (web); a plain card on native.
function HoverCard({ children, style }: { children: React.ReactNode; style?: any }) {
  const [hover, setHover] = useState(false);
  return (
    <Pressable
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      style={[styles.card, hover && styles.cardHover, style]}
    >
      {children}
    </Pressable>
  );
}

// Recruiting announcement shown at the top of the home page. Delete this block
// (and the <Announcement /> in Home) once applications have closed.
function Announcement({ navigate }: { navigate: (r: Route) => void }) {
  return (
    <Reveal>
      <View style={styles.announce}>
        <Text style={styles.announceEyebrow}>UPCOMING</Text>
        <Text style={styles.announceTitle}>Applications Open</Text>
        <View style={styles.announceDates}>
          <View style={styles.announceDate}>
            <Text style={styles.announceDay}>Applications Due</Text>
            <Text style={styles.announceTime}>{APPLICATION_DEADLINE}</Text>
          </View>
        </View>
        <Text style={styles.announceNote}>
          Applications to join the team close {APPLICATION_DEADLINE}.
        </Text>
        <View style={styles.announceCta}>
          <Btn label="Apply Now" icon="edit" onPress={() => navigate('apply')} />
        </View>
      </View>
    </Reveal>
  );
}

function Home({ navigate }: { navigate: (r: Route) => void }) {
  const [width, setWidth] = useState(0);
  const openLinkedIn = () => Linking.openURL('https://www.linkedin.com/company/vanderbiltmotorsports/');
  const openAnchorLink = () => Linking.openURL('https://anchorlink.vanderbilt.edu/organization/vumotorsports');
  const openInstagram = () => Linking.openURL('https://www.instagram.com/vanderbilt_motorsports/');
  const openTiktok = () => Linking.openURL('https://www.tiktok.com/@vanderbilt_motorsports');
  const openEmail = () => Linking.openURL('mailto:vanderbiltmotorsports@vanderbilt.edu');

  const stageHeight = width ? Math.max(240, Math.min(width, 940) * 0.5) : 320;
  const titleSize = width ? Math.max(34, Math.min(60, width * 0.085)) : 44;

  return (
    <View style={styles.page} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>FORMULA SAE · VANDERBILT UNIVERSITY</Text>
        <Text style={[styles.heroTitle, { fontSize: titleSize, lineHeight: titleSize }]}>ENGINEERED{'\n'}TO COMPETE</Text>
        {/* The particle field (rendered at the app root as a fixed background)
            focuses the car silhouette into this stage region. */}
        <View nativeID="hero-stage" style={[styles.heroStage, { height: stageHeight }]} />
        <Text style={styles.heroSub}>
          A student-led team that designs, builds, and races formula-style cars.
        </Text>
        <View style={styles.ctaRow}>
          <Btn label="Meet the Team" onPress={() => navigate('contact')} />
          <Btn label="Our Car" variant="ghost" onPress={() => navigate('car')} />
          <Btn label="Sponsor Us" variant="ghost" onPress={() => navigate('sponsor')} />
        </View>
      </View>

      <Announcement navigate={navigate} />

      <Reveal>
        <View style={styles.coverWrap}>
          <CoverImage
            source={require('./assets/VUM-2026-Cover.webp')}
            height={(width || 300) * (1 / 2)}
            alt="Vanderbilt University Motorsports race car"
          />
        </View>
      </Reveal>

      <Reveal>
        <Text style={styles.paragraph}>
          Vanderbilt University Motorsports (VUM) is a student-led engineering team at Vanderbilt University. We design, build, and compete with formula-style race cars
          in collegiate motorsport competitions. Our mission is to provide hands-on engineering experience, promote STEM education, and represent Vanderbilt with
          innovation and performance.
        </Text>
      </Reveal>

      <Reveal>
        <Text style={styles.subtitle}>What We Do</Text>
        <Text style={styles.paragraph}>
          Each year our multidisciplinary team of undergraduates works across chassis, powertrain, electronics, and business to produce a competitive
          racecar. Students gain experience in CAD, manufacturing, testing, data acquisition, and project management.
        </Text>
      </Reveal>

      <Reveal>
        <Text style={styles.subtitle}>Get Involved</Text>
        <Text style={styles.paragraph}>
          We welcome students from all majors. If you're interested in joining, submit an application by {APPLICATION_DEADLINE} — you can also check the Contact page
          to reach out to team members, or visit our Sponsorship page to support the program.
        </Text>
      </Reveal>

      <Reveal>
        <Text style={styles.subtitle}>Connect With Us</Text>
        <Text style={styles.paragraph}>Below are ways to connect to the team:</Text>
        <View style={styles.linkRow}>
          <Btn label="LinkedIn" variant="ghost" icon="linkedin" onPress={openLinkedIn} />
          <Btn label="AnchorLink" variant="ghost" icon="anchor" onPress={openAnchorLink} />
          <Btn label="Instagram" variant="ghost" icon="instagram" onPress={openInstagram} />
          <Btn label="TikTok" variant="ghost" icon="tiktok" onPress={openTiktok} />
          <Btn label="Email" variant="ghost" icon="mail" onPress={openEmail} />
          <Btn label="Apply" variant="ghost" icon="edit" onPress={() => navigate('apply')} />
        </View>
      </Reveal>
    </View>
  );
}

function Car() {
  const [width, setWidth] = useState(0);

  const specs = [
    { label: 'Chassis', value: 'Hand-assembled steel tubing' },
    { label: 'Powertrain', value: '439cc Yamaha YFZ450S' },
    { label: 'Suspension', value: 'Double-wishbone adjustable dampers' },
    { label: 'Brakes', value: 'Lightweight ventilated discs, custom calipers' },
  ];

  const stats = [
    { value: '3rd', label: 'Efficiency — FSAE IC Michigan 2026' },
    { value: '110+', label: 'Teams in the field' },
    { value: '~40 lb', label: 'Lightest car, by margin' },
  ];

  return (
    <View style={styles.page} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <Reveal>
        <Text style={styles.eyebrow}>THE CAR</Text>
        <Text style={styles.title}>VU-83</Text>
        <Text style={styles.paragraph}>VU-83 is the car that the team used at the Formula SAE IC Michigan 2026 competition at Michigan International Speedway.</Text>
      </Reveal>

      <Reveal>
        <View style={styles.coverWrap}>
          <CoverImage
            source={require('./assets/VUM_2026_Car.webp')}
            height={(width || 300) * (2 / 3)}
            alt="Vanderbilt University Motorsports race car VU-83"
          />
        </View>
      </Reveal>

      <Reveal>
        <View style={styles.statRow}>
          {stats.map((s) => (
            <HoverCard key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </HoverCard>
          ))}
        </View>
      </Reveal>

      <Reveal>
        <Text style={styles.subtitle}>Key Specifications</Text>
        <View style={styles.grid}>
          {specs.map((s) => (
            <HoverCard key={s.label} style={styles.specCard}>
              <Text style={styles.specLabel}>{s.label}</Text>
              <Text style={styles.specValue}>{s.value}</Text>
            </HoverCard>
          ))}
        </View>
      </Reveal>

      <Reveal>
        <Text style={styles.subtitle}>Recent Highlights</Text>
        <Text style={styles.paragraph}>
          VU-83 brought home 3rd place in efficiency in a field of over 110 teams. It was awarded for efficiently using fuel over the set distance, made possible by having the lightest car in the competition by around 40 lbs.
        </Text>
      </Reveal>
    </View>
  );
}

// Sponsor wall. The .webp files are generated by dev-assets/prep_sponsor_logos.py
// from the originals in dev-assets/sponsor_logos/ -- don't hand-edit them.
// Listed alphabetically; reorder here to group by sponsorship tier instead.
const SPONSORS = [
  { name: 'Airtech Advanced Materials Group', logo: require('./assets/sponsors/airtech-advanced-materials.webp') },
  { name: 'Airtech Coatings', logo: require('./assets/sponsors/airtech-coatings.webp') },
  { name: 'Blue Origin', logo: require('./assets/sponsors/blue-origin.webp') },
  { name: 'Borchetta Bourbon Music City Grand Prix', logo: require('./assets/sponsors/music-city-grand-prix.webp') },
  { name: 'Cracker Barrel 400', logo: require('./assets/sponsors/cracker-barrel-400.webp') },
  { name: 'Lane Motor Museum', logo: require('./assets/sponsors/lane-motor-museum.webp') },
  { name: 'LeoVince', logo: require('./assets/sponsors/leovince.webp') },
  { name: 'Nashville Superspeedway', logo: require('./assets/sponsors/nashville-superspeedway.webp') },
  { name: 'SOLIDWORKS', logo: require('./assets/sponsors/solidworks.webp') },
  { name: 'Speed-Wiz', logo: require('./assets/sponsors/speed-wiz.webp') },
];

function SponsorWall() {
  return (
    <Reveal>
      <Text style={styles.subtitle}>Our Sponsors</Text>
      <Text style={styles.paragraph}>
        We're grateful to the companies and organizations that make VU-83 possible:
      </Text>
      <View style={styles.sponsorGrid}>
        {SPONSORS.map((s) => (
          <HoverCard key={s.name} style={styles.sponsorTile}>
            <SponsorLogo source={s.logo} alt={s.name} />
          </HoverCard>
        ))}
      </View>
    </Reveal>
  );
}

function Sponsor() {
  const openEmail = () => Linking.openURL('mailto:vanderbiltmotorsports@vanderbilt.edu?subject=VUM+Sponsorship');
  const openDonate = () => Linking.openURL('https://give.vanderbilt.edu/campaigns/55130/donations/new?a=9246364&amt=1');

  return (
    <View style={styles.page}>
      <Reveal>
        <Text style={styles.eyebrow}>PARTNER WITH US</Text>
        <Text style={styles.title}>Support VUM</Text>
        <Text style={styles.paragraph}>
          Sponsorships help our students purchase parts, access manufacturing resources, attend competitions, and focus on engineering education. We
          welcome corporate and individual sponsors and are glad to recognize your support in ways that work for you.
        </Text>
        <Text style={styles.paragraph}>
          We also welcome in-kind support such as materials, machining time, software licenses, and mentorship. Thank you for considering supporting VUM.
        </Text>
      </Reveal>

      <SponsorWall />

      <Reveal>
        <Text style={styles.subtitle}>Contact to Sponsor</Text>
        <Text style={styles.paragraph}>For sponsorship inquiries, email us:</Text>
        <View style={styles.linkRow}>
          <Btn label="Email our Team" icon="mail" onPress={openEmail} />
          <Btn label="Donate" variant="ghost" icon="heart" onPress={openDonate} />
        </View>
        {/* Required disclosure for the Vanderbilt giving page: gifts only reach
            the team if the donor designates them. Must stay visible next to the
            Donate button -- don't move this behind a hover or a modal. */}
        <View style={styles.donateNote}>
          <Text style={styles.donateNoteLabel}>BEFORE YOU GIVE</Text>
          <Text style={styles.donateNoteText}>
            Under Designation type in <Text style={styles.donateNoteStrong}>{'"Vanderbilt University Motorsports"'}</Text> to donate
          </Text>
        </View>
      </Reveal>
    </View>
  );
}

function Contact() {
  const openMail = (email: string) => Linking.openURL(`mailto:${email}`);

  const executiveBoard = TEAM_MEMBERS.filter(m => m.category === 'executive');
  const returningMembers = TEAM_MEMBERS.filter(m => m.category === 'returning');
  const facultyAdvisors = TEAM_MEMBERS.filter(m => m.category === 'faculty');

  const MemberCard = ({ member }: { member: Member }) => (
    <HoverCard style={styles.member}>
      <Text style={styles.memberName}>{member.name}</Text>
      {member.category !== 'faculty' && (
        <>
          <Text style={styles.memberRole}>{member.role}</Text>
          <Text style={styles.memberMajor}>{member.major}</Text>
          <Text style={styles.memberYear}>{member.year}</Text>
        </>
      )}
      <Pressable onPress={() => openMail(member.email)}>
        <Text style={styles.memberEmail}>{member.email}</Text>
      </Pressable>
    </HoverCard>
  );

  const MemberSection = ({ title, members }: { title: string; members: Member[] }) => (
    <Reveal style={styles.memberSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.grid}>
        {members.map((m) => (
          <MemberCard key={m.email} member={m} />
        ))}
      </View>
    </Reveal>
  );

  return (
    <View style={styles.page}>
      <Reveal>
        <Text style={styles.eyebrow}>GET IN TOUCH</Text>
        <Text style={styles.title}>Contact the Team</Text>
        <Text style={styles.paragraph}>
          Reach out to our student leads for specific questions about engineering, sponsorship, or joining the team.
        </Text>
      </Reveal>

      <MemberSection title="Executive Board" members={executiveBoard} />
      <MemberSection title="Returning Members" members={returningMembers} />
      <MemberSection title="Faculty Advisor" members={facultyAdvisors} />
    </View>
  );
}

function Apply() {
  const openApplication = () => Linking.openURL(APPLICATION_URL);

  return (
    <View style={styles.page}>
      <Reveal>
        <Text style={styles.eyebrow}>JOIN THE TEAM</Text>
        <Text style={styles.title}>Apply</Text>
        <Text style={styles.paragraph}>
          Interested in Vanderbilt University Motorsports? Applications for the team are open now and close{' '}
          <Text style={styles.paragraphStrong}>{APPLICATION_DEADLINE}</Text>. We welcome students from all majors.
        </Text>
      </Reveal>

      <Reveal>
        <View style={styles.applyCta}>
          <Btn label="Open Application" icon="edit" onPress={openApplication} />
        </View>
        <Text style={styles.applyLink} onPress={openApplication}>
          {APPLICATION_URL.replace('https://', '')}
        </Text>
      </Reveal>
    </View>
  );
}

const transition = Platform.OS === 'web'
  ? { transitionProperty: 'transform, background-color, border-color, color, opacity, box-shadow', transitionDuration: '200ms', transitionTimingFunction: 'cubic-bezier(.2,.7,.2,1)' } as any
  : {};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { zIndex: 1, overscrollBehavior: 'none' } as any,
  routeLayer: { position: 'relative', zIndex: 1 },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    backgroundColor: BG,
    position: 'relative',
    zIndex: 2,
  },
  headerInner: { width: '100%', maxWidth: 1120, alignSelf: 'center', paddingVertical: 14, paddingHorizontal: 20 },
  headerInnerNarrow: { paddingVertical: 9, paddingHorizontal: 14 },
  brand: { color: GOLD, fontSize: 20, fontWeight: '800', marginBottom: 10, letterSpacing: 1, fontFamily: DISPLAY },
  brandNarrow: { fontSize: 15, marginBottom: 6, letterSpacing: 0.5 },
  nav: { flexDirection: 'row', gap: 4, flexWrap: 'wrap', alignItems: 'center' },
  navNarrow: { flexWrap: 'nowrap', gap: 0, justifyContent: 'space-between', width: '100%' },
  navButton: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, ...transition },
  navButtonNarrow: { paddingVertical: 4, paddingHorizontal: 2 },
  navButtonPressed: { opacity: 0.7 },
  navButtonText: { color: MUTED, fontWeight: '600', fontSize: 14, letterSpacing: 0.5, fontFamily: SANS, ...transition },
  navButtonTextNarrow: { fontSize: 11, letterSpacing: 0 },
  navButtonTextActive: { color: GOLD_HI },
  navUnderline: { height: 2, marginTop: 5, borderRadius: 2, backgroundColor: 'transparent', ...transition },
  navUnderlineActive: { backgroundColor: GOLD },
  navUnderlineHover: { backgroundColor: BORDER },

  content: { padding: 24, paddingBottom: 120, backgroundColor: 'transparent' },
  page: { width: '100%', maxWidth: 1080, alignSelf: 'center' },

  // Hero
  hero: { marginBottom: 12, alignItems: 'flex-start' },
  heroStage: { width: '100%', marginBottom: 20 },
  eyebrow: { color: GOLD, fontSize: 13, fontWeight: '700', letterSpacing: 3, marginBottom: 10, fontFamily: SANS },
  heroTitle: { color: '#fff', fontSize: 56, lineHeight: 56, fontWeight: '800', letterSpacing: 1, marginBottom: 6, fontFamily: DISPLAY },
  heroSub: { color: MUTED, fontSize: 17, lineHeight: 24, marginTop: 4, marginBottom: 20, maxWidth: 560, fontFamily: SANS },
  ctaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 },
  linkRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6, marginBottom: 8 },

  // Buttons
  btn: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 10, borderWidth: 1, ...transition },
  btnPrimary: { backgroundColor: GOLD, borderColor: GOLD },
  btnPrimaryHover: { backgroundColor: GOLD_HI, borderColor: GOLD_HI, transform: [{ translateY: -2 }], boxShadow: '0 8px 24px rgba(168,150,105,0.35)' } as any,
  btnGhost: { backgroundColor: 'transparent', borderColor: BORDER },
  btnGhostHover: { borderColor: GOLD, transform: [{ translateY: -2 }] } as any,
  btnPressed: { opacity: 0.75 },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnText: { fontWeight: '700', fontSize: 15, letterSpacing: 0.5, fontFamily: SANS },
  btnTextPrimary: { color: '#000' },
  btnTextGhost: { color: TEXT },
  btnTextGhostHover: { color: GOLD_HI },

  // Cards / grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 6 },
  card: { backgroundColor: CARD, borderWidth: 1, borderColor: BORDER, borderRadius: 12, padding: 16, ...transition },
  cardHover: { backgroundColor: CARD_HI, borderColor: GOLD, transform: [{ translateY: -3 }], boxShadow: '0 10px 30px rgba(0,0,0,0.5)' } as any,

  statRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 4 },
  statCard: { flexGrow: 1, flexBasis: 150, minWidth: 150 },
  statValue: { color: GOLD, fontSize: 34, fontWeight: '800', fontFamily: DISPLAY },
  statLabel: { color: MUTED, fontSize: 13, marginTop: 4, fontFamily: SANS },

  specCard: { flexGrow: 1, flexBasis: 240, minWidth: 220 },
  specLabel: { color: GOLD, fontSize: 13, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6, fontFamily: SANS },
  specValue: { color: TEXT, fontSize: 16, lineHeight: 22 },

  // Donation designation notice
  donateNote: { maxWidth: 560, marginTop: 10, marginBottom: 4, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, backgroundColor: CARD, borderWidth: 1, borderColor: BORDER, borderLeftWidth: 3, borderLeftColor: GOLD },
  donateNoteLabel: { color: GOLD, fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 5, fontFamily: SANS },
  donateNoteText: { color: '#d6d6d6', fontSize: 15, lineHeight: 22, fontFamily: SANS },
  donateNoteStrong: { color: GOLD_HI, fontWeight: '700' },

  // Sponsor wall -- transparent tiles so the logos sit straight on the page
  // background; only the border and lift change on hover.
  // Uniform fixed-width tiles centred as a block: letting them flex-grow makes
  // the last row's two logos far wider than the four above them.
  sponsorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 8, marginBottom: 8, justifyContent: 'center' },
  sponsorTile: { backgroundColor: 'transparent', width: 232, height: 124, alignItems: 'center', justifyContent: 'center', padding: 12 },

  // Announcement
  announce: { maxWidth: 760, marginBottom: 24, padding: 18, borderRadius: 12, backgroundColor: CARD, borderWidth: 1, borderColor: BORDER, borderLeftWidth: 3, borderLeftColor: GOLD },
  announceEyebrow: { color: GOLD, fontSize: 12, fontWeight: '700', letterSpacing: 2.5, marginBottom: 6, fontFamily: SANS },
  announceTitle: { color: '#fff', fontSize: 24, fontWeight: '800', letterSpacing: 0.5, marginBottom: 14, fontFamily: DISPLAY },
  announceDates: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 14 },
  announceDate: { flexGrow: 1, flexBasis: 180, minWidth: 160, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: BORDER },
  announceDay: { color: TEXT, fontSize: 15, fontWeight: '700', fontFamily: SANS },
  announceTime: { color: GOLD, fontSize: 20, fontWeight: '800', marginTop: 2, letterSpacing: 0.5, fontFamily: DISPLAY },
  announceNote: { color: MUTED, fontSize: 14, lineHeight: 21, marginBottom: 16, fontFamily: SANS },
  announceCta: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },

  // Cover images
  coverWrap: { marginBottom: 22, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: BORDER },

  // Application page
  applyCta: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  applyLink: { color: MUTED, fontSize: 13, marginTop: 10, fontFamily: SANS },

  // Typography
  title: { fontSize: 40, fontWeight: '800', marginBottom: 12, color: '#fff', letterSpacing: 0.5, fontFamily: DISPLAY },
  subtitle: { fontSize: 22, fontWeight: '700', marginTop: 22, marginBottom: 10, color: '#fff', letterSpacing: 0.5, fontFamily: DISPLAY },
  paragraph: { fontSize: 16, color: '#d6d6d6', lineHeight: 25, marginBottom: 10, maxWidth: 760, fontFamily: SANS },
  paragraphStrong: { color: GOLD_HI, fontWeight: '700' },

  footer: { padding: 18, borderTopWidth: 1, borderTopColor: BORDER, alignItems: 'center', backgroundColor: BG, position: 'relative', zIndex: 2 },
  footerText: { color: MUTED, fontFamily: SANS, fontSize: 13 },

  // Members
  memberSection: { marginTop: 24, marginBottom: 4 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 14, borderBottomWidth: 1, borderBottomColor: BORDER, paddingBottom: 10, fontFamily: DISPLAY, letterSpacing: 0.5 },
  member: { flexGrow: 1, flexBasis: 240, minWidth: 220 },
  memberName: { fontWeight: '700', color: GOLD, fontSize: 16, fontFamily: SANS },
  memberRole: { color: '#ccc', marginTop: 4, marginBottom: 4, fontSize: 14 },
  memberMajor: { color: MUTED, marginBottom: 4, fontSize: 13 },
  memberYear: { color: '#7f7f7f', marginBottom: 8, fontSize: 13 },
  memberEmail: { color: GOLD, marginTop: 8, fontSize: 13 },
});
