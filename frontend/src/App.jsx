import React from 'react'
import { Routes, Route, Navigate } from 'react-router';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import HomePage from './pages/HomePage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import * as Sentry from "@sentry/react";

const SentryRoutes = Sentry.withSentryReactRouterV7Routing(Routes);


const App = () => {
  return (
    <>
    <button
      onClick={() => {
        throw new Error('3rd error');
      }}
    >
      Break the world
    </button>
      <SignedIn>
        <SentryRoutes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<Navigate to = {"/"} replace />} />
        </SentryRoutes>
      </SignedIn>

      <SignedOut>
       <SentryRoutes>
        <Route path="/auth" element={<AuthPage/>} />
        <Route path="*" element={<Navigate to = {"/auth"} replace />} />
        </SentryRoutes>
      </SignedOut>
    </>
  )
}

export default App;