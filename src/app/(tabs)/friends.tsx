import React from 'react';
import { Redirect } from 'expo-router';

export default function FriendsRedirect() {
  return <Redirect href="/?tab=friends" />;
}
