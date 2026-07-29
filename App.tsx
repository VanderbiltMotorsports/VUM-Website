import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Pressable, Linking, ScrollView, Platform, Image, useWindowDimensions } from 'react-native';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Feather from '@expo/vector-icons/Feather';

type Route = 'home' | 'car' | 'sponsor' | 'contact';

type Member = { name: string; role: string; email: string; year: string; major: string; category: 'executive' | 'returning' | 'faculty' };

const TEAM_MEMBERS: Member[] = [
  { name: 'Sebastien Jacques', role: 'President', email: 'sebastien.f.jacques@vanderbilt.edu', year: 'Senior', major: 'Mechanical Engineering', category: 'executive' },
  { name: 'Manu Thomas', role: 'Vice President', email: 'manu.thomas@vanderbilt.edu', year: 'Junior', major: 'Computer Science & Math', category: 'executive' },
  { name: 'Kriti Lohiya', role: 'Secretary', email: 'kriti.lohiya@vanderbilt.edu', year: 'Sophomore', major: 'Mechanical Engineering', category: 'executive' },
  { name: 'Ariel Alvarez', role: 'Member', email: 'ariel.j.alvarez@vanderbilt.edu', year: 'Sophomore', major: 'Mechanical Engineering', category: 'returning' },
  { name: 'Caroline Daub', role: 'Member', email: 'caroline.a.daub@vanderbilt.edu', year: 'Junior', major: 'Mechanical Engineering & Cognitive Studies', category: 'returning' },
  { name: 'Aytug Demir', role: 'Member', email: 'aytug.demir@vanderbilt.edu', year: 'Sophomore', major: 'Electrical and Computer Engineering', category: 'returning' },
  { name: 'Rebeca Lin', role: 'Member', email: 'rebeca.lin@vanderbilt.edu', year: 'Sophomore', major: 'Mechanical Engineering', category: 'returning' },
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
  const r = useResponsive();

  useEffect(() => {
    // Handle hash routing on web so links are bookmarkable
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const getRouteFromHash = () => {
        const hash = window.location.hash.replace('#', '');
        if (hash === 'car' || hash === 'sponsor' || hash === 'contact') {
          return hash as Route;
        }
        return 'home' as Route;
      };

      const onHashChange = () => setRoute(getRouteFromHash());
      // initialize from current hash
      setRoute(getRouteFromHash());
      window.addEventListener('hashchange', onHashChange);
      return () => window.removeEventListener('hashchange', onHashChange);
    }
    return;
  }, []);

  const navigate = (r: Route) => {
    setRoute(r);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.hash = r;
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, { paddingHorizontal: r.gutter }]}>
        <View style={[styles.headerInner, r.stackHeader && styles.headerInnerStacked]}>
          <View style={styles.brandBlock}>
            <Image
              source={require('./assets/VUM-logo.jpg')}
              style={styles.logo}
              accessible={true}
              accessibilityLabel="Vanderbilt University Motorsports logo"
            />
            <View style={styles.brandText}>
              <Text style={styles.brand} numberOfLines={1}>Vanderbilt Motorsports</Text>
              <Text style={styles.brandSub} numberOfLines={1}>FORMULA SAE</Text>
            </View>
          </View>
          <View style={styles.nav}>
            <NavButton label="Home" onPress={() => navigate('home')} active={route === 'home'} />
            <NavButton label="Car" onPress={() => navigate('car')} active={route === 'car'} />
            <NavButton label="Sponsor" onPress={() => navigate('sponsor')} active={route === 'sponsor'} />
            <NavButton label="Contact" onPress={() => navigate('contact')} active={route === 'contact'} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: r.gutter }]}>
        {route === 'home' && <Home />}
        {route === 'car' && <Car />}
        {route === 'sponsor' && <Sponsor />}
        {route === 'contact' && <Contact />}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Vanderbilt University Motorsports © {new Date().getFullYear()}</Text>
      </View>
    </SafeAreaView>
  );
}

