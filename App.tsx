import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Pressable, Linking, ScrollView, Platform, TextInput } from 'react-native';

type Route = 'home' | 'car' | 'sponsor' | 'contact';

type Member = { name: string; role: string; email: string; year?: string };

const TEAM_MEMBERS: Member[] = [
  { name: 'Avery Smith', role: 'Team Lead / Chassis', email: 'avery.smith@vum.example.edu', year: 'Senior' },
  { name: 'Jordan Lee', role: 'Powertrain Lead', email: 'jordan.lee@vum.example.edu', year: 'Junior' },
  { name: 'Taylor Nguyen', role: 'Aerodynamics', email: 'taylor.nguyen@vum.example.edu', year: 'Sophomore' },
  { name: 'Riley Patel', role: 'Electronics & Controls', email: 'riley.patel@vum.example.edu', year: 'Freshman' }
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
      <Text style={styles.paragraph}>
        Vanderbilt University Motorsports (VUM) is a student-led engineering team at Vanderbilt University. We design, build, and compete with formula-style race cars
        in collegiate motorsport competitions. Our mission is to provide hands-on engineering experience, promote STEM education, and represent Vanderbilt with
        innovation and performance.
      </Text>

      <Text style={styles.subtitle}>What we do</Text>
      <Text style={styles.paragraph}>
        Each year our multidisciplinary team of undergraduates works across chassis, powertrain, aerodynamics, electronics, and business to produce a competitive
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
      <Text style={styles.title}>Current Car — VUM-01</Text>

      <Text style={styles.paragraph}>
        VUM-01 is our latest single-seat formula-style car designed for the collegiate Formula SAE-style competitions. It features a lightweight composite chassis,
        optimized aerodynamics package, and a high-efficiency powertrain tuned for track performance.
      </Text>

      <Text style={styles.subtitle}>Key specifications</Text>
      <Text style={styles.paragraph}>• Chassis: Carbon fiber monocoque (prototype)</Text>
      <Text style={styles.paragraph}>• Powertrain: 600cc 4-stroke engine with ECU mapping and data logging</Text>
      <Text style={styles.paragraph}>• Aerodynamics: Front and rear wings with undertray for balanced downforce</Text>
      <Text style={styles.paragraph}>• Suspension: Double-wishbone adjustable dampers</Text>
      <Text style={styles.paragraph}>• Brakes: Lightweight ventilated discs with custom calipers</Text>

      <Text style={styles.subtitle}>Recent highlights</Text>
      <Text style={styles.paragraph}>
        VUM-01 completed initial dynamic tests in spring and showed promising lap times during endurance shakedowns. We continue to iterate on aero and
        suspension setups to improve consistency and tire management.
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
  const [members, setMembers] = useState<Member[]>(TEAM_MEMBERS);
  const openMail = (email: string) => Linking.openURL(`mailto:${email}`);

  const updateYear = (email: string, year: string) => {
    setMembers((prev) => prev.map((m) => (m.email === email ? { ...m, year } : m)));
  };

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Contact the Team</Text>

      <Text style={styles.paragraph}>
        Reach out to our student leads for specific questions about engineering, sponsorship, or joining the team.
      </Text>

      <View style={styles.members}>
        {members.map((m) => (
          <View key={m.email} style={styles.member}>
            <Text style={styles.memberName}>{m.name}</Text>

            <View style={styles.yearRow}>
              <Text style={styles.yearLabel}>Year:</Text>
              <TextInput
                style={styles.yearInput}
                placeholder="e.g. Freshman, Sophomore"
                value={m.year || ''}
                onChangeText={(text) => updateYear(m.email, text)}
                accessible
                accessibilityLabel={`Year for ${m.name}`}
              />
            </View>

            <Text style={styles.memberRole}>{m.role}</Text>
            <Pressable onPress={() => openMail(m.email)}>
              <Text style={styles.memberEmail}>{m.email}</Text>
            </Pressable>
          </View>
        ))}
      </View>

      <Text style={[styles.paragraph, { marginTop: 12 }]}>Note: these values are stored in the app state — to persist them, update the TEAM_MEMBERS list in App.tsx or connect to a backend.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#0a2540'
  },
  brand: { color: 'white', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  nav: { flexDirection: 'row', gap: 10 },
  navButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: 'transparent'
  },
  navButtonPressed: { opacity: 0.7 },
  navButtonActive: { backgroundColor: '#1b5f9e' },
  navButtonText: { color: 'white', fontWeight: '600' },
  navButtonTextActive: { color: 'white' },
  content: { padding: 24, paddingBottom: 120 },
  page: { maxWidth: 900, alignSelf: 'center' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 12, color: '#0a2540' },
  subtitle: { fontSize: 18, fontWeight: '700', marginTop: 12, marginBottom: 6, color: '#0a2540' },
  paragraph: { fontSize: 16, color: '#222', lineHeight: 22, marginBottom: 8 },
  sponsorButton: { backgroundColor: '#c2872f', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, alignSelf: 'flex-start', marginTop: 8, marginBottom: 12 },
  sponsorButtonText: { color: 'white', fontWeight: '700' },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#eee', alignItems: 'center' },
  footerText: { color: '#666' },
  members: { marginTop: 12 },
  member: { marginBottom: 12, padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 8 },
  memberName: { fontWeight: '700' },
  memberRole: { color: '#444', marginBottom: 6 },
  memberEmail: { color: '#0066cc' },
  yearRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  yearLabel: { marginRight: 8, color: '#333' },
  yearInput: { borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6, minWidth: 160 }
});
