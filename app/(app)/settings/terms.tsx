import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

export default function TermsScreen() {
  const theme = useTheme();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text variant="headlineMedium" style={styles.title}>Terms of Service</Text>

      <Text variant="titleMedium" style={styles.sectionTitle}>1. Acceptance of Terms</Text>
      <Text style={styles.paragraph}>
        By accessing or using Agatka Turbo, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service.
      </Text>

      <Text variant="titleMedium" style={styles.sectionTitle}>2. Service Description</Text>
      <Text style={styles.paragraph}>
        Agatka Turbo is a real-time messaging application that provides:
        {'\n'}- Instant messaging capabilities
        {'\n'}- Message degradation features
        {'\n'}- Friend management system
        {'\n'}- User profiles
      </Text>

      <Text variant="titleMedium" style={styles.sectionTitle}>3. User Accounts</Text>
      <Text style={styles.paragraph}>
        To use Agatka Turbo, you must:
        {'\n'}- Be at least 13 years old
        {'\n'}- Register with accurate information
        {'\n'}- Maintain account security
        {'\n'}- Not share accounts with others
        {'\n'}- Not create multiple accounts
      </Text>

      <Text variant="titleMedium" style={styles.sectionTitle}>4. User Conduct</Text>
      <Text style={styles.paragraph}>
        You agree not to:
        {'\n'}- Violate any laws or regulations
        {'\n'}- Harass or bully other users
        {'\n'}- Share inappropriate or harmful content
        {'\n'}- Attempt to breach security measures
        {'\n'}- Impersonate others
        {'\n'}- Spam or send unwanted messages
      </Text>

      <Text variant="titleMedium" style={styles.sectionTitle}>5. Message Policy</Text>
      <Text style={styles.paragraph}>
        Understanding our message system:
        {'\n'}- Messages automatically degrade after 24 hours
        {'\n'}- Deleted messages cannot be recovered
        {'\n'}- We do not guarantee message delivery
        {'\n'}- Messages may be monitored for policy violations
      </Text>

      <Text variant="titleMedium" style={styles.sectionTitle}>6. Intellectual Property</Text>
      <Text style={styles.paragraph}>
        All content and features of Agatka Turbo are protected by copyright, trademark, and other laws. Users may not copy, modify, or distribute our content without permission.
      </Text>

      <Text variant="titleMedium" style={styles.sectionTitle}>7. Termination</Text>
      <Text style={styles.paragraph}>
        We reserve the right to:
        {'\n'}- Suspend or terminate accounts
        {'\n'}- Remove any content
        {'\n'}- Block access to the service
        {'\n'}- Modify or discontinue the service
      </Text>

      <Text variant="titleMedium" style={styles.sectionTitle}>8. Disclaimer</Text>
      <Text style={styles.paragraph}>
        The service is provided "as is" without warranties of any kind. We are not responsible for:
        {'\n'}- Service interruptions
        {'\n'}- Data loss
        {'\n'}- Third-party actions
        {'\n'}- User-generated content
      </Text>

      <Text variant="titleMedium" style={styles.sectionTitle}>9. Limitation of Liability</Text>
      <Text style={styles.paragraph}>
        We shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service.
      </Text>

      <Text variant="titleMedium" style={styles.sectionTitle}>10. Changes to Terms</Text>
      <Text style={styles.paragraph}>
        We may modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
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