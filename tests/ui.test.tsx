import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import AIForecasts from '../src/components/dashboard/AIForecasts';
import AIInsightsBrief from '../src/components/dashboard/AIInsightsBrief';

describe('Tactical UI Rendering', () => {

    it('renders the AI Insights typewriter correctly', () => {
        const mockContent = "TACTICAL SUMMARY SECURED.";
        render(<AIInsightsBrief content={mockContent} />);

        // Framer motion is stubbed out in setup.ts so standard HTML prints the split characters.
        // It renders char by char in individual span wrappers, or as a continuous block depending on the stub text nodes.
        const header = screen.getByText('AI Intelligence Synthesis');
        expect(header).toBeInTheDocument();
        
        // Wait, because we split text into individual character spans:
        const charA = screen.getAllByText('A')[0];
        expect(charA).toBeInTheDocument();
    });

    it('renders the AIForecasts component with YES/NO bounds', () => {
        const mockForecasts = [
            {
                q: "Global Escalation Risk?",
                yes: 85,
                no: 15,
                category: "CONFLICT"
            }
        ];

        render(<AIForecasts metrics={mockForecasts} />);

        // Wait to find our specific question string
        const question = screen.getByText('Global Escalation Risk?');
        expect(question).toBeInTheDocument();

        // Check if the formatting prints exactly as per our specific style requests
        expect(screen.getByText('YES 85%')).toBeInTheDocument();
        expect(screen.getByText('NO 15%')).toBeInTheDocument();
        
        expect(screen.getByText('AI Probability Forecasts')).toBeInTheDocument();
    });
});