function useResponsive() {
  const { width } = useWindowDimensions();
  const t = Math.min(Math.max((width - 360) / 740, 0), 1);
  const fluid = (min: number, max: number) => Math.round(min + (max - min) * t);

  return {
    width,
    isNarrow: width < 700,
    stackHeader: width < 600,
    gutter: fluid(16, 32),
    prose: { maxWidth: fluid(340, 900) },
  };
}

type PillIcon = 'linkedin' | 'instagram' | 'tiktok' | 'anchor';

function Pill({ label, icon, onPress }: { label: string; icon: PillIcon; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.pill, pressed && styles.pillPressed]}
      accessibilityRole="link"
      accessibilityLabel={label}
    >
      {icon === 'anchor' ? (
        <Feather name="anchor" size={14} color={PILL_FG} />
      ) : (
        <FontAwesome6 name={icon} size={14} color={PILL_FG} brand />
      )}
      <Text style={styles.pillText}>{label}</Text>
    </Pressable>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  const r = useResponsive();
  return (
    <View style={[styles.specRow, r.prose, r.isNarrow && styles.specRowNarrow]}>
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={[styles.specValue, r.isNarrow && styles.specValueNarrow]}>{value}</Text>
    </View>
  );
}

function initials(name: string) {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
}

function shortMajor(major: string) {
  return major
    .replace('Mechanical Engineering', 'ME')
    .replace('Electrical and Computer Engineering', 'ECE')
    .replace('Computer Science', 'CS')
    .replace('Human and Organizational Development', 'HOD');
}

function NavButton({ label, onPress, active }: { label: string; onPress: () => void; active?: boolean }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.navButton, active && styles.navButtonActive, pressed && styles.navButtonPressed]}>
      <Text style={[styles.navButtonText, active && styles.navButtonTextActive]}>{label}</Text>
    </Pressable>
  );
}

function Home() {
  const [photoWidth, setPhotoWidth] = useState(0);
  const r = useResponsive();
  const openLinkedIn = () => Linking.openURL('https://www.linkedin.com/company/vanderbiltmotorsports/');
  const openAnchorLink = () => Linking.openURL('https://anchorlink.vanderbilt.edu/organization/vumotorsports');
  const openInstagram = () => Linking.openURL('https://www.instagram.com/vanderbilt_motorsports/');
  const openTiktok = () => Linking.openURL('https://www.tiktok.com/@vanderbilt_motorsports');
  const openEmail = () => Linking.openURL('mailto:vanderbiltmotorsports@vanderbilt.edu');
  
  return (
    <View style={styles.page}>
      <Text style={styles.eyebrow}>VANDERBILT UNIVERSITY</Text>
      <Text style={styles.title}>Welcome to Vanderbilt University Motorsports</Text>
      <View style={styles.rule} />
      
      <View
        style={styles.photoContainer}
        onLayout={(e) => setPhotoWidth(e.nativeEvent.layout.width)}
      >
        <Image 
          source={require('./assets/VUM-2026-Cover.jpg')} 
          style={[styles.photo, { height: photoWidth * (1 / 2) }]}
          accessible={true}
          accessibilityLabel="Vanderbilt University Motorsports race car"
        />
      </View>

      <Text style={[styles.paragraph, r.prose]}>
        Vanderbilt University Motorsports (VUM) is a student-led engineering team at Vanderbilt University. We design, build, and compete with formula-style race cars
        in collegiate motorsport competitions. Our mission is to provide hands-on engineering experience, promote STEM education, and represent Vanderbilt with
        innovation and performance.
      </Text>

      <Text style={styles.subtitle}>What We Do</Text>
      <Text style={[styles.paragraph, r.prose]}>
        Each year our multidisciplinary team of undergraduates works across chassis, powertrain, electronics, and business to produce a competitive
        racecar. Students gain experience in CAD, manufacturing, testing, data acquisition, and project management.
      </Text>

      <Text style={styles.subtitle}>Get Involved</Text>
      <Text style={[styles.paragraph, r.prose]}>
        We welcome students from all majors. If you're interested in joining, check the Contact page to reach out to team members or visit our Sponsorship page
        to support the program.
      </Text>

      <Text style={styles.subtitle}>Follow the Team</Text>
      <View style={styles.pillRow}>
        <Pill label="LinkedIn" icon="linkedin" onPress={openLinkedIn} />
        <Pill label="Instagram" icon="instagram" onPress={openInstagram} />
        <Pill label="TikTok" icon="tiktok" onPress={openTiktok} />
        <Pill label="AnchorLink" icon="anchor" onPress={openAnchorLink} />
      </View>

      <Pressable style={({ pressed }) => [styles.sponsorButton, pressed && styles.sponsorButtonPressed]} onPress={openEmail}>
        <Text style={styles.sponsorButtonText}>Join the team</Text>
      </Pressable>
      
    </View>
  );
}

