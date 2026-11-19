'use client';
import React from 'react';
import { App } from '../src/App';
import { ThemeProvider } from '../src/context/ThemeContext';
import { AuthProvider } from '../src/context/AuthContext';
import { NotificationProvider } from '../src/context/NotificationContext';
export default function SkillSwapApp(){ return <ThemeProvider><AuthProvider><NotificationProvider><App/></NotificationProvider></AuthProvider></ThemeProvider>; }
