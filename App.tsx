import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Pressable, Linking, ScrollView, Platform, Image } from 'react-native';

type Route = 'home' | 'car' | 'sponsor' | 'contact';

type Member = { name: string; role: string; email: string; year: string; major: string; category: 'executive' | 'returning' | 'faculty' };

const TEAM_MEMBERS: Member[] = [
  { name: 'Sebastien Jacques', role: 'President', email: 'avery.smith@vum.example.edu', year: 'Senior', major: 'Mechanical Engineering', category: 'executive' },
  { name: 'Manu Thomas', role: 'Vice President', email: 'jordan.lee@vum.example.edu', year: 'Junior', major: 'Mechanical Engineering', category: 'executive' },
  { name: 'Kriti Lohiya', role: 'Secretary', email: 'taylor.nguyen@vum.example.edu', year: 'Sophomore', major: 'Computer Engineering', category: 'executive' },
  { name: 'Sarah Chen', role: 'Aerodynamics Lead', email: 'sarah.chen@vum.example.edu', year: 'Junior', major: 'Aerospace Engineering', category: 'returning' },
  { name: 'Alex Rodriguez', role: 'Powertrain Lead', email: 'alex.rodriguez@vum.example.edu', year: 'Senior', major: 'Mechanical Engineering', category: 'returning' },
  { name: 'Phil Davis', role: 'Faculty Advisor', email: 'riley.patel@vum.example.edu', year: 'Faculty', major: 'Engineering Faculty', category: 'faculty' }
];

export default function App() {
  const [route, setRoute] = useState<Route>('home');

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
      <View style={styles.header}>
        <Text style={styles.brand}>Vanderbilt University Motorsports</Text>
        <View style={styles.nav}>
          <NavButton label="Home" onPress={() => navigate('home')} active={route === 'home'} />
          <NavButton label="Current Car" onPress={() => navigate('car')} active={route === 'car'} />
          <NavButton label="Sponsorship" onPress={() => navigate('sponsor')} active={route === 'sponsor'} />
          <NavButton label="Contact" onPress={() => navigate('contact')} active={route === 'contact'} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
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

function NavButton({ label, onPress, active }: { label: string; onPress: () => void; active?: boolean }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.navButton, active && styles.navButtonActive, pressed && styles.navButtonPressed]}>
      <Text style={[styles.navButtonText, active && styles.navButtonTextActive]}>{label}</Text>
    </Pressable>
  );
}

function Home() {
  return (
    <View style={styles.page}>
      <Text style={styles.title}>Welcome to Vanderbilt University Motorsports</Text>
      
      <View style={styles.photoContainer}>
        <Image 
          source={require('./assets/VUM-2026-Cover.jpg')} 
          style={styles.photo}
          accessible={true}
          accessibilityLabel="Vanderbilt University Motorsports race car"
        />
      </View>

      <Text style={styles.paragraph}>
        Vanderbilt University Motorsports (VUM) is a student-led engineering team at Vanderbilt University. We design, build, and compete with formula-style race cars
        in collegiate motorsport competitions. Our mission is to provide hands-on engineering experience, promote STEM education, and represent Vanderbilt with
        innovation and performance.
      </Text>

      <Text style={styles.subtitle}>What We Do</Text>
      <Text style={styles.paragraph}>
        Each year our multidisciplinary team of undergraduates works across chassis, powertrain, electronics, and business to produce a competitive
        racecar. Students gain experience in CAD, manufacturing, testing, data acquisition, and project management.
      </Text>

      <Text style={styles.subtitle}>Get involved</Text>
      <Text style={styles.paragraph}>
        We welcome students from all majors. If you're interested in joining, check the Contact page to reach out to team members or visit our Sponsorship page
        to support the program.
      </Text>
    </View>
  );
}

function Car() {
  return (
    <View style={styles.page}>
      <Text style={styles.title}>Current Car — VU-83</Text>

      <Text style={styles.paragraph}>
        VU-83 is the car that the team used at the Formula SAE IC Michigan 2026 competition at Michigan International Speedway. 
      </Text>

      <View style={styles.photoContainer}>
        <Image 
          source={require('./assets/VUM_2026_Car.jpeg')} 
          style={styles.carPhoto}
          accessible={true}
          accessibilityLabel="Vanderbilt University Motorsports race car"
        />
      </View>
      
      <Text style={styles.subtitle}>Key Specifications</Text>
      <Text style={styles.paragraph}>• Chassis: Carbon fiber monocoque (prototype)</Text>
      <Text style={styles.paragraph}>• Powertrain: 600cc 4-stroke engine with ECU mapping and data logging</Text>
      <Text style={styles.paragraph}>• Aerodynamics: Front and rear wings with undertray for balanced downforce</Text>
      <Text style={styles.paragraph}>• Suspension: Double-wishbone adjustable dampers</Text>
      <Text style={styles.paragraph}>• Brakes: Lightweight ventilated discs with custom calipers</Text>

      <Text style={styles.subtitle}>Recent Highlights</Text>
      <Text style={styles.paragraph}>
        VU-83 brought home 3rd place in efficiency in a field of over 110 teams. It was awarded for efficiently using fuel over the set distance, made possible by having the lightest car in the competition by around 40 lbs.
      </Text>
    </View>
  );
}