function Car() {
  const [photoWidth, setPhotoWidth] = useState(0);
  const r = useResponsive();

  return (
    <View style={styles.page}>
      <Text style={styles.eyebrow}>2026 COMPETITION CAR</Text>
      <Text style={styles.title}>Current Car — VU-83</Text>
      <View style={styles.rule} />
      <Text style={[styles.paragraph, r.prose]}>VU-83 is the car that the team used at the Formula SAE IC Michigan 2026 competition at Michigan International Speedway.</Text>

      <View
        style={styles.photoContainer}
        onLayout={(e) => setPhotoWidth(e.nativeEvent.layout.width)}
      >
        <Image
          source={require('./assets/VUM_2026_Car.jpeg')}
          style={[styles.carPhoto, { height: photoWidth * (2 / 3) }]}
          accessible={true}
          accessibilityLabel="Vanderbilt University Motorsports race car"
        />
      </View>
      
      <View style={styles.statRow}>
        <View>
          <Text style={styles.statValue}>3rd</Text>
          <Text style={styles.statLabel}>EFFICIENCY</Text>
        </View>
        <View>
          <Text style={styles.statValue}>110+</Text>
          <Text style={styles.statLabel}>TEAMS</Text>
        </View>
        <View>
          <Text style={styles.statValue}>40 lb</Text>
          <Text style={styles.statLabel}>LIGHTEST MARGIN</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>Specifications</Text>
      <SpecRow label="Chassis" value="Hand-assembled steel tubing" />
      <SpecRow label="Powertrain" value="439cc Yamaha YFZ450S" />
      <SpecRow label="Suspension" value="Double-wishbone, adjustable dampers" />
      <SpecRow label="Brakes" value="Ventilated discs, custom calipers" />

      <Text style={styles.subtitle}>Highlights</Text>
      <Text style={[styles.paragraph, r.prose]}>
        Awarded third in efficiency for fuel use over the set distance, made possible by running the lightest car in the competition by roughly 40 lb.
      </Text>
    </View>
  );
}

