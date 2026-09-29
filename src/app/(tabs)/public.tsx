import React from 'react';
import { Redirect } from 'expo-router';

export default function PublicRedirect() {
  return <Redirect href="/?tab=local" />;
}