function Sponsor() {
  const openEmail = () => Linking.openURL('mailto:sponsor@vum.example.edu?subject=VUM+Sponsorship');

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Support Vanderbilt University Motorsports</Text>

      <Text style={styles.paragraph}>
        Sponsorship helps our students purchase parts, access manufacturing resources, attend competitions, and focus on engineering education. We offer
        corporate and individual sponsorship packages with recognition opportunities, testing access, and collaborative engineering projects.
      </Text>

      <Text style={styles.subtitle}>Sponsorship tiers</Text>
      <Text style={styles.paragraph}>• Bronze — Logo on team page, social media mention</Text>
      <Text style={styles.paragraph}>• Silver — Bronze benefits + logo on the car and event banners</Text>
      <Text style={styles.paragraph}>• Gold — Silver benefits + engineering collaboration and on-site demonstrations</Text>

      <Text style={styles.subtitle}>Contact to Sponsor</Text>
      <Text style={styles.paragraph}>For sponsorship inquiries and custom packages, email us:</Text>

      <Pressable style={styles.sponsorButton} onPress={openEmail}>
        <Text style={styles.sponsorButtonText}>Email our Sponsorship Team</Text>
      </Pressable>

      <Text style={styles.paragraph}>
        We also welcome in-kind support such as materials, machining time, software licenses, and mentorship. Thank you for considering supporting VUM.
      </Text>
    </View>
  );
}

function Contact() {
  const openMail = (email: string) => Linking.openURL(`mailto:${email}`);

  const executiveBoard = TEAM_MEMBERS.filter(m => m.category === 'executive');
  const returningMembers = TEAM_MEMBERS.filter(m => m.category === 'returning');
  const facultyAdvisors = TEAM_MEMBERS.filter(m => m.category === 'faculty');

  const MemberCard = ({ member }: { member: Member }) => (
    <View style={styles.member}>
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
    </View>
  );

  const MemberSection = ({ title, members }: { title: string; members: Member[] }) => (
    <View style={styles.memberSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {members.map((m) => (
        <MemberCard key={m.email} member={m} />
      ))}
    </View>
  );

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Contact the Team</Text>

      <Text style={styles.paragraph}>
        Reach out to our student leads for specific questions about engineering, sponsorship, or joining the team.
      </Text>

      <MemberSection title="Executive Board" members={executiveBoard} />
      <MemberSection title="Returning Members" members={returningMembers} />
      <MemberSection title="Faculty Advisor" members={facultyAdvisors} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  header: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#000'
  },
  brand: { color: '#c2872f', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  nav: { flexDirection: 'row', gap: 10 },
  navButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: 'transparent'
  },
  navButtonPressed: { opacity: 0.7 },
  navButtonActive: { backgroundColor: '#c2872f' },
  navButtonText: { color: '#fff', fontWeight: '600' },
  navButtonTextActive: { color: '#000' },
  content: { padding: 24, paddingBottom: 120, backgroundColor: '#000' },
  page: { maxWidth: 900, alignSelf: 'center' },
  photoContainer: { marginBottom: 20, borderRadius: 8, overflow: 'hidden', borderWidth: 2, borderColor: '#c2872f' },
  photo: { width: '100%', height: 400, resizeMode: 'cover' },
  carPhoto: { width: '100%', height: 600, resizeMode: 'cover' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 12, color: '#c2872f' },
  subtitle: { fontSize: 18, fontWeight: '700', marginTop: 12, marginBottom: 6, color: '#c2872f' },
  paragraph: { fontSize: 16, color: '#fff', lineHeight: 22, marginBottom: 8 },
  sponsorButton: { backgroundColor: '#c2872f', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, alignSelf: 'flex-start', marginTop: 8, marginBottom: 12 },
  sponsorButtonText: { color: '#000', fontWeight: '700' },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#333', alignItems: 'center', backgroundColor: '#000' },
  footerText: { color: '#999' },
  members: { marginTop: 12 },
  memberSection: { marginTop: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#c2872f', marginBottom: 12, paddingBottomWidth: 2, borderBottomWidth: 1, borderBottomColor: '#444', paddingBottom: 8 },
  member: { marginBottom: 12, padding: 12, borderWidth: 1, borderColor: '#333', borderRadius: 8, backgroundColor: '#111' },
  memberName: { fontWeight: '700', color: '#c2872f', fontSize: 16 },
  memberRole: { color: '#ccc', marginBottom: 4, fontSize: 14 },
  memberMajor: { color: '#aaa', marginBottom: 4, fontSize: 13 },
  memberYear: { color: '#999', marginBottom: 8, fontSize: 13 },
  memberEmail: { color: '#c2872f', marginTop: 8 },
});
