import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

export default function PrivacyPolicyScreen() {
  const theme = useTheme();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text variant="headlineMedium" style={styles.title}>Privacy Policy</Text>
      
      <Text variant="titleMedium" style={styles.sectionTitle}>1. Information We Collect</Text>
      <Text style={styles.paragraph}>
        We collect information you provide directly to us, including:
        {'\n'}- Account information (email, username)
        {'\n'}- Messages you send through the app
        {'\n'}- Friend connections you make
        {'\n'}- Usage data and app activity
      </Text>

      <Text variant="titleMedium" style={styles.sectionTitle}>2. How We Use Your Information</Text>
      <Text style={styles.paragraph}>
        We use the information we collect to:
        {'\n'}- Provide and maintain the messaging service
        {'\n'}- Process and deliver your messages
        {'\n'}- Manage your account and preferences
        {'\n'}- Improve and develop new features
        {'\n'}- Ensure platform security
      </Text>

      <Text variant="titleMedium" style={styles.sectionTitle}>3. Message Privacy</Text>
      <Text style={styles.paragraph}>
        Our messaging system features:
        {'\n'}- End-to-end encryption for all messages
        {'\n'}- Automatic message degradation after 24 hours
        {'\n'}- No permanent storage of degraded messages
        {'\n'}- Option to delete messages at any time
      </Text>

      <Text variant="titleMedium" style={styles.sectionTitle}>4. Data Sharing</Text>
      <Text style={styles.paragraph}>
        We do not sell or share your personal information with third parties except:
        {'\n'}- With your explicit consent
        {'\n'}- To comply with legal obligations
        {'\n'}- To protect our rights and safety
      </Text>

      <Text variant="titleMedium" style={styles.sectionTitle}>5. Data Security</Text>
      <Text style={styles.paragraph}>
        We implement appropriate security measures to protect your data, including:
        {'\n'}- Encryption in transit and at rest
        {'\n'}- Regular security audits
        {'\n'}- Access controls and authentication
        {'\n'}- Secure data storage practices
      </Text>

      <Text variant="titleMedium" style={styles.sectionTitle}>6. Your Rights</Text>
      <Text style={styles.paragraph}>
        You have the right to:
        {'\n'}- Access your personal data
        {'\n'}- Correct inaccurate data
        {'\n'}- Delete your account and data
        {'\n'}- Object to data processing
        {'\n'}- Export your data
      </Text>

      <Text variant="titleMedium" style={styles.sectionTitle}>7. Changes to Policy</Text>
      <Text style={styles.paragraph}>
        We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the effective date.
      </Text>

      <Text variant="titleMedium" style={styles.sectionTitle}>8. Contact Us</Text>
      <Text style={styles.paragraph}>
        If you have any questions about this privacy policy or our practices, please contact us at privacy@agatka-turbo.com
      </Text>

      <Text style={styles.lastUpdated}>
        Last updated: April 4, 2024
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    marginBottom: 24,
    fontWeight: 'bold',
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  paragraph: {
    marginBottom: 16,
    lineHeight: 20,
  },
  lastUpdated: {
    marginTop: 32,
    fontStyle: 'italic',
  },
}); 