function Sponsor() {
  const r = useResponsive();
  const openEmail = () => Linking.openURL('mailto:vanderbiltmotorsports@vanderbilt.edu?subject=VUM+Sponsorship');
  const openDonate = () => Linking.openURL('https://anchorlink.vanderbilt.edu/organization/vumotorsports');

  return (
    <View style={styles.page}>
      <Text style={styles.eyebrow}>PARTNER WITH US</Text>
      <Text style={styles.title}>Support Vanderbilt University Motorsports</Text>
      <View style={styles.rule} />

      <Text style={[styles.paragraph, r.prose]}>
        Sponsorships helps our students purchase parts, access manufacturing resources, attend competitions, and focus on engineering education. We offer
        corporate and individual sponsorship packages with recognition opportunities, testing access, and collaborative engineering projects.
      </Text>

    
      <Text style={[styles.paragraph, r.prose]}>
        We also welcome in-kind support such as materials, machining time, software licenses, and mentorship. Thank you for considering supporting VUM.
      </Text>

      <Text style={styles.subtitle}>Sponsorship Tiers</Text>
      <Text style={[styles.paragraph, r.prose]}>• Bronze — Logo on team page, social media mention</Text>
      <Text style={[styles.paragraph, r.prose]}>• Silver — Bronze benefits + logo on the car and event banners</Text>
      <Text style={[styles.paragraph, r.prose]}>• Gold — Silver benefits + engineering collaboration and on-site demonstrations</Text>

      <Text style={styles.subtitle}>Contact to Sponsor</Text>
      <Text style={[styles.paragraph, r.prose]}>For sponsorship inquiries and custom packages, email us:</Text>

      <Pressable style={styles.sponsorButton} onPress={openEmail}>
        <Text style={styles.sponsorButtonText}>Email our Team</Text>
      </Pressable>

      <Text style={styles.subtitle}>Donations</Text>
      <Text style={[styles.paragraph, r.prose]}>If you are interesting in donating to the team, click below:</Text>

      <Pressable style={styles.sponsorButton} onPress={openDonate}>
        <Text style={styles.sponsorButtonText}>Donate</Text>
      </Pressable>
      
    </View>
  );
}

