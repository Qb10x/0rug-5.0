// TokenCardPanel test - following 0rug.com coding guidelines

import { render, screen } from '@testing-library/react';
import { TokenCardPanel } from './TokenCardPanel';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

describe('TokenCardPanel', () => {
  it('renders token analysis header', () => {
    render(<TokenCardPanel />);
    
    expect(screen.getByText('Token Analysis')).toBeInTheDocument();
    expect(screen.getByText('Detailed token information and metrics')).toBeInTheDocument();
  });

  it('renders token cards with sample data', () => {
    render(<TokenCardPanel />);
    
    // Check for PEPE token
    expect(screen.getByText('PEPE')).toBeInTheDocument();
    expect(screen.getByText('Pepe')).toBeInTheDocument();
    expect(screen.getByText('$0.0000123')).toBeInTheDocument();
    
    // Check for BONK token
    expect(screen.getByText('BONK')).toBeInTheDocument();
    expect(screen.getByText('Bonk')).toBeInTheDocument();
    expect(screen.getByText('$0.00000089')).toBeInTheDocument();
  });

  it('displays key metrics for each token', () => {
    render(<TokenCardPanel />);
    
    // Check for liquidity and volume metrics
    expect(screen.getByText('Liquidity')).toBeInTheDocument();
    expect(screen.getByText('Volume')).toBeInTheDocument();
    expect(screen.getByText('Risk')).toBeInTheDocument();
    expect(screen.getByText('RugRisk')).toBeInTheDocument();
  });

  it('shows expandable sections', () => {
    render(<TokenCardPanel />);
    
    // Check for expandable section titles
    expect(screen.getByText('Token Details')).toBeInTheDocument();
    expect(screen.getByText('Whale Activity')).toBeInTheDocument();
    expect(screen.getByText('Trading Analysis')).toBeInTheDocument();
  });
}); 