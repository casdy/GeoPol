'use server';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SubscribeResult {
  success?: string;
  error?: string;
}

export async function subscribe(email: string): Promise<SubscribeResult> {
  // 1. Validate input
  if (!email || typeof email !== 'string') {
    return { error: 'Please enter an email address.' };
  }

  const trimmed = email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(trimmed)) {
    return { error: 'Please enter a valid email address.' };
  }

  // 2. Check server config
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_AUDIENCE_ID) {
    console.error('SERVER CONFIG ERROR: RESEND_API_KEY or RESEND_AUDIENCE_ID is missing.');
    return { error: 'Service temporarily unavailable.' };
  }

  try {
    // 3. Add contact to Resend Audience
    const { data, error } = await resend.contacts.create({
      email: trimmed,
      audienceId: process.env.RESEND_AUDIENCE_ID,
    });

    if (error) {
      console.error('Resend contact creation error:', error);

      // Handle duplicate / already-subscribed
      if (
        error.message?.toLowerCase().includes('already') ||
        error.message?.toLowerCase().includes('exists') ||
        error.message?.toLowerCase().includes('duplicate')
      ) {
        return { success: "You're already on the list! ✓" };
      }

      return { error: 'Something went wrong. Please try again.' };
    }

    console.log('New subscriber added:', data?.id);
    return { success: "You're in! Watch for Pulse Daily in your inbox. 🎯" };

  } catch (err) {
    console.error('SECURE SERVER LOG - Subscribe Error:', err);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}