function Contact() {
  const r = useResponsive();
  const openMail = (email: string) => Linking.openURL(`mailto:${email}`);

  const executiveBoard = TEAM_MEMBERS.filter(m => m.category === 'executive');
  const returningMembers = TEAM_MEMBERS.filter(m => m.category === 'returning');
  const facultyAdvisors = TEAM_MEMBERS.filter(m => m.category === 'faculty');

  const MemberCard: React.FC<{ member: Member }> = ({ member }) => (
    <Pressable
      onPress={() => openMail(member.email)}
      style={({ pressed }) => [styles.member, pressed && styles.memberPressed]}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials(member.name)}</Text>
      </View>
      <Text style={styles.memberName}>{member.name}</Text>
      {member.category !== 'faculty' && (
        <>
          <Text style={styles.memberRole}>{member.role}</Text>
          <Text style={styles.memberMeta}>{shortMajor(member.major)} · {member.year}</Text>
        </>
      )}
      <Text style={styles.memberEmail}>{member.email}</Text>
    </Pressable>
  );

  const MemberSection: React.FC<{ title: string; members: Member[] }> = ({ title, members }) => (
    <View style={styles.memberSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.memberGrid}>
        {members.map((m) => (
          <MemberCard key={m.email} member={m} />
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.page}>
      <Text style={styles.eyebrow}>GET IN TOUCH</Text>
      <Text style={styles.title}>Contact the Team</Text>
      <View style={styles.rule} />

      <Text style={[styles.paragraph, r.prose]}>
        Reach out to our student leads for specific questions about engineering, sponsorship, or joining the team.
      </Text>

      <MemberSection title="Executive Board" members={executiveBoard} />
      <MemberSection title="Returning Members" members={returningMembers} />
      <MemberSection title="Faculty Advisor" members={facultyAdvisors} />
    </View>
  );
}

const serif = Platform.OS === 'web' ? 'Georgia, "Times New Roman", serif' : 'serif';

const GOLD = '#a89669';
const GOLD_DIM = '#8a7a55';
const BODY = '#9a9a95';
const RULE = '#1e1e1e';
const PILL_FG = '#d8cbaa';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  header: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2418',
    backgroundColor: '#000'
  },
  headerInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16, maxWidth: 1100, width: '100%', alignSelf: 'center' },
  headerInnerStacked: { flexDirection: 'column', alignItems: 'flex-start', gap: 12 },
  brandBlock: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1, minWidth: 0 },
  brandText: { flexShrink: 1, minWidth: 0 },
  brand: { color: '#fff', fontFamily: serif, fontSize: 18, flexShrink: 1 },
  brandSub: { color: '#6e6650', fontSize: 10, letterSpacing: 1.1, marginTop: 1 },
  logo: { width: 36, height: 36, borderRadius: 4 },
  nav: { flexDirection: 'row', gap: 18, flexWrap: 'wrap', flexShrink: 0 },
  navButton: { paddingBottom: 4, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  navButtonPressed: { opacity: 0.6 },
  navButtonActive: { borderBottomColor: GOLD },
  navButtonText: { color: '#8c8c86', fontSize: 14 },
  navButtonTextActive: { color: '#fff' },
  content: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 120, backgroundColor: '#000' },
  page: { maxWidth: 1100, width: '100%', alignSelf: 'center' },
  eyebrow: { color: GOLD_DIM, fontSize: 11, letterSpacing: 1.4, marginBottom: 6 },
  title: { fontFamily: serif, fontSize: 38, color: '#fff', marginBottom: 8, lineHeight: 42 },
  rule: { width: 40, height: 2, backgroundColor: GOLD, marginBottom: 20 },
  subtitle: { color: GOLD, fontFamily: serif, fontSize: 21, lineHeight: 27, marginTop: 36, marginBottom: 10 },
  paragraph: { fontSize: 16, color: BODY, lineHeight: 26, marginBottom: 16, width: '100%' },
  photoContainer: { marginBottom: 28, borderRadius: 8, overflow: 'hidden' },
  photo: { width: '100%', resizeMode: 'cover' },
  carPhoto: { width: '100%', resizeMode: 'cover' },
  statRow: { flexDirection: 'row', gap: 32, flexWrap: 'wrap', paddingVertical: 18, borderTopWidth: 1, borderBottomWidth: 1, borderColor: RULE, marginBottom: 8 },
  statValue: { color: GOLD, fontFamily: serif, fontSize: 30, lineHeight: 34 },
  statLabel: { color: '#777', fontSize: 11, letterSpacing: 0.8, marginTop: 4 },
  specRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: RULE, width: '100%' },
  specRowNarrow: { flexDirection: 'column', gap: 4 },
  specLabel: { color: '#777', fontSize: 12, letterSpacing: 0.6 },
  specValue: { color: '#e8e8e4', fontSize: 14, textAlign: 'right', flexShrink: 1 },
  specValueNarrow: { textAlign: 'left' },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderColor: '#4a4235', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14 },
  pillPressed: { borderColor: GOLD, opacity: 0.8 },
  pillText: { color: PILL_FG, fontSize: 13 },
  sponsorButton: { backgroundColor: GOLD, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 8, alignSelf: 'flex-start', marginTop: 4, marginBottom: 12 },
  sponsorButtonPressed: { opacity: 0.85 },
  sponsorButtonText: { color: '#3a3222', fontWeight: '500', fontSize: 14 },
  footer: { paddingVertical: 20, paddingHorizontal: 24, borderTopWidth: 1, borderTopColor: RULE, alignItems: 'center', backgroundColor: '#000' },
  footerText: { color: '#666', fontSize: 12 },
  memberSection: { marginTop: 36 },
  sectionTitle: { color: GOLD, fontFamily: serif, fontSize: 21, lineHeight: 27, marginBottom: 14 },
  memberGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  member: { flexGrow: 1, flexBasis: 240, padding: 14, borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 8, backgroundColor: '#0d0d0d' },
  memberPressed: { borderColor: '#4a4235' },
  avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#2c2617', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarText: { color: '#c9b688', fontSize: 11 },
  memberName: { color: '#fff', fontSize: 14, fontWeight: '500' },
  memberRole: { color: GOLD_DIM, fontSize: 12, marginTop: 3 },
  memberMeta: { color: '#777', fontSize: 12, marginTop: 2 },
  memberEmail: { color: '#666', fontSize: 11, marginTop: 8 },
});
