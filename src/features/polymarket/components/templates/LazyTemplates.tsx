import { lazy } from 'react';

// Lazy load templates for better code splitting and performance
export const TemplateA = lazy(() => 
  import('./TemplateA').then(module => ({ default: module.TemplateA }))
);

export const TemplateB = lazy(() => 
  import('./TemplateB').then(module => ({ default: module.TemplateB }))
);