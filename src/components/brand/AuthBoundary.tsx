"use client";

import { Component, type ReactNode } from "react";
import { LandingPage } from "@/components/landing/LandingPage";

type AuthBoundaryProps = {
  children: ReactNode;
};

type AuthBoundaryState = {
  hasError: boolean;
};

export class AuthBoundary extends Component<AuthBoundaryProps, AuthBoundaryState> {
  state: AuthBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <LandingPage auth="static" />;
    }

    return this.props.children;
  }
}